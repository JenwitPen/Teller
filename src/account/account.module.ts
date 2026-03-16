import { Module } from '@nestjs/common';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { AccountRepository } from './account.repository';
import { TransactionHistoryModule } from '../transaction-history/transaction-history.module';

@Module({
  imports: [TransactionHistoryModule],
  controllers: [AccountController],
  providers: [AccountService, AccountRepository],
  exports: [AccountService, AccountRepository],
})
export class AccountModule {}
