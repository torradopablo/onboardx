import { User, CreateUserInput } from '@/domain/entities/User';

export interface IUserRepository {
  create(input: CreateUserInput & { password_hash: string }): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  update(id: string, updates: Partial<User>): Promise<User>;
  delete(id: string): Promise<void>;
}
