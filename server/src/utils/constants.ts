// API Response Messages
export const MESSAGES = {
  // Auth
  AUTH: {
    REGISTER_SUCCESS: 'User registered successfully',
    LOGIN_SUCCESS: 'Login successful',
    LOGOUT_SUCCESS: 'Logout successful',
    TOKEN_REFRESH_SUCCESS: 'Token refreshed successfully',
    INVALID_CREDENTIALS: 'Invalid email or password',
    USER_EXISTS: 'User with this email already exists',
    USER_NOT_FOUND: 'User not found',
    UNAUTHORIZED: 'You are not authorized to perform this action',
    TOKEN_INVALID: 'Invalid or expired token',
    TOKEN_MISSING: 'Authentication token is missing',
    ACCOUNT_DISABLED: 'Your account has been disabled',
  },

  // User
  USER: {
    FETCH_SUCCESS: 'User fetched successfully',
    UPDATE_SUCCESS: 'User updated successfully',
    DELETE_SUCCESS: 'User deleted successfully',
    PASSWORD_UPDATE_SUCCESS: 'Password updated successfully',
    PROFILE_UPDATE_SUCCESS: 'Profile updated successfully',
    INVALID_PASSWORD: 'Current password is incorrect',
  },

  // Issue
  ISSUE: {
    CREATE_SUCCESS: 'Issue reported successfully',
    FETCH_SUCCESS: 'Issue fetched successfully',
    FETCH_ALL_SUCCESS: 'Issues fetched successfully',
    UPDATE_SUCCESS: 'Issue updated successfully',
    DELETE_SUCCESS: 'Issue deleted successfully',
    STATUS_UPDATE_SUCCESS: 'Issue status updated successfully',
    NOT_FOUND: 'Issue not found',
    NOT_OWNER: 'You can only modify your own issues',
    ALREADY_RESOLVED: 'This issue has already been resolved',
  },

  // Validation
  VALIDATION: {
    REQUIRED_FIELD: 'This field is required',
    INVALID_EMAIL: 'Please provide a valid email address',
    PASSWORD_MIN_LENGTH: 'Password must be at least 6 characters',
    INVALID_OBJECT_ID: 'Invalid ID format',
    INVALID_CATEGORY: 'Invalid category',
    INVALID_STATUS: 'Invalid status',
    INVALID_PRIORITY: 'Invalid priority',
  },

  // General
  GENERAL: {
    SERVER_ERROR: 'Internal server error',
    NOT_FOUND: 'Resource not found',
    BAD_REQUEST: 'Bad request',
    FORBIDDEN: 'Access forbidden',
  },
};

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};

// File upload limits
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
};

// Issue categories display names
export const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
  electrical: 'Electrical',
  water: 'Water',
  internet: 'Internet',
  infrastructure: 'Infrastructure',
};

// Issue status display names
export const STATUS_DISPLAY_NAMES: Record<string, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
};

// Issue priority display names
export const PRIORITY_DISPLAY_NAMES: Record<string, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

