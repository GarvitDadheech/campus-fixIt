import { PaginatedResponse, PaginationOptions } from '../types';
import { PAGINATION } from './constants';

/**
 * Parse pagination parameters from request query
 */
export const parsePaginationParams = (query: any): PaginationOptions => {
  const page = Math.max(1, parseInt(query.page) || PAGINATION.DEFAULT_PAGE);
  const limit = Math.min(
    PAGINATION.MAX_LIMIT,
    Math.max(1, parseInt(query.limit) || PAGINATION.DEFAULT_LIMIT)
  );
  const sortBy = query.sortBy || 'createdAt';
  const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';

  return { page, limit, sortBy, sortOrder };
};

/**
 * Create paginated response object
 */
export const createPaginatedResponse = <T>(
  data: T[],
  totalItems: number,
  options: PaginationOptions
): PaginatedResponse<T> => {
  const totalPages = Math.ceil(totalItems / options.limit);
  
  return {
    data,
    pagination: {
      currentPage: options.page,
      totalPages,
      totalItems,
      itemsPerPage: options.limit,
      hasNextPage: options.page < totalPages,
      hasPrevPage: options.page > 1,
    },
  };
};

/**
 * Build MongoDB sort object from pagination options
 */
export const buildSortObject = (options: PaginationOptions): Record<string, 1 | -1> => {
  return {
    [options.sortBy || 'createdAt']: options.sortOrder === 'asc' ? 1 : -1,
  };
};

/**
 * Calculate skip value for pagination
 */
export const calculateSkip = (page: number, limit: number): number => {
  return (page - 1) * limit;
};

/**
 * Sanitize user object (remove sensitive data)
 */
export const sanitizeUser = (user: any): any => {
  const sanitized = user.toObject ? user.toObject() : { ...user };
  delete sanitized.password;
  delete sanitized.__v;
  return sanitized;
};

/**
 * Generate random string
 */
export const generateRandomString = (length: number = 32): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Check if string is valid MongoDB ObjectId
 */
export const isValidObjectId = (id: string): boolean => {
  return /^[a-fA-F0-9]{24}$/.test(id);
};

/**
 * Format date to readable string
 */
export const formatDate = (date: Date): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

