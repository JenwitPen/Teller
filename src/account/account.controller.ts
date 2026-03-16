import { Body, Controller, Get, Headers, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiHeader, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RequiredHeadersPipe } from '../common/pipes/required-headers.pipe';
import {
  CreateAccountDto,
  GetAccountQueryDto,
  UpdateBalanceDto,
  AccountResponseDto,
  CreateAccountResponseDto,
  UpdateBalanceResponseDto,
  UpdateAccountDto,
} from './dto/account.dto';

import { AccountService } from './account.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('accounts')
@ApiHeader({
  name: 'x-request-id',
  required: true,
  description: 'Unique request identifier',
})
@UseGuards(JwtAuthGuard)
@Controller('accounts')
export class AccountController {
  constructor(
    private readonly accountService: AccountService,
    private readonly requiredHeadersPipe: RequiredHeadersPipe,
  ) {}

  @Get()
  @ApiResponse({ type: [AccountResponseDto], status: 200, description: 'List of accounts retrieved' })
  async getAccounts(
    @Query() query: GetAccountQueryDto,
    @Headers() headers: Record<string, string | string[] | undefined>,
  ) {
    this.requiredHeadersPipe.transform(headers);
    return this.accountService.searchAccounts(query);
  }


  @Post()
  @ApiResponse({ type: CreateAccountResponseDto, status: 201, description: 'Account created successfully' })
  async createAccount(
    @Body() body: CreateAccountDto,
    @Headers() headers: Record<string, string | string[] | undefined>,
  ) {
    this.requiredHeadersPipe.transform(headers);
    return this.accountService.createAccount(
      body.account_id,
      body.balance,
      body.branch_code,
      body.account_type,
      body.currency_code,
      body.account_name,
    );
  }

  @Post('balance')
  @ApiResponse({ type: UpdateBalanceResponseDto, status: 201, description: 'Balance updated successfully' })
  async updateBalance(
    @Body() body: UpdateBalanceDto,
    @Headers() headers: Record<string, string | string[] | undefined>,
  ) {
    this.requiredHeadersPipe.transform(headers);
    return this.accountService.updateBalance(
      body.account_id,
      body.amount,
      body.transaction_type,
      body.branch_code,
      body.employee_id,
      body.description,
    );
  }

  @Post('balance/v2')
  @ApiResponse({ type: UpdateBalanceResponseDto, status: 201, description: 'Balance updated successfully (v2)' })
  async updateBalanceV2(
    @Body() body: UpdateBalanceDto,
    @Headers() headers: Record<string, string | string[] | undefined>,
  ) {
    this.requiredHeadersPipe.transform(headers);
    return this.accountService.updateBalanceV2(
      body.account_id,
      body.amount,
      body.transaction_type,
      body.branch_code,
      body.employee_id,
      body.description,
    );
  }

  @Post('edit')
  @ApiResponse({ type: AccountResponseDto, status: 200, description: 'Account updated successfully' })
  async updateAccount(
    @Body() body: UpdateAccountDto,
    @Headers() headers: Record<string, string | string[] | undefined>,
  ) {
    this.requiredHeadersPipe.transform(headers);
    return this.accountService.updateAccount(body);
  }
}

