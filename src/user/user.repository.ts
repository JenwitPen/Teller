import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { User } from './entities/user.model';

@Injectable()
export class UserRepository {
  async findByUsername(
    manager: EntityManager,
    username: string,
  ): Promise<User | null> {
    const result = await manager.query(
      `
      SELECT id, username, password, created_at, branch_code, updated_at, status, employee_id, role
      FROM users
      WHERE username = @0;
      `,
      [username],
    );

    return result[0] || null;
  }
}
