import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { env } from '../config';
import { ApiError, log } from '../utils';

/**
 * Convert various errors to ApiError
 */
const convertToApiError = (err: any): ApiError => {
  // Already an ApiError
  if (err instanceof ApiError) {
    return err;
  }

  // Mongoose validation error
  if (err instanceof mongoose.Error.ValidationError) {
    const errors = Object.values(err.errors).map((e: any) => ({
      field: e.path,
      message: e.message,
    }));
    return ApiError.badRequest('Validation failed', errors);
  }

  // Mongoose cast error (invalid ObjectId)
  if (err instanceof mongoose.Error.CastError) {
    return ApiError.badRequest(`Invalid ${err.path}: ${err.value}`);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    return ApiError.conflict(`${field} already exists`);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return ApiError.unauthorized('Invalid token');
  }
  if (err.name === 'TokenExpiredError') {
    return ApiError.unauthorized('Token expired');
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return ApiError.badRequest('File too large');
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return ApiError.badRequest('Unexpected file field');
  }

  // Default to internal server error
  return ApiError.internal(err.message || 'Something went wrong');
};

/**
 * Global error handler middleware
 */
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Convert to ApiError
  const apiError = convertToApiError(err);

  // Log error in development
  if (env.NODE_ENV === 'development') {
    log.error('Error occurred', apiError, {
      statusCode: apiError.statusCode,
      errors: apiError.errors,
    });
  } else {
    // In production, only log server errors
    if (!apiError.isOperational) {
      log.error('Unhandled Error', err);
    }
  }

  // Send response
  const response = {
    success: false,
    statusCode: apiError.statusCode,
    message: apiError.isOperational ? apiError.message : 'Something went wrong',
    ...(apiError.errors && { errors: apiError.errors }),
    ...(env.NODE_ENV === 'development' && { stack: apiError.stack }),
  };

  res.status(apiError.statusCode).json(response);
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const error = ApiError.notFound(`Cannot ${req.method} ${req.originalUrl}`);
  next(error);
};

/**
 * Async error wrapper for routes
 */
export const catchAsync = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
