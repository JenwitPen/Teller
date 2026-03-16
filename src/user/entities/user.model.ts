import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'nvarchar', length: 64 })
  username!: string;

  @Column({ type: 'nvarchar', length: 255, nullable: true })
  password?: string;

  @CreateDateColumn()
  created_at!: Date;

  @Column({ type: 'nvarchar', length: 64, nullable: true })
  branch_code?: string;

  @UpdateDateColumn()
  updated_at?: Date;

  @Column({ type: 'nvarchar', length: 16, default: 'ACTIVE' })
  status?: 'ACTIVE' | 'INACTIVE';

  @Column({ type: 'nvarchar', length: 64, nullable: true })
  employee_id?: string;

  @Column({ type: 'nvarchar', length: 20, default: 'TELLER' })
  role?: 'ADMIN' | 'TELLER';
}
