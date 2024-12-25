import { Response } from 'express';
import { userService, uploadService } from '../services';
import { ApiResponse, asyncHandler, MESSAGES, sanitizeUser } from '../utils';
import { AuthenticatedRequest } from '../types';

/**
 * Get user profile
 * GET /api/users/profile
 */
export const getProfile = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user!;

    const response = ApiResponse.success(
      { user: sanitizeUser(user) },
      MESSAGES.USER.FETCH_SUCCESS
    );
    res.status(response.statusCode).json(response);
  }
);

/**
 * Update user profile
 * PUT /api/users/profile
 */
export const updateProfile = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!._id.toString();
    const { name, phone, department, studentId } = req.body;

    let avatar: string | undefined;

    // Upload avatar if provided
    if (req.file) {
      const uploadResult = await uploadService.uploadImage(req.file);
      avatar = uploadResult.url;
    }

    const user = await userService.updateProfile(userId, {
      name,
      phone,
      department,
      studentId,
      avatar,
    });

    const response = ApiResponse.success(
      { user: sanitizeUser(user) },
      MESSAGES.USER.PROFILE_UPDATE_SUCCESS
    );
    res.status(response.statusCode).json(response);
  }
);

/**
 * Get user by ID (admin or self)
 * GET /api/users/:id
 */
export const getUserById = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    // Students can only view their own profile
    if (
      req.user!.role === 'student' &&
      id !== req.user!._id.toString()
    ) {
      const response = ApiResponse.success(null, MESSAGES.AUTH.UNAUTHORIZED);
      res.status(403).json({ ...response, success: false, statusCode: 403 });
      return;
    }

    const user = await userService.getUserById(id);

    const response = ApiResponse.success(
      { user: sanitizeUser(user) },
      MESSAGES.USER.FETCH_SUCCESS
    );
    res.status(response.statusCode).json(response);
  }
);

