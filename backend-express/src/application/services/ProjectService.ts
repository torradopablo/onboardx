import { IProjectRepository } from '@/domain/repositories/IProjectRepository';
import { CreateProjectInput } from '@/domain/entities/Project';
import { env } from '@/config/env';

export class ProjectService {
  constructor(private projectRepository: IProjectRepository) {}

  async createProject(userId: string, input: CreateProjectInput) {
    const project = await this.projectRepository.create(userId, input);
    return project;
  }

  async getProject(id: string) {
    const project = await this.projectRepository.findById(id);
    if (!project) throw new Error('Project not found');
    return project;
  }

  async getUserProjects(userId: string) {
    return this.projectRepository.findByUser(userId);
  }

  async updateProject(id: string, updates: any) {
    const project = await this.projectRepository.findById(id);
    if (!project) throw new Error('Project not found');
    return this.projectRepository.update(id, updates);
  }

  async deleteProject(id: string) {
    await this.projectRepository.delete(id);
  }

  async getPublicLink(projectId: string) {
    const project = await this.projectRepository.findById(projectId);
    if (!project) throw new Error('Project not found');

    const link = `${env.FRONTEND_URL}/onboarding/${project.public_token}`;
    return { link, token: project.public_token };
  }

  async getProjectByToken(token: string) {
    const project = await this.projectRepository.findByToken(token);
    if (!project) throw new Error('Invalid onboarding link');
    return project;
  }
}
