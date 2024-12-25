import { Response } from 'express';
import { issueService, uploadService, emailService } from '../services';
import { ApiResponse, asyncHandler, MESSAGES, CATEGORY_DISPLAY_NAMES, PRIORITY_DISPLAY_NAMES } from '../utils';
import { AuthenticatedRequest, IIssueFilter, UserRole } from '../types';

/**
 * Create a new issue
 * POST /api/issues
 */
export const createIssue = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!._id.toString();
    let imageUrl: string | undefined;
    let imagePublicId: string | undefined;

    // Upload image if provided
    if (req.file) {
      const uploadResult = await uploadService.uploadImage(req.file);
      imageUrl = uploadResult.url;
      imagePublicId = uploadResult.publicId;
    }

    const issue = await issueService.createIssue(req.body, userId, imageUrl, imagePublicId);

    // Send confirmation email (non-blocking)
    emailService.sendIssueCreatedEmail(
      req.user!.email,
      req.user!.name,
      issue.title,
      issue._id.toString(),
      CATEGORY_DISPLAY_NAMES[issue.category],
      PRIORITY_DISPLAY_NAMES[issue.priority]
    );

    const response = ApiResponse.created(issue, MESSAGES.ISSUE.CREATE_SUCCESS);
    res.status(response.statusCode).json(response);
  }
);

/**
 * Get issue by ID
 * GET /api/issues/:id
 */
export const getIssueById = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const issue = await issueService.getIssueById(id);

    // Students can only view their own issues or all if admin
    if (
      req.user!.role === UserRole.STUDENT &&
      issue.reportedBy._id.toString() !== req.user!._id.toString()
    ) {
      const response = ApiResponse.success(null, MESSAGES.AUTH.UNAUTHORIZED);
      res.status(403).json({ ...response, success: false, statusCode: 403 });
      return;
    }

    const response = ApiResponse.success(issue, MESSAGES.ISSUE.FETCH_SUCCESS);
    res.status(response.statusCode).json(response);
  }
);

/**
 * Get all issues (with filters)
 * GET /api/issues
 * - Admin: all issues
 * - Student: only their issues
 */
export const getAllIssues = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const filters: IIssueFilter = {
      category: req.query.category as any,
      status: req.query.status as any,
      priority: req.query.priority as any,
    };

    let result;
    if (req.user!.role === UserRole.ADMIN) {
      result = await issueService.getAllIssues(filters, req.query);
    } else {
      result = await issueService.getIssuesByUser(
        req.user!._id.toString(),
        filters,
        req.query
      );
    }

    const response = ApiResponse.paginated(
      result.data,
      result.pagination,
      MESSAGES.ISSUE.FETCH_ALL_SUCCESS
    );
    res.status(response.statusCode).json(response);
  }
);

/**
 * Get my issues (for students)
 * GET /api/issues/my
 */
export const getMyIssues = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!._id.toString();
    const filters: IIssueFilter = {
      category: req.query.category as any,
      status: req.query.status as any,
      priority: req.query.priority as any,
    };

    const result = await issueService.getIssuesByUser(userId, filters, req.query);

    const response = ApiResponse.paginated(
      result.data,
      result.pagination,
      MESSAGES.ISSUE.FETCH_ALL_SUCCESS
    );
    res.status(response.statusCode).json(response);
  }
);

/**
 * Update issue (student can update only their open issues)
 * PUT /api/issues/:id
 */
export const updateIssue = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user!._id.toString();
    let imageUrl: string | undefined;
    let imagePublicId: string | undefined;

    // Upload new image if provided
    if (req.file) {
      const uploadResult = await uploadService.uploadImage(req.file);
      imageUrl = uploadResult.url;
      imagePublicId = uploadResult.publicId;
    }

    const issue = await issueService.updateIssue(
      id,
      userId,
      req.body,
      imageUrl,
      imagePublicId
    );

    const response = ApiResponse.success(issue, MESSAGES.ISSUE.UPDATE_SUCCESS);
    res.status(response.statusCode).json(response);
  }
);

/**
 * Delete issue
 * DELETE /api/issues/:id
 */
export const deleteIssue = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user!._id.toString();
    const userRole = req.user!.role;

    // Get issue to delete image if exists
    const issue = await issueService.getIssueById(id);
    
    await issueService.deleteIssue(id, userId, userRole);

    // Delete image from cloudinary if exists
    if (issue.imagePublicId) {
      uploadService.deleteImage(issue.imagePublicId);
    }

    const response = ApiResponse.noContent(MESSAGES.ISSUE.DELETE_SUCCESS);
    res.status(response.statusCode).json(response);
  }
);

/**
 * Search issues
 * GET /api/issues/search
 */
export const searchIssues = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { q } = req.query;
    
    if (!q || typeof q !== 'string') {
      const response = ApiResponse.success(
        { data: [], pagination: { currentPage: 1, totalPages: 0, totalItems: 0, itemsPerPage: 10, hasNextPage: false, hasPrevPage: false } },
        MESSAGES.ISSUE.FETCH_ALL_SUCCESS
      );
      res.status(response.statusCode).json(response);
      return;
    }

    const result = await issueService.searchIssues(q, req.query);

    const response = ApiResponse.paginated(
      result.data,
      result.pagination,
      MESSAGES.ISSUE.FETCH_ALL_SUCCESS
    );
    res.status(response.statusCode).json(response);
  }
);

/**
 * Get issue statistics (admin only)
 * GET /api/issues/stats
 */
export const getIssueStats = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const stats = await issueService.getIssueStats();

    const response = ApiResponse.success(stats, 'Statistics fetched successfully');
    res.status(response.statusCode).json(response);
  }
);
