import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ConfigService } from '../common/config/config.service';
import { RedisService } from '../common/redis/redis.service';
import { AccountRepository } from './account.repository';
import { TransactionHistoryRepository } from '../transaction-history/transaction-history.repository';
import { TransactionType } from './dto/account.dto';

@Injectable()
export class AccountService {
  constructor(
    private readonly config: ConfigService,
    private readonly dataSource: DataSource,
    private readonly redis: RedisService,
    private readonly accounts: AccountRepository,
    private readonly histories: TransactionHistoryRepository,
  ) {}

  async createAccount(
    accountId: string,
    balance: number,
    branchCode: string,
    accountType: string,
    currencyCode: string,
    accountName: string,
  ) {
    await this.accounts.createAccount(
      this.dataSource.manager,
      accountId,
      balance,
      branchCode,
      accountType,
      currencyCode,
      accountName,
    );
    return { account_id: accountId, balance, branch_code: branchCode, account_type: accountType, currency_code: currencyCode, account_name: accountName, status: 'ACTIVE', version: 1 };
  }

  async searchAccounts(query: any) {
    return this.accounts.search(this.dataSource.manager, query);
  }

  async getAccount(accountId: string) {
    const account = await this.accounts.getByAccountId(this.dataSource.manager, accountId);
    if (!account) {
      throw new BadRequestException('Account not found');
    }
    return account;
  }


  async updateBalance(accountId: string, amount: number, type: TransactionType, branchCode?: string, employeeId?: string, description?: string) {
    return this.updateBalanceWithTransaction(accountId, amount, type, false, branchCode, employeeId, description);
  }

  async updateBalanceV2(accountId: string, amount: number, type: TransactionType, branchCode?: string, employeeId?: string, description?: string) {
    return this.updateBalanceWithTransaction(accountId, amount, type, true, branchCode, employeeId, description);
  }

  private async updateBalanceWithTransaction(
    accountId: string,
    amount: number,
    type: TransactionType,
    useRedis: boolean,
    branchCode?: string,
    employeeId?: string,
    description?: string,
  ) {
    const lockKey = `lock:account:${accountId}`;
    let lockToken: string | null = null;

    if (useRedis) {
      lockToken = await this.redis.acquireLock(lockKey, 5000);
      if (!lockToken) {
        throw new ConflictException('Account is locked, try again');
      }
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('SERIALIZABLE');

    try {
      const account = await this.accounts.getForUpdate(queryRunner.manager, accountId);
      if (!account) {
        throw new BadRequestException('Account not found');
      }

      const newBalance =
        type === 'DEPOSIT' ? Number(account.balance) + amount : Number(account.balance) - amount;

      if (newBalance < 0) {
        throw new BadRequestException('Insufficient balance');
      }

      await this.accounts.updateBalance(queryRunner.manager, accountId, newBalance);
      await this.histories.insert(queryRunner.manager, {
        account_id: accountId,
        amount,
        balance_after: newBalance,
        transaction_type: type,
        description: description || null,
        branch_code: branchCode,
        employee_id: employeeId,
      });

      await queryRunner.commitTransaction();

      if (useRedis) {
        const cacheKey = `account:${accountId}`;
        await this.redis.setJson(
          cacheKey,
          { account_id: accountId, balance: newBalance },
          this.config.cacheTtlSeconds,
        );
      }

      return { account_id: accountId, balance: newBalance };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
      if (useRedis && lockToken) {
        await this.redis.releaseLock(lockKey, lockToken);
      }
    }
  }

  async updateAccount(data: any) {
    const { account_id, ...updateData } = data;
    const account = await this.accounts.getByAccountId(this.dataSource.manager, account_id);
    if (!account) {
      throw new BadRequestException('Account not found');
    }

    await this.accounts.updateAccount(this.dataSource.manager, account_id, updateData);
    return this.accounts.getByAccountId(this.dataSource.manager, account_id);
  }
}

