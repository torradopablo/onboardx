import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '@/config/env';
import { IUserRepository } from '@/domain/repositories/IUserRepository';
import { CreateUserInput, userToDTO } from '@/domain/entities/User';

export class AuthService {
  constructor(private userRepository: IUserRepository) {}

  async register(input: CreateUserInput) {
    const existingUser = await this.userRepository.findByEmail(input.email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    const password_hash = await bcrypt.hash(input.password, 10);

    const user = await this.userRepository.create({
      ...input,
      password_hash,
    });

    const token = this.generateAccessToken(user.id);

    return {
      user: userToDTO(user),
      token,
    };
  }

  async login(email: string, password: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    const token = this.generateAccessToken(user.id);

    return {
      user: userToDTO(user),
      token,
    };
  }

  async getCurrentUser(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    return userToDTO(user);
  }

  generateAccessToken(userId: string): string {
    return jwt.sign({ userId }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    });
  }

  verifyToken(token: string): { userId: string } {
    try {
      return jwt.verify(token, env.JWT_SECRET) as { userId: string };
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
}
