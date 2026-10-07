import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticateAdmin } from '../middleware/authMiddleware';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/login', authLimiter, AuthController.login);
router.post('/logout', authenticateAdmin, AuthController.logout);
router.get('/profile', authenticateAdmin, AuthController.getProfile);
router.get('/me', authenticateAdmin, AuthController.getProfile);
router.post('/change-password', authenticateAdmin, AuthController.changePassword);

export default router;
