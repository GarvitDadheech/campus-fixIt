import { Request, Response } from 'express';
import { authService, emailService, userService } from '../services';
import { ApiResponse, asyncHandler, MESSAGES, sanitizeUser } from '../utils';
import { AuthenticatedRequest } from '../types';

/**
 * Register a new user
 * POST /api/auth/register
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { user, tokens } = await authService.register(req.body);

  // Send welcome email (non-blocking)
  emailService.sendWelcomeEmail(user.email, user.name);

  const response = ApiResponse.created(
    {
      user: sanitizeUser(user),
      ...tokens,
    },
    MESSAGES.AUTH.REGISTER_SUCCESS
  );

  res.status(response.statusCode).json(response);
});

/**
 * Login user
 * POST /api/auth/login
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { user, tokens } = await authService.login(req.body);

  const response = ApiResponse.success(
    {
      user: sanitizeUser(user),
      ...tokens,
    },
    MESSAGES.AUTH.LOGIN_SUCCESS
  );

  res.status(response.statusCode).json(response);
});

/**
 * Refresh tokens
 * POST /api/auth/refresh
 */
export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  const tokens = await authService.refreshTokens(refreshToken);

  const response = ApiResponse.success(tokens, MESSAGES.AUTH.TOKEN_REFRESH_SUCCESS);
  res.status(response.statusCode).json(response);
});

/**
 * Get current user profile
 * GET /api/auth/me
 */
export const getMe = asyncHandler(
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
 * Change password
 * PUT /api/auth/change-password
 */
export const changePassword = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user!._id.toString();

    await authService.changePassword(userId, currentPassword, newPassword);

    const response = ApiResponse.success(null, MESSAGES.USER.PASSWORD_UPDATE_SUCCESS);
    res.status(response.statusCode).json(response);
  }
);

/**
 * Logout user (removes FCM token)
 * POST /api/auth/logout
 */
export const logout = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!._id.toString();

    // Remove FCM token on logout
    await userService.removeFcmToken(userId);

    const response = ApiResponse.success(null, MESSAGES.AUTH.LOGOUT_SUCCESS);
    res.status(response.statusCode).json(response);
  }
);
