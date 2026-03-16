import { Body, Controller, Get, Headers, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiHeader, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RequiredHeadersPipe } from '../common/pipes/required-headers.pipe';
import {
  CreateTransactionHistoryDto,
  GetTransactionHistoryQueryDto,
  TransactionHistoryResponseDto,
  CreateTransactionHistoryResponseDto,
} from './dto/transaction-history.dto';
import { TransactionHistoryService } from './transaction-history.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('transaction-history')
@ApiHeader({
  name: 'x-request-id',
  required: true,
  description: 'Unique request identifier',
})
@UseGuards(JwtAuthGuard)
@Controller('transaction-history')
export class TransactionHistoryController {
  constructor(
    private readonly historyService: TransactionHistoryService,
    private readonly requiredHeadersPipe: RequiredHeadersPipe,
  ) { }

  @Get()
  @ApiResponse({ type: [TransactionHistoryResponseDto], status: 200, description: 'List of transaction history retrieved' })
  async list(
    @Query() query: GetTransactionHistoryQueryDto,
    @Headers() headers: Record<string, string | string[] | undefined>,
  ) {
    this.requiredHeadersPipe.transform(headers);
    return this.historyService.listByAccountId(query);
  }

  @Post()
  @ApiResponse({ type: CreateTransactionHistoryResponseDto, status: 201, description: 'Transaction history created logically' })
  async create(
    @Body() body: CreateTransactionHistoryDto,
    @Headers() headers: Record<string, string | string[] | undefined>,
  ) {
    this.requiredHeadersPipe.transform(headers);
    return this.historyService.create({
      account_id: body.account_id,
      amount: body.amount,
      balance_after: body.balance_after,
      transaction_type: body.transaction_type,
      description: body.description ?? null,
      branch_code: body.branch_code,
      employee_id: body.employee_id,
      created_at: new Date(),
    });
  }
}
