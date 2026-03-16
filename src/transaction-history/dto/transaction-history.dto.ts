import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { TransactionType } from '../../account/dto/account.dto';

import { Transform } from 'class-transformer';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GetTransactionHistoryQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  account_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  branch_code?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  employee_id?: string;

  @ApiPropertyOptional({ enum: TransactionType })
  @IsOptional()
  @IsEnum(TransactionType)
  transaction_type?: TransactionType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  start_date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  end_date?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  limit: number = 10;
}

export class CreateTransactionHistoryDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  account_id!: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  amount!: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  balance_after!: number;

  @ApiProperty({ enum: TransactionType })
  @IsEnum(TransactionType)
  transaction_type!: TransactionType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  branch_code?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  employee_id?: string;
}

export class TransactionHistoryResponseDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  account_id!: string;

  @ApiProperty()
  amount!: number;

  @ApiProperty()
  balance_after!: number;

  @ApiProperty({ enum: TransactionType })
  transaction_type!: TransactionType;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty()
  created_at!: Date;

  @ApiPropertyOptional()
  branch_code?: string;

  @ApiPropertyOptional()
  employee_id?: string;
}

export class CreateTransactionHistoryResponseDto {
  @ApiProperty()
  status!: string;
}
