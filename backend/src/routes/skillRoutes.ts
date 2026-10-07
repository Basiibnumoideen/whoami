import { Router } from 'express';
import { SkillController } from '../controllers/skillController';
import { authenticateAdmin } from '../middleware/authMiddleware';

const router = Router();

router.get('/', SkillController.getSkills);
router.post('/', authenticateAdmin, SkillController.createSkill);
router.put('/:idOrName', authenticateAdmin, SkillController.updateSkill);
router.delete('/:idOrName', authenticateAdmin, SkillController.deleteSkill);
router.patch('/reorder', authenticateAdmin, SkillController.reorderSkills);

export default router;
