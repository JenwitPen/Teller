import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TransactionHistoryRepository } from './transaction-history.repository';
import { TransactionHistory } from './entities/transaction-history.model';
import { GetTransactionHistoryQueryDto } from './dto/transaction-history.dto';

@Injectable()
export class TransactionHistoryService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly histories: TransactionHistoryRepository,
  ) { }

  async listByAccountId(queryDto: GetTransactionHistoryQueryDto): Promise<{ data: TransactionHistory[]; total: number }> {
    return this.histories.listByAccountId(this.dataSource.manager, queryDto);
  }

  async create(history: Omit<TransactionHistory, 'id'>) {
    await this.histories.insertDirect(this.dataSource.manager, history);
    return { status: 'created' };
  }
}
