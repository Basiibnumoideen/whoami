import { Router } from 'express';
import { TestimonialController } from '../controllers/testimonialController';
import { authenticateAdmin } from '../middleware/authMiddleware';

const router = Router();

router.get('/', TestimonialController.getTestimonials);
router.post('/', authenticateAdmin, TestimonialController.createTestimonial);
router.put('/:id', authenticateAdmin, TestimonialController.updateTestimonial);
router.delete('/:id', authenticateAdmin, TestimonialController.deleteTestimonial);

export default router;
