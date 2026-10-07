import { Response } from 'express';
import multer from 'multer';
import { CloudinaryService } from '../services/cloudinaryService';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

// Multer memory storage configuration
const storage = multer.memoryStorage();

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'application/pdf',
]);

const ALLOWED_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.gif',
  '.svg',
  '.pdf',
]);

export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const ext = file.originalname.slice(file.originalname.lastIndexOf('.')).toLowerCase();
    if (ALLOWED_MIME_TYPES.has(file.mimetype) && ALLOWED_EXTENSIONS.has(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only standard images and PDF files are allowed.'));
    }
  },
});

export class UploadController {
  /**
   * POST /api/upload (Admin only)
   */
  static async uploadFile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, message: 'No file uploaded.' });
        return;
      }

      // Sanitize target folder to alphanumeric and hyphens/underscores to prevent path traversal
      const rawFolder = (req.body.folder as string) || 'uploads';
      const folder = rawFolder.replace(/[^a-zA-Z0-9_\-]/g, '') || 'uploads';
      const isPdf = req.file.mimetype === 'application/pdf';
      const resourceType: 'auto' | 'raw' = isPdf ? 'raw' : 'auto';

      const result = await CloudinaryService.uploadBuffer(
        req.file.buffer,
        folder,
        resourceType
      );

      res.status(200).json({
        success: true,
        message: 'File uploaded successfully.',
        data: {
          url: result.url,
          public_id: result.public_id,
          bytes: result.bytes,
          mimetype: req.file.mimetype,
          originalName: req.file.originalname,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'File upload failed. Please verify the file and try again.',
      });
    }
  }
}

export default UploadController;
