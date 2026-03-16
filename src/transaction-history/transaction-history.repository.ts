import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { TransactionHistory } from './entities/transaction-history.model';

@Injectable()
export class TransactionHistoryRepository {
  async insert(
    manager: EntityManager,
    payload: Omit<TransactionHistory, 'id' | 'created_at'>,
  ): Promise<void> {
    await manager.insert(TransactionHistory, {
      account_id: payload.account_id,
      amount: payload.amount,
      balance_after: payload.balance_after,
      transaction_type: payload.transaction_type,
      description: payload.description || undefined,
      employee_id: payload.employee_id || undefined,
      branch_code: payload.branch_code || undefined,
      created_at: new Date(),
    });
  }

  async listByAccountId(
    manager: EntityManager,
    queryDto: import('./dto/transaction-history.dto').GetTransactionHistoryQueryDto,
  ): Promise<{ data: TransactionHistory[]; total: number }> {
    let whereClause = 'WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 0;

    if (queryDto.account_id) {
      whereClause += ` AND t.account_id = @${paramIndex++}`;
      params.push(queryDto.account_id);
    }

    if (queryDto.branch_code) {
      whereClause += ` AND t.branch_code = @${paramIndex++}`;
      params.push(queryDto.branch_code);
    }

    if (queryDto.employee_id) {
      whereClause += ` AND t.employee_id = @${paramIndex++}`;
      params.push(queryDto.employee_id);
    }

    if (queryDto.transaction_type) {
      whereClause += ` AND t.transaction_type = @${paramIndex++}`;
      params.push(queryDto.transaction_type);
    }

    if (queryDto.start_date) {
      whereClause += ` AND t.created_at >= @${paramIndex++}`;
      params.push(queryDto.start_date);
    }

    if (queryDto.end_date) {
      whereClause += ` AND t.created_at <= @${paramIndex++}`;
      params.push(queryDto.end_date);
    }

    const countQuery = `
      SELECT COUNT(*) as total
      FROM transaction_history t
      ${whereClause}
    `;

    const page = queryDto.page || 1;
    const limit = queryDto.limit || 10;
    const offset = (page - 1) * limit;

    const dataQuery = `
      SELECT t.id, t.account_id, a.account_name, t.amount, t.balance_after, t.transaction_type, t.description, t.created_at as transaction_date, t.branch_code, t.employee_id
      FROM transaction_history t
      LEFT JOIN accounts a ON t.account_id = a.account_id
      ${whereClause}
      ORDER BY t.id DESC
      OFFSET ${offset} ROWS
      FETCH NEXT ${limit} ROWS ONLY;
    `;

    const [countResult, dataResult] = await Promise.all([
      manager.query(countQuery, params),
      manager.query(dataQuery, params),
    ]);

    return {
      data: dataResult,
      total: parseInt(countResult[0]?.total || '0', 10),
    };
  }

  async insertDirect(
    manager: EntityManager,
    payload: Omit<TransactionHistory, 'id' | 'created_at'>,
  ): Promise<void> {
    await this.insert(manager, payload);
  }
}
