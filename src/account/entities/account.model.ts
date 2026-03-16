import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('accounts')
export class Account {
  @PrimaryColumn({ type: 'nvarchar', length: 64 })
  account_id!: string;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  balance!: number;

  @Column({ type: 'nvarchar', length: 10 })
  branch_code!: string;

  @Column({ type: 'nvarchar', length: 20 })
  account_type!: string;

  @Column({ type: 'nvarchar', length: 3 })
  currency_code!: string;

  @Column({ type: 'nvarchar', length: 100 })
  account_name!: string;

  @Column({ type: 'nvarchar', length: 16, default: 'ACTIVE' })
  status!: string;

  @Column({ type: 'int', default: 1 })
  version!: number;

  @Column({ type: 'datetime2', nullable: true })
  closed_at!: Date | null;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
