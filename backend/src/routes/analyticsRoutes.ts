import { Router } from 'express';
import { AnalyticsController } from '../controllers/analyticsController';
import { authenticateAdmin } from '../middleware/authMiddleware';

const router = Router();

router.get('/dashboard', authenticateAdmin, AnalyticsController.getDashboardStats);
router.post('/visitor', AnalyticsController.recordVisitor);
router.post('/page-view', AnalyticsController.recordPageView);
router.post('/pageview', AnalyticsController.recordPageView);
router.post('/project-view', AnalyticsController.recordProjectView);
router.post('/resume-download', AnalyticsController.recordResumeDownload);
router.get('/audit-logs', authenticateAdmin, AnalyticsController.getAuditLogs);

export default router;
