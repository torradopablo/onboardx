import { OnboardingProject, CreateProjectInput } from '@/domain/entities/Project';

export interface IProjectRepository {
  create(userId: string, input: CreateProjectInput): Promise<OnboardingProject>;
  findById(id: string): Promise<OnboardingProject | null>;
  findByToken(token: string): Promise<OnboardingProject | null>;
  findByUser(userId: string): Promise<OnboardingProject[]>;
  update(id: string, updates: Partial<OnboardingProject>): Promise<OnboardingProject>;
  delete(id: string): Promise<void>;
}
