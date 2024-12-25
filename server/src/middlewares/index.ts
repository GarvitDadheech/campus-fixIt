export {
  adminOnly, authenticate,
  authorize, studentOnly
} from './auth.middleware';

export {
  catchAsync, errorHandler,
  notFoundHandler
} from './error.middleware';

export {
  handleMulterError,
  default as upload, uploadMultipleImages, uploadSingleImage
} from './upload.middleware';

export {
  addRemarksSchema, changePasswordSchema,
  // Issue schemas
  createIssueSchema, issueFilterSchema, loginSchema, mongoIdAdminParamSchema,
  // Common schemas
  mongoIdParamSchema, paginationSchema, refreshTokenSchema,
  // Auth schemas
  registerSchema, searchSchema, updateIssueSchema,
  updateIssueStatusSchema,
  // User schemas
  updateProfileSchema,
  updateUserRoleSchema, userFilterSchema, validate
} from './validate.middleware';

