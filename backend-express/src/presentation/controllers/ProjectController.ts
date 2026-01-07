import { Request, Response } from 'express';
import { ProjectService } from '@/application/services/ProjectService';
import { projectToDTO } from '@/domain/entities/Project';
import { z } from 'zod';

const createProjectSchema = z.object({
  client_name: z.string().min(1),
  client_email: z.string().email(),
  platforms: z.array(z.string()).min(1),
  notes: z.string().optional(),
});

export class ProjectController {
  constructor(private projectService: ProjectService) {}

  list = async (req: Request, res: Response) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const projects = await this.projectService.getUserProjects(req.userId);
      res.json(projects.map(projectToDTO));
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const data = createProjectSchema.parse(req.body);
      const project = await this.projectService.createProject(req.userId, data);
      res.status(201).json(projectToDTO(project));
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid input' });
      }
      res.status(400).json({ error: (error as Error).message });
    }
  };

  get = async (req: Request, res: Response) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const project = await this.projectService.getProject(req.params.id);
      if (project.user_id !== req.userId) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      res.json(projectToDTO(project));
    } catch (error) {
      res.status(404).json({ error: (error as Error).message });
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const project = await this.projectService.getProject(req.params.id);
      if (project.user_id !== req.userId) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const updated = await this.projectService.updateProject(req.params.id, req.body);
      res.json(projectToDTO(updated));
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };

  delete = async (req: Request, res: Response) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const project = await this.projectService.getProject(req.params.id);
      if (project.user_id !== req.userId) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      await this.projectService.deleteProject(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };

  getLink = async (req: Request, res: Response) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const project = await this.projectService.getProject(req.params.id);
      if (project.user_id !== req.userId) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const link = await this.projectService.getPublicLink(req.params.id);
      res.json(link);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };
}
