import { Router } from 'express';
import { UploadController, uploadMiddleware } from '../controllers/uploadController';
import { authenticateAdmin } from '../middleware/authMiddleware';

const router = Router();

router.post(
  '/',
  authenticateAdmin,
  (req, res, next) => {
    uploadMiddleware.single('file')(req, res, (err: any) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          res.status(400).json({ success: false, message: 'File is too large. Maximum allowed size is 50MB.' });
          return;
        }
        res.status(400).json({ success: false, message: err.message || 'File upload rejected.' });
        return;
      }
      next();
    });
  },
  UploadController.uploadFile
);

export default router;
