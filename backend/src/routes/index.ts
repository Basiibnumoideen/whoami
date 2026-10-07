import { Router } from 'express';
import authRoutes from './authRoutes';
import projectRoutes from './projectRoutes';
import skillRoutes from './skillRoutes';
import blogRoutes from './blogRoutes';
import messageRoutes from './messageRoutes';
import settingsRoutes from './settingsRoutes';
import serviceRoutes from './serviceRoutes';
import experienceRoutes from './experienceRoutes';
import certificationRoutes from './certificationRoutes';
import testimonialRoutes from './testimonialRoutes';
import educationRoutes from './educationRoutes';
import analyticsRoutes from './analyticsRoutes';
import uploadRoutes from './uploadRoutes';

const apiRouter = Router();

// Mounting modules
apiRouter.use('/auth', authRoutes);
apiRouter.use('/projects', projectRoutes);
apiRouter.use('/skills', skillRoutes);
apiRouter.use('/blogs', blogRoutes);
apiRouter.use('/messages', messageRoutes);
apiRouter.use('/settings', settingsRoutes);
apiRouter.use('/services', serviceRoutes);
apiRouter.use('/experiences', experienceRoutes);
apiRouter.use('/profile', experienceRoutes); // Compatibility alias
apiRouter.use('/certifications', certificationRoutes);
apiRouter.use('/testimonials', testimonialRoutes);
apiRouter.use('/education', educationRoutes);
apiRouter.use('/analytics', analyticsRoutes);
apiRouter.use('/admin', analyticsRoutes);
apiRouter.use('/upload', uploadRoutes);

// Health check endpoint
apiRouter.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'Basi Portfolio API Core',
    timestamp: new Date().toISOString(),
  });
});

export default apiRouter;
