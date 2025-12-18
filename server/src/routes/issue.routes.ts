import { Router } from 'express';
import { issueController } from '../controllers';
import {
  authenticate,
  uploadSingleImage,
  handleMulterError,
  validate,
  createIssueSchema,
  updateIssueSchema,
  mongoIdParamSchema,
  issueFilterSchema,
  searchSchema,
} from '../middlewares';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/issues/my
 * @desc    Get current user's issues
 * @access  Private
 */
router.get('/my', validate(issueFilterSchema), issueController.getMyIssues);

/**
 * @route   GET /api/issues/search
 * @desc    Search issues
 * @access  Private
 */
router.get('/search', validate(searchSchema), issueController.searchIssues);

/**
 * @route   GET /api/issues/stats
 * @desc    Get issue statistics
 * @access  Private (Admin)
 */
router.get('/stats', issueController.getIssueStats);

/**
 * @route   GET /api/issues
 * @desc    Get all issues (admin gets all, students get their own)
 * @access  Private
 */
router.get('/', validate(issueFilterSchema), issueController.getAllIssues);

/**
 * @route   GET /api/issues/:id
 * @desc    Get issue by ID
 * @access  Private
 */
router.get('/:id', validate(mongoIdParamSchema), issueController.getIssueById);

/**
 * @route   POST /api/issues
 * @desc    Create a new issue
 * @access  Private
 */
router.post(
  '/',
  uploadSingleImage,
  handleMulterError,
  validate(createIssueSchema),
  issueController.createIssue
);

/**
 * @route   PUT /api/issues/:id
 * @desc    Update an issue
 * @access  Private (Owner only, when status is Open)
 */
router.put(
  '/:id',
  uploadSingleImage,
  handleMulterError,
  validate(updateIssueSchema),
  issueController.updateIssue
);

/**
 * @route   DELETE /api/issues/:id
 * @desc    Delete an issue
 * @access  Private (Owner when Open, Admin anytime)
 */
router.delete('/:id', validate(mongoIdParamSchema), issueController.deleteIssue);

export default router;
