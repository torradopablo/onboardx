import { query, queryOne } from '@/infrastructure/database/connection';
import { User, CreateUserInput } from '@/domain/entities/User';
import { IUserRepository } from '@/domain/repositories/IUserRepository';
import { v4 as uuidv4 } from 'uuid';

export class PostgresUserRepository implements IUserRepository {
  async create(input: CreateUserInput & { password_hash: string }): Promise<User> {
    const id = uuidv4();
    const now = new Date();

    const user = await queryOne<User>(
      `INSERT INTO users (id, email, password_hash, full_name, company_name, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [id, input.email, input.password_hash, input.full_name, input.company_name, now, now]
    );

    if (!user) throw new Error('Failed to create user');
    return user;
  }

  async findById(id: string): Promise<User | null> {
    return queryOne<User>('SELECT * FROM users WHERE id = $1', [id]);
  }

  async findByEmail(email: string): Promise<User | null> {
    return queryOne<User>('SELECT * FROM users WHERE email = $1', [email]);
  }

  async update(id: string, updates: Partial<User>): Promise<User> {
    const updateFields = Object.keys(updates)
      .filter((key) => updates[key as keyof User] !== undefined)
      .map((key, idx) => `${key} = $${idx + 1}`)
      .join(', ');

    const values = Object.values(updates).filter((v) => v !== undefined);
    values.push(new Date());
    values.push(id);

    const user = await queryOne<User>(
      `UPDATE users SET ${updateFields}, updated_at = $${values.length - 1}
       WHERE id = $${values.length}
       RETURNING *`,
      values
    );

    if (!user) throw new Error('User not found');
    return user;
  }

  async delete(id: string): Promise<void> {
    await query('DELETE FROM users WHERE id = $1', [id]);
  }
}
