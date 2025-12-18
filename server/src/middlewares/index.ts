export {
  authenticate,
  authorize,
  adminOnly,
  studentOnly,
} from './auth.middleware';

export {
  errorHandler,
  notFoundHandler,
  catchAsync,
} from './error.middleware';

export {
  uploadSingleImage,
  uploadMultipleImages,
  handleMulterError,
  default as upload,
} from './upload.middleware';

export {
  validate,
  // Auth schemas
  registerSchema,
  loginSchema,
  changePasswordSchema,
  refreshTokenSchema,
  // Issue schemas
  createIssueSchema,
  updateIssueSchema,
  updateIssueStatusSchema,
  addRemarksSchema,
  // User schemas
  updateProfileSchema,
  updateFcmTokenSchema,
  updateUserRoleSchema,
  // Common schemas
  mongoIdParamSchema,
  mongoIdAdminParamSchema,
  paginationSchema,
  issueFilterSchema,
  userFilterSchema,
  searchSchema,
} from './validate.middleware';
