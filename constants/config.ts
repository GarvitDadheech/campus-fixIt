/**
 * API Configuration
 */
export const API_CONFIG = {
  BASE_URL: 'https://f5951ef37b01.ngrok-free.app/api',
  TIMEOUT: 10000,
};

/**
 * Storage Keys
 */
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER_DATA: 'userData',
};

/**
 * Issue Categories
 */
export const ISSUE_CATEGORIES = [
  { value: 'electrical', label: 'Electrical' },
  { value: 'water', label: 'Water' },
  { value: 'internet', label: 'Internet' },
  { value: 'infrastructure', label: 'Infrastructure' },
] as const;

/**
 * Issue Priorities
 */
export const ISSUE_PRIORITIES = [
  { value: 'low', label: 'Low', color: '#4CAF50' },
  { value: 'medium', label: 'Medium', color: '#FF9800' },
  { value: 'high', label: 'High', color: '#FF5722' },
  { value: 'critical', label: 'Critical', color: '#F44336' },
] as const;

/**
 * Issue Status
 */
export const ISSUE_STATUS = [
  { value: 'open', label: 'Open', color: '#2196F3' },
  { value: 'in_progress', label: 'In Progress', color: '#FF9800' },
  { value: 'resolved', label: 'Resolved', color: '#4CAF50' },
] as const;

/**
 * User Roles
 */
export const USER_ROLES = {
  STUDENT: 'student',
  ADMIN: 'admin',
} as const;

