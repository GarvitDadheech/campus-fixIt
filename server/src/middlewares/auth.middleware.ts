import { NextFunction, Response } from 'express';
import { authService } from '../services';
import { AuthenticatedRequest, UserRole } from '../types';
import { ApiError, MESSAGES } from '../utils';

/**
 * Authentication middleware - verifies JWT token
 */
export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized(MESSAGES.AUTH.TOKEN_MISSING);
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      throw ApiError.unauthorized(MESSAGES.AUTH.TOKEN_MISSING);
    }

    // Verify token and get user
    const user = await authService.getUserFromToken(token);
    
    // Attach user to request
    req.user = user;
    
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Authorization middleware - checks if user has required role
 */
export const authorize = (...roles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(ApiError.unauthorized(MESSAGES.AUTH.UNAUTHORIZED));
    }

    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden(MESSAGES.AUTH.UNAUTHORIZED));
    }

    next();
  };
};

/**
 * Admin only middleware
 */
export const adminOnly = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    return next(ApiError.unauthorized(MESSAGES.AUTH.UNAUTHORIZED));
  }

  if (req.user.role !== UserRole.ADMIN) {
    return next(ApiError.forbidden(MESSAGES.AUTH.UNAUTHORIZED));
  }

  next();
};

/**
 * Student only middleware
 */
export const studentOnly = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    return next(ApiError.unauthorized(MESSAGES.AUTH.UNAUTHORIZED));
  }

  if (req.user.role !== UserRole.STUDENT) {
    return next(ApiError.forbidden(MESSAGES.AUTH.UNAUTHORIZED));
  }

  next();
};