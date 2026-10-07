import { Router } from 'express';
import { ServiceController } from '../controllers/serviceController';
import { authenticateAdmin } from '../middleware/authMiddleware';

const router = Router();

router.get('/', ServiceController.getServices);
router.post('/', authenticateAdmin, ServiceController.createService);
router.put('/:id', authenticateAdmin, ServiceController.updateService);
router.delete('/:id', authenticateAdmin, ServiceController.deleteService);

export default router;
