import { Router } from 'express';
import { ExperienceController } from '../controllers/experienceController';
import { authenticateAdmin } from '../middleware/authMiddleware';

const router = Router();

// Experiences
router.get('/', ExperienceController.getExperiences);
router.get('/experiences', ExperienceController.getExperiences);
router.post('/', authenticateAdmin, ExperienceController.createExperience);
router.post('/experiences', authenticateAdmin, ExperienceController.createExperience);
router.put('/:id', authenticateAdmin, ExperienceController.updateExperience);
router.delete('/:id', authenticateAdmin, ExperienceController.deleteExperience);

// Now status single record
router.get('/now', ExperienceController.getNow);
router.put('/now', authenticateAdmin, ExperienceController.updateNow);

// AI Grounding Knowledge Base
router.get('/ai-kb', ExperienceController.getAIKnowledge);
router.post('/ai-kb', authenticateAdmin, ExperienceController.createAIKnowledge);
router.delete('/ai-kb/:id', authenticateAdmin, ExperienceController.deleteAIKnowledge);

export default router;
