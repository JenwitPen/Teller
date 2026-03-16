import { Module } from '@nestjs/common';
import { TransactionHistoryController } from './transaction-history.controller';
import { TransactionHistoryService } from './transaction-history.service';
import { TransactionHistoryRepository } from './transaction-history.repository';

@Module({
  controllers: [TransactionHistoryController],
  providers: [TransactionHistoryService, TransactionHistoryRepository],
  exports: [TransactionHistoryService, TransactionHistoryRepository],
})
export class TransactionHistoryModule {}
