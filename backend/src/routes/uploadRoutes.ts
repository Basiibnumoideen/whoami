import { Router } from 'express';
import { UploadController, uploadMiddleware } from '../controllers/uploadController';
import { authenticateAdmin } from '../middleware/authMiddleware';

const router = Router();

router.post(
  '/',
  authenticateAdmin,
  uploadMiddleware.single('file'),
  UploadController.uploadFile
);

export default router;
