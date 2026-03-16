import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Min } from 'class-validator';

export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAW = 'WITHDRAW',
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAccountDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  account_id!: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  balance!: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  branch_code!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  account_type!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  currency_code!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  account_name!: string;
}

export class GetAccountQueryDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  account_id?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  branch_code?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  account_type?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsNumber()
  @IsOptional()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 10 })
  @IsNumber()
  @IsOptional()
  @Min(1)
  limit?: number = 10;
}


export class UpdateBalanceDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  account_id!: string;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  amount!: number;

  @ApiProperty({ enum: TransactionType })
  @IsEnum(TransactionType)
  transaction_type!: TransactionType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  branch_code?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  employee_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}

export class AccountResponseDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  account_id!: string;

  @ApiProperty()
  balance!: number;

  @ApiProperty()
  branch_code!: string;

  @ApiProperty()
  account_type!: string;

  @ApiProperty()
  currency_code!: string;

  @ApiProperty()
  account_name!: string;

  @ApiProperty()
  status!: string;

  @ApiProperty()
  version!: number;

  @ApiProperty()
  created_at!: Date;

  @ApiProperty()
  updated_at!: Date;

  @ApiPropertyOptional()
  closed_at?: Date;
}

export class UpdateAccountDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  account_id!: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  account_name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  account_type?: string;
  @ApiPropertyOptional()
  @IsOptional()
  branch_code?: string;
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  currency_code?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  version?: number;



  @ApiPropertyOptional()
  @IsOptional()
  closed_at?: Date;
}

export class CreateAccountResponseDto {
  @ApiProperty()
  account_id!: string;

  @ApiProperty()
  balance!: number;

  @ApiProperty()
  branch_code!: string;

  @ApiProperty()
  account_type!: string;

  @ApiProperty()
  currency_code!: string;

  @ApiProperty()
  account_name!: string;

  @ApiProperty()
  status!: string;

  @ApiProperty()
  version!: number;
}

export class UpdateBalanceResponseDto {
  @ApiProperty()
  account_id!: string;

  @ApiProperty()
  balance!: number;
}
