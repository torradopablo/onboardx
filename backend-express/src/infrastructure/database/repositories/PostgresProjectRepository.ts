import { query, queryOne } from '@/infrastructure/database/connection';
import { OnboardingProject, CreateProjectInput } from '@/domain/entities/Project';
import { IProjectRepository } from '@/domain/repositories/IProjectRepository';
import { v4 as uuidv4 } from 'uuid';

export class PostgresProjectRepository implements IProjectRepository {
  async create(userId: string, input: CreateProjectInput): Promise<OnboardingProject> {
    const id = uuidv4();
    const public_token = uuidv4().toString();
    const now = new Date();

    const project = await queryOne<any>(
      `INSERT INTO onboarding_projects
       (id, user_id, client_name, client_email, public_token, platforms, notes, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        id,
        userId,
        input.client_name,
        input.client_email,
        public_token,
        JSON.stringify(input.platforms),
        input.notes,
        now,
        now,
      ]
    );

    if (!project) throw new Error('Failed to create project');

    return {
      ...project,
      platforms: Array.isArray(project.platforms) ? project.platforms : [],
    };
  }

  async findById(id: string): Promise<OnboardingProject | null> {
    const project = await queryOne<any>(
      'SELECT * FROM onboarding_projects WHERE id = $1',
      [id]
    );
    return project
      ? {
          ...project,
          platforms: Array.isArray(project.platforms) ? project.platforms : [],
        }
      : null;
  }

  async findByToken(token: string): Promise<OnboardingProject | null> {
    const project = await queryOne<any>(
      'SELECT * FROM onboarding_projects WHERE public_token = $1',
      [token]
    );
    return project
      ? {
          ...project,
          platforms: Array.isArray(project.platforms) ? project.platforms : [],
        }
      : null;
  }

  async findByUser(userId: string): Promise<OnboardingProject[]> {
    const projects = await query<any>(
      'SELECT * FROM onboarding_projects WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    return projects.map((p) => ({
      ...p,
      platforms: Array.isArray(p.platforms) ? p.platforms : [],
    }));
  }

  async update(id: string, updates: Partial<OnboardingProject>): Promise<OnboardingProject> {
    const updateFields = Object.keys(updates)
      .map((key, idx) => `${key} = $${idx + 1}`)
      .join(', ');

    const values = Object.values(updates);
    values.push(new Date());
    values.push(id);

    const project = await queryOne<any>(
      `UPDATE onboarding_projects SET ${updateFields}, updated_at = $${
        values.length - 1
      } WHERE id = $${values.length} RETURNING *`,
      values
    );

    if (!project) throw new Error('Project not found');

    return {
      ...project,
      platforms: Array.isArray(project.platforms) ? project.platforms : [],
    };
  }

  async delete(id: string): Promise<void> {
    await query('DELETE FROM onboarding_projects WHERE id = $1', [id]);
  }
}
