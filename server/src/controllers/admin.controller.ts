import { Response } from 'express';
import { issueService, userService } from '../services';
import { AuthenticatedRequest, IIssueFilter, IssueStatus, UserRole } from '../types';
import { ApiResponse, asyncHandler, MESSAGES } from '../utils';

/**
 * Get all issues (admin)
 * GET /api/admin/issues
 */
export const getAllIssues = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const filters: IIssueFilter = {
      category: req.query.category as any,
      status: req.query.status as any,
      priority: req.query.priority as any,
      assignedTo: req.query.assignedTo as string,
    };

    const result = await issueService.getAllIssues(filters, req.query);

    const response = ApiResponse.paginated(
      result.data,
      result.pagination,
      MESSAGES.ISSUE.FETCH_ALL_SUCCESS
    );
    res.status(response.statusCode).json(response);
  }
);

/**
 * Update issue status
 * PATCH /api/admin/issues/:id/status
 */
export const updateIssueStatus = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { status, remarks } = req.body;
    const adminId = req.user!._id.toString();

    const issue = await issueService.updateIssueStatus(
      id,
      adminId,
      status as IssueStatus,
      remarks
    );

    const response = ApiResponse.success(issue, MESSAGES.ISSUE.STATUS_UPDATE_SUCCESS);
    res.status(response.statusCode).json(response);
  }
);

/**
 * Assign issue to admin
 * PATCH /api/admin/issues/:id/assign
 */
export const assignIssue = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const adminId = req.user!._id.toString();

    const issue = await issueService.assignIssue(id, adminId);

    const response = ApiResponse.success(issue, 'Issue assigned successfully');
    res.status(response.statusCode).json(response);
  }
);

/**
 * Assign issue to specific admin
 * PATCH /api/admin/issues/:id/assign/:adminId
 */
export const assignIssueToAdmin = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id, adminId } = req.params;

    // Verify target is an admin
    const targetAdmin = await userService.getUserById(adminId);
    if (targetAdmin.role !== UserRole.ADMIN) {
      const response = ApiResponse.success(null, 'Target user is not an admin');
      res.status(400).json({ ...response, success: false, statusCode: 400 });
      return;
    }

    const issue = await issueService.assignIssue(id, adminId);

    const response = ApiResponse.success(issue, 'Issue assigned successfully');
    res.status(response.statusCode).json(response);
  }
);

/**
 * Add remarks to issue
 * PATCH /api/admin/issues/:id/remarks
 */
export const addRemarks = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { remarks } = req.body;
    const adminId = req.user!._id.toString();

    const issue = await issueService.addRemarks(id, adminId, remarks);

    const response = ApiResponse.success(issue, 'Remarks added successfully');
    res.status(response.statusCode).json(response);
  }
);

/**
 * Mark issue as resolved
 * PATCH /api/admin/issues/:id/resolve
 */
export const resolveIssue = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { remarks } = req.body;
    const adminId = req.user!._id.toString();

    const issue = await issueService.updateIssueStatus(
      id,
      adminId,
      IssueStatus.RESOLVED,
      remarks || 'Issue has been resolved'
    );

    const response = ApiResponse.success(issue, 'Issue marked as resolved');
    res.status(response.statusCode).json(response);
  }
);

/**
 * Get all users (admin)
 * GET /api/admin/users
 */
export const getAllUsers = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const filters = {
      role: req.query.role as UserRole,
      isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
      search: req.query.search as string,
    };

    const result = await userService.getAllUsers(filters, req.query);

    const response = ApiResponse.paginated(
      result.data,
      result.pagination,
      'Users fetched successfully'
    );
    res.status(response.statusCode).json(response);
  }
);

/**
 * Toggle user active status
 * PATCH /api/admin/users/:id/toggle-status
 */
export const toggleUserStatus = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    const user = await userService.toggleUserStatus(id);

    const response = ApiResponse.success(
      user,
      `User ${user.isActive ? 'activated' : 'deactivated'} successfully`
    );
    res.status(response.statusCode).json(response);
  }
);

/**
 * Update user role
 * PATCH /api/admin/users/:id/role
 */
export const updateUserRole = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { role } = req.body;

    const user = await userService.updateUserRole(id, role as UserRole);

    const response = ApiResponse.success(user, 'User role updated successfully');
    res.status(response.statusCode).json(response);
  }
);

/**
 * Delete user
 * DELETE /api/admin/users/:id
 */
export const deleteUser = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    // Prevent self-deletion
    if (id === req.user!._id.toString()) {
      const response = ApiResponse.success(null, 'Cannot delete your own account');
      res.status(400).json({ ...response, success: false, statusCode: 400 });
      return;
    }

    await userService.deleteUser(id);

    const response = ApiResponse.noContent('User deleted successfully');
    res.status(response.statusCode).json(response);
  }
);

/**
 * Get dashboard statistics
 * GET /api/admin/stats
 */
export const getDashboardStats = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const [issueStats, userStats] = await Promise.all([
      issueService.getIssueStats(),
      userService.getUserStats(),
    ]);

    const response = ApiResponse.success(
      {
        issues: issueStats,
        users: userStats,
      },
      'Dashboard statistics fetched successfully'
    );
    res.status(response.statusCode).json(response);
  }
);

