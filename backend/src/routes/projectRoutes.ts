import { Router } from 'express';
import { ProjectController } from '../controllers/projectController';
import { authenticateAdmin } from '../middleware/authMiddleware';

const router = Router();

router.get('/', ProjectController.getProjects);
router.get('/:idOrSlug', ProjectController.getProject);
router.post('/', authenticateAdmin, ProjectController.createProject);
router.put('/:idOrSlug', authenticateAdmin, ProjectController.updateProject);
router.delete('/:idOrSlug', authenticateAdmin, ProjectController.deleteProject);
router.patch('/reorder', authenticateAdmin, ProjectController.reorderProjects);

export default router;
