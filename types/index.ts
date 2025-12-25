/**
 * User Types
 */
export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  studentId?: string;
  department?: string;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Issue Types
 */
export interface Issue {
  _id: string;
  title: string;
  description: string;
  category: 'electrical' | 'water' | 'internet' | 'infrastructure';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved';
  location?: string;
  imageUrl?: string;
  reportedBy: User | string;
  assignedTo?: User | string;
  remarks?: string;
  statusHistory: StatusHistory[];
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StatusHistory {
  status: string;
  changedBy: User | string;
  changedAt: string;
  remarks?: string;
}

export interface CreateIssueInput {
  title: string;
  description: string;
  category: 'electrical' | 'water' | 'internet' | 'infrastructure';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  location?: string;
}

/**
 * Auth Types
 */
export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  studentId?: string;
  department?: string;
  phone?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

/**
 * API Response Types
 */
export interface ApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  pagination?: Pagination;
  errors?: ApiError[];
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiError {
  field?: string;
  message: string;
}

/**
 * Navigation Types
 */
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Login: undefined;
  Register: undefined;
  CreateIssue: undefined;
  IssueDetails: { issueId: string };
  EditIssue: { issueId: string };
  AdminIssueDetails: { issueId: string };
  Profile: undefined;
  EditProfile: undefined;
};

export type StudentTabParamList = {
  Dashboard: undefined;
  MyIssues: undefined;
  Create: undefined;
  Profile: undefined;
};

export type AdminTabParamList = {
  Dashboard: undefined;
  AllIssues: undefined;
  Users: undefined;
  Profile: undefined;
};

