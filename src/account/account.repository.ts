import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { Account } from './entities/account.model';

@Injectable()
export class AccountRepository {
  async createAccount(
    manager: EntityManager,
    accountId: string,
    balance: number,
    branchCode: string,
    accountType: string,
    currencyCode: string,
    accountName: string,
  ): Promise<void> {
    await manager.insert(Account, {
      account_id: accountId,
      balance,
      branch_code: branchCode,
      account_type: accountType,
      currency_code: currencyCode,
      account_name: accountName,
      status: 'ACTIVE',
      version: 1,
      created_at: new Date(),
      updated_at: new Date(),
    });
  }

  async search(
    manager: EntityManager,
    query: {
      account_id?: string;
      branch_code?: string;
      account_type?: string;
      page?: number;
      limit?: number;
    },
  ): Promise<Account[]> {
    const { account_id, branch_code, account_type, page = 1, limit = 10 } = query;
    const offset = (page - 1) * limit;

    let sql = `
      SELECT account_id, balance, branch_code, account_type, currency_code, account_name, status, version, closed_at, created_at, updated_at
      FROM accounts
      WHERE 1=1
    `;
    const params: any[] = [];

    if (account_id) {
      sql += ` AND account_id LIKE @${params.length}`;
      params.push(`%${account_id}%`);
    }

    if (branch_code) {
      sql += ` AND branch_code = @${params.length}`;
      params.push(branch_code);
    }

    if (account_type) {
      sql += ` AND account_type = @${params.length}`;
      params.push(account_type);
    }

    sql += `
      ORDER BY created_at DESC
      OFFSET @${params.length} ROWS
      FETCH NEXT @${params.length + 1} ROWS ONLY
    `;
    params.push(offset);
    params.push(limit);

    return manager.query(sql, params);
  }

  async getByAccountId(
    manager: EntityManager,
    accountId: string,
  ): Promise<Account | null> {
    const result = await manager.query(
      `
      SELECT account_id, balance, branch_code, account_type, currency_code, account_name, status, version, closed_at, created_at, updated_at
      FROM accounts
      WHERE account_id = @0;
      `,
      [accountId],
    );

    return result[0] || null;
  }


  async getForUpdate(
    manager: EntityManager,
    accountId: string,
  ): Promise<Account | null> {
    const result = await manager.query(
      `
      SELECT account_id, balance, branch_code, account_type, currency_code, account_name, status, version, closed_at, created_at, updated_at
      FROM accounts WITH (UPDLOCK, ROWLOCK)
      WHERE account_id = @0;
      `,
      [accountId],
    );

    return result[0] || null;
  }

  async updateBalance(
    manager: EntityManager,
    accountId: string,
    newBalance: number,
  ): Promise<void> {
    await manager.update(Account, { account_id: accountId }, { balance: newBalance });
  }

  async updateAccount(
    manager: EntityManager,
    accountId: string,
    data: Partial<Account>,
  ): Promise<void> {
    await manager.update(Account, { account_id: accountId }, data);
  }
}

