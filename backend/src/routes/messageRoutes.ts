import { Router } from 'express';
import { MessageController } from '../controllers/messageController';
import { authenticateAdmin } from '../middleware/authMiddleware';
import { contactLimiter } from '../middleware/rateLimiter';

const router = Router();

router.get('/', authenticateAdmin, MessageController.getMessages);
router.post('/', contactLimiter, MessageController.createMessage);
router.patch('/:id/read', authenticateAdmin, MessageController.toggleRead);
router.delete('/:id', authenticateAdmin, MessageController.deleteMessage);

export default router;
