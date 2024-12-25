import { Router } from 'express';
import { userController } from '../controllers';
import {
    authenticate,
    handleMulterError,
    mongoIdParamSchema,
    updateProfileSchema,
    uploadSingleImage,
    validate,
} from '../middlewares';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/users/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', userController.getProfile);

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put(
  '/profile',
  uploadSingleImage,
  handleMulterError,
  validate(updateProfileSchema),
  userController.updateProfile
);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private (Admin or Self)
 */
router.get('/:id', validate(mongoIdParamSchema), userController.getUserById);

export default router;
