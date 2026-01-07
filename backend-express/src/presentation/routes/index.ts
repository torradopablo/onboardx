import { Router, Request, Response } from 'express';
import { authMiddleware } from '@/presentation/middleware/authMiddleware';
import { AuthController } from '@/presentation/controllers/AuthController';
import { ProjectController } from '@/presentation/controllers/ProjectController';
import { PostgresUserRepository } from '@/infrastructure/database/repositories/PostgresUserRepository';
import { PostgresProjectRepository } from '@/infrastructure/database/repositories/PostgresProjectRepository';
import { AuthService } from '@/application/services/AuthService';
import { ProjectService } from '@/application/services/ProjectService';

const router = Router();

// Initialize repositories and services
const userRepository = new PostgresUserRepository();
const projectRepository = new PostgresProjectRepository();
const authService = new AuthService(userRepository);
const projectService = new ProjectService(projectRepository);

const authController = new AuthController(authService);
const projectController = new ProjectController(projectService);

// Auth routes
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/me', authMiddleware, authController.getCurrentUser);

// Project routes
router.get('/projects', authMiddleware, projectController.list);
router.post('/projects', authMiddleware, projectController.create);
router.get('/projects/:id', authMiddleware, projectController.get);
router.put('/projects/:id', authMiddleware, projectController.update);
router.delete('/projects/:id', authMiddleware, projectController.delete);
router.get('/projects/:id/link', authMiddleware, projectController.getLink);

// Onboarding routes (public)
router.get('/onboarding/:token', async (req: Request, res: Response) => {
  try {
    const project = await projectService.getProjectByToken(req.params.token);
    res.json({
      project,
      accesses: [],
      files: [],
    });
  } catch (error) {
    res.status(404).json({ error: 'Not found' });
  }
});

router.post('/onboarding/:token/complete', async (req: Request, res: Response) => {
  try {
    const project = await projectService.getProjectByToken(req.params.token);
    const updated = await projectService.updateProject(project.id, {
      status: 'completed',
      completed_at: new Date(),
    });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// Health check
router.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

export default router;
