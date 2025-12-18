import { NextFunction, Request, Response } from 'express';
import { z, ZodError } from 'zod';
import { IssueCategory, IssuePriority, IssueStatus, UserRole } from '../types';
import { ApiError } from '../utils';

// Type for any Zod schema
type ZodSchema = z.ZodType<any, any, any>;

/**
 * Validate request middleware using Zod schemas
 */
export const validate = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        return next(ApiError.badRequest('Validation failed', formattedErrors));
      }
      next(error);
    }
  };
};

// ==================== AUTH SCHEMAS ====================

export const registerSchema = z.object({
  body: z.object({
    name: z
      .string({ message: 'Name is required' })
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name cannot exceed 50 characters')
      .trim(),
    email: z
      .string({ message: 'Email is required' })
      .email('Please provide a valid email')
      .toLowerCase()
      .trim(),
    password: z
      .string({ message: 'Password is required' })
      .min(6, 'Password must be at least 6 characters'),
    studentId: z
      .string()
      .max(20, 'Student ID cannot exceed 20 characters')
      .trim()
      .optional(),
    department: z
      .string()
      .max(100, 'Department cannot exceed 100 characters')
      .trim()
      .optional(),
    phone: z
      .string()
      .regex(/^[\d\s\-+()]+$/, 'Please provide a valid phone number')
      .trim()
      .optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string({ message: 'Email is required' })
      .email('Please provide a valid email')
      .toLowerCase()
      .trim(),
    password: z.string({ message: 'Password is required' }),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string({ message: 'Current password is required' }),
    newPassword: z
      .string({ message: 'New password is required' })
      .min(6, 'New password must be at least 6 characters'),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string({ message: 'Refresh token is required' }),
  }),
});

// ==================== ISSUE SCHEMAS ====================

const issueCategoryEnum = z.enum(
  [IssueCategory.ELECTRICAL, IssueCategory.WATER, IssueCategory.INTERNET, IssueCategory.INFRASTRUCTURE],
  { errorMap: () => ({ message: `Category must be one of: ${Object.values(IssueCategory).join(', ')}` }) }
);

const issuePriorityEnum = z.enum(
  [IssuePriority.LOW, IssuePriority.MEDIUM, IssuePriority.HIGH, IssuePriority.CRITICAL],
  { errorMap: () => ({ message: `Priority must be one of: ${Object.values(IssuePriority).join(', ')}` }) }
);

const issueStatusEnum = z.enum(
  [IssueStatus.OPEN, IssueStatus.IN_PROGRESS, IssueStatus.RESOLVED],
  { errorMap: () => ({ message: `Status must be one of: ${Object.values(IssueStatus).join(', ')}` }) }
);

export const createIssueSchema = z.object({
  body: z.object({
    title: z
      .string({ message: 'Title is required' })
      .min(5, 'Title must be at least 5 characters')
      .max(100, 'Title cannot exceed 100 characters')
      .trim(),
    description: z
      .string({ message: 'Description is required' })
      .min(10, 'Description must be at least 10 characters')
      .max(1000, 'Description cannot exceed 1000 characters')
      .trim(),
    category: issueCategoryEnum,
    priority: issuePriorityEnum.optional().default(IssuePriority.MEDIUM),
    location: z
      .string()
      .max(200, 'Location cannot exceed 200 characters')
      .trim()
      .optional(),
  }),
});

export const updateIssueSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[a-fA-F0-9]{24}$/, 'Invalid issue ID format'),
  }),
  body: z.object({
    title: z
      .string()
      .min(5, 'Title must be at least 5 characters')
      .max(100, 'Title cannot exceed 100 characters')
      .trim()
      .optional(),
    description: z
      .string()
      .min(10, 'Description must be at least 10 characters')
      .max(1000, 'Description cannot exceed 1000 characters')
      .trim()
      .optional(),
    category: issueCategoryEnum.optional(),
    priority: issuePriorityEnum.optional(),
    location: z
      .string()
      .max(200, 'Location cannot exceed 200 characters')
      .trim()
      .optional(),
  }),
});

export const updateIssueStatusSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[a-fA-F0-9]{24}$/, 'Invalid issue ID format'),
  }),
  body: z.object({
    status: issueStatusEnum,
    remarks: z
      .string()
      .max(500, 'Remarks cannot exceed 500 characters')
      .trim()
      .optional(),
  }),
});

export const addRemarksSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[a-fA-F0-9]{24}$/, 'Invalid issue ID format'),
  }),
  body: z.object({
    remarks: z
      .string({ message: 'Remarks are required' })
      .max(500, 'Remarks cannot exceed 500 characters')
      .trim(),
  }),
});

// ==================== USER SCHEMAS ====================

export const updateProfileSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name cannot exceed 50 characters')
      .trim()
      .optional(),
    phone: z
      .string()
      .regex(/^[\d\s\-+()]+$/, 'Please provide a valid phone number')
      .trim()
      .optional(),
    department: z
      .string()
      .max(100, 'Department cannot exceed 100 characters')
      .trim()
      .optional(),
    studentId: z
      .string()
      .max(20, 'Student ID cannot exceed 20 characters')
      .trim()
      .optional(),
  }),
});

export const updateFcmTokenSchema = z.object({
  body: z.object({
    fcmToken: z.string({ message: 'FCM token is required' }),
  }),
});

export const updateUserRoleSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[a-fA-F0-9]{24}$/, 'Invalid user ID format'),
  }),
  body: z.object({
    role: z.enum([UserRole.STUDENT, UserRole.ADMIN], {
      errorMap: () => ({ message: `Role must be one of: ${Object.values(UserRole).join(', ')}` }),
    }),
  }),
});

// ==================== COMMON SCHEMAS ====================

export const mongoIdParamSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[a-fA-F0-9]{24}$/, 'Invalid ID format'),
  }),
});

export const mongoIdAdminParamSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[a-fA-F0-9]{24}$/, 'Invalid ID format'),
    adminId: z.string().regex(/^[a-fA-F0-9]{24}$/, 'Invalid admin ID format'),
  }),
});

export const paginationSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().min(1)).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().min(1).max(100)).optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});

export const issueFilterSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().min(1)).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().min(1).max(100)).optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
    category: issueCategoryEnum.optional(),
    status: issueStatusEnum.optional(),
    priority: issuePriorityEnum.optional(),
    assignedTo: z.string().regex(/^[a-fA-F0-9]{24}$/).optional(),
  }),
});

export const userFilterSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().min(1)).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().min(1).max(100)).optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
    role: z.enum([UserRole.STUDENT, UserRole.ADMIN]).optional(),
    isActive: z.enum(['true', 'false']).optional(),
    search: z.string().optional(),
  }),
});

export const searchSchema = z.object({
  query: z.object({
    q: z.string().optional(),
    page: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().min(1)).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().min(1).max(100)).optional(),
  }),
});