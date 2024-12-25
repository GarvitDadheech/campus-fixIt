import { Request } from 'express';
import { Document, Types } from 'mongoose';

// ==================== ENUMS ====================

export enum UserRole {
  STUDENT = 'student',
  ADMIN = 'admin',
}

export enum IssueStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
}

export enum IssueCategory {
  ELECTRICAL = 'electrical',
  WATER = 'water',
  INTERNET = 'internet',
  INFRASTRUCTURE = 'infrastructure',
}

export enum IssuePriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// ==================== USER TYPES ====================

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  studentId?: string;
  department?: string;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IUserInput {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  studentId?: string;
  department?: string;
  phone?: string;
}

export interface IUserResponse {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  studentId?: string;
  department?: string;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== ISSUE TYPES ====================

export interface IStatusHistory {
  status: IssueStatus;
  changedBy: Types.ObjectId;
  changedAt: Date;
  remarks?: string;
}

export interface IIssue extends Document {
  _id: Types.ObjectId;
  title: string;
  description: string;
  category: IssueCategory;
  priority: IssuePriority;
  status: IssueStatus;
  location?: string;
  imageUrl?: string;
  imagePublicId?: string;
  reportedBy: Types.ObjectId;
  assignedTo?: Types.ObjectId;
  remarks?: string;
  statusHistory: IStatusHistory[];
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IIssueInput {
  title: string;
  description: string;
  category: IssueCategory;
  priority?: IssuePriority;
  location?: string;
}

export interface IIssueUpdate {
  title?: string;
  description?: string;
  category?: IssueCategory;
  priority?: IssuePriority;
  status?: IssueStatus;
  location?: string;
  remarks?: string;
  assignedTo?: string;
}

export interface IIssueFilter {
  category?: IssueCategory;
  status?: IssueStatus;
  priority?: IssuePriority;
  reportedBy?: string;
  assignedTo?: string;
  startDate?: Date;
  endDate?: Date;
}

// ==================== AUTH TYPES ====================

export interface ITokenPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface ILoginInput {
  email: string;
  password: string;
}

export interface IRegisterInput extends IUserInput {}

// ==================== REQUEST TYPES ====================

export interface AuthenticatedRequest extends Request {
  user?: IUser;
}

// ==================== RESPONSE TYPES ====================

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// ==================== EMAIL TYPES ====================

export interface IEmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

