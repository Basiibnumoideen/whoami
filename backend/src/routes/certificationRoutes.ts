import { Router } from 'express';
import { CertificationController } from '../controllers/certificationController';
import { authenticateAdmin } from '../middleware/authMiddleware';

const router = Router();

router.get('/', CertificationController.getCertifications);
router.post('/', authenticateAdmin, CertificationController.createCertification);
router.put('/:id', authenticateAdmin, CertificationController.updateCertification);
router.delete('/:id', authenticateAdmin, CertificationController.deleteCertification);

export default router;
