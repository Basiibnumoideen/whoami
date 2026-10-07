import { Router } from 'express';
import { BlogController } from '../controllers/blogController';
import { authenticateAdmin } from '../middleware/authMiddleware';

const router = Router();

router.get('/', BlogController.getBlogs);
router.get('/:idOrSlug', BlogController.getBlog);
router.post('/', authenticateAdmin, BlogController.createBlog);
router.put('/:idOrSlug', authenticateAdmin, BlogController.updateBlog);
router.delete('/:idOrSlug', authenticateAdmin, BlogController.deleteBlog);

export default router;
