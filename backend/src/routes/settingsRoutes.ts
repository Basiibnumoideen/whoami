import { Router } from 'express';
import { SettingsController } from '../controllers/settingsController';
import { authenticateAdmin } from '../middleware/authMiddleware';

const router = Router();

router.get('/', SettingsController.getSettings);
router.put('/', authenticateAdmin, SettingsController.updateSettings);

export default router;
