import { Router } from 'express';
import { EducationController } from '../controllers/educationController';
import { authenticateAdmin } from '../middleware/authMiddleware';

const router = Router();

router.get('/', EducationController.getEducation);
router.post('/', authenticateAdmin, EducationController.createEducation);
router.put('/:id', authenticateAdmin, EducationController.updateEducation);
router.delete('/:id', authenticateAdmin, EducationController.deleteEducation);

export default router;
