export type TransactionType = 'DEPOSIT' | 'WITHDRAW';

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('transaction_history')
export class TransactionHistory {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'nvarchar', length: 64 })
  account_id!: string;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  amount!: number;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  balance_after!: number;

  @Column({ type: 'nvarchar', length: 16 })
  transaction_type!: TransactionType;

  @Column({ type: 'nvarchar', length: 255, nullable: true })
  description!: string | null;

  @CreateDateColumn()
  created_at!: Date;

  @Column({ type: 'nvarchar', length: 64, nullable: true })
  branch_code?: string;

  @Column({ type: 'nvarchar', length: 64, nullable: true })
  employee_id?: string;
}
