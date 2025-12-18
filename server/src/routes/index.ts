import { Router } from 'express';
import authRoutes from './auth.routes';
import issueRoutes from './issue.routes';
import adminRoutes from './admin.routes';
import userRoutes from './user.routes';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Campus FixIt API is running',
    timestamp: new Date().toISOString(),
  });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/issues', issueRoutes);
router.use('/admin', adminRoutes);
router.use('/users', userRoutes);

export default router;

