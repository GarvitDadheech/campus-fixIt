import { Router } from 'express';
import { adminController } from '../controllers';
import {
    addRemarksSchema,
    adminOnly,
    authenticate,
    issueFilterSchema,
    mongoIdAdminParamSchema,
    mongoIdParamSchema,
    updateIssueStatusSchema,
    updateUserRoleSchema,
    userFilterSchema,
    validate,
} from '../middlewares';

const router = Router();

// All routes require authentication and admin role
router.use(authenticate);
router.use(adminOnly);

// ==================== ISSUE MANAGEMENT ====================

/**
 * @route   GET /api/admin/issues
 * @desc    Get all issues
 * @access  Private (Admin)
 */
router.get('/issues', validate(issueFilterSchema), adminController.getAllIssues);

/**
 * @route   PATCH /api/admin/issues/:id/status
 * @desc    Update issue status
 * @access  Private (Admin)
 */
router.patch(
  '/issues/:id/status',
  validate(updateIssueStatusSchema),
  adminController.updateIssueStatus
);

/**
 * @route   PATCH /api/admin/issues/:id/assign
 * @desc    Assign issue to self
 * @access  Private (Admin)
 */
router.patch(
  '/issues/:id/assign',
  validate(mongoIdParamSchema),
  adminController.assignIssue
);

/**
 * @route   PATCH /api/admin/issues/:id/assign/:adminId
 * @desc    Assign issue to specific admin
 * @access  Private (Admin)
 */
router.patch(
  '/issues/:id/assign/:adminId',
  validate(mongoIdAdminParamSchema),
  adminController.assignIssueToAdmin
);

/**
 * @route   PATCH /api/admin/issues/:id/remarks
 * @desc    Add remarks to issue
 * @access  Private (Admin)
 */
router.patch(
  '/issues/:id/remarks',
  validate(addRemarksSchema),
  adminController.addRemarks
);

/**
 * @route   PATCH /api/admin/issues/:id/resolve
 * @desc    Mark issue as resolved
 * @access  Private (Admin)
 */
router.patch(
  '/issues/:id/resolve',
  validate(mongoIdParamSchema),
  adminController.resolveIssue
);

// ==================== USER MANAGEMENT ====================

/**
 * @route   GET /api/admin/users
 * @desc    Get all users
 * @access  Private (Admin)
 */
router.get('/users', validate(userFilterSchema), adminController.getAllUsers);

/**
 * @route   PATCH /api/admin/users/:id/toggle-status
 * @desc    Toggle user active status
 * @access  Private (Admin)
 */
router.patch(
  '/users/:id/toggle-status',
  validate(mongoIdParamSchema),
  adminController.toggleUserStatus
);

/**
 * @route   PATCH /api/admin/users/:id/role
 * @desc    Update user role
 * @access  Private (Admin)
 */
router.patch(
  '/users/:id/role',
  validate(updateUserRoleSchema),
  adminController.updateUserRole
);

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete user
 * @access  Private (Admin)
 */
router.delete(
  '/users/:id',
  validate(mongoIdParamSchema),
  adminController.deleteUser
);

// ==================== DASHBOARD ====================

/**
 * @route   GET /api/admin/stats
 * @desc    Get dashboard statistics
 * @access  Private (Admin)
 */
router.get('/stats', adminController.getDashboardStats);

export default router;
