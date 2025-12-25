import { Types } from 'mongoose';
import { Issue, User } from '../models';
import {
  IIssue,
  IIssueFilter,
  IIssueInput,
  IssueStatus,
  PaginatedResponse,
  UserRole
} from '../types';
import { ApiError, buildSortObject, calculateSkip, createPaginatedResponse, log, MESSAGES, parsePaginationParams } from '../utils';
import { emailService } from './email.service';
import { notificationService } from './notification.service';

class IssueService {
  /**
   * Create a new issue
   */
  async createIssue(
    data: IIssueInput,
    userId: string,
    imageUrl?: string,
    imagePublicId?: string
  ): Promise<IIssue> {
    try {
      const issue = await Issue.create({
        ...data,
        reportedBy: new Types.ObjectId(userId),
        imageUrl,
        imagePublicId,
      });

      log.info('Issue created', { 
        issueId: issue._id, 
        userId, 
        category: data.category, 
        priority: data.priority 
      });

      return issue.populate('reportedBy', 'name email studentId department');
    } catch (error) {
      log.error('Failed to create issue', error, { userId, data });
      throw ApiError.internal('Failed to create issue');
    }
  }

  /**
   * Get issue by ID
   */
  async getIssueById(issueId: string): Promise<IIssue> {
    try {
      if (!Types.ObjectId.isValid(issueId)) {
        log.warn('Invalid issue ID format', { issueId });
        throw ApiError.badRequest(MESSAGES.VALIDATION.INVALID_OBJECT_ID);
      }

      const issue = await Issue.findById(issueId)
        .populate('reportedBy', 'name email studentId department')
        .populate('assignedTo', 'name email')
        .populate('statusHistory.changedBy', 'name email');

      if (!issue) {
        log.warn('Issue not found', { issueId });
        throw ApiError.notFound(MESSAGES.ISSUE.NOT_FOUND);
      }

      return issue;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      log.error('Failed to get issue by ID', error, { issueId });
      throw ApiError.internal('Failed to get issue');
    }
  }

  /**
   * Get all issues with filtering and pagination
   */
  async getAllIssues(
    filters: IIssueFilter,
    paginationQuery: any
  ): Promise<PaginatedResponse<IIssue>> {
    try {
      const pagination = parsePaginationParams(paginationQuery);
      const query: any = {};

      // Apply filters
      if (filters.category) {
        query.category = filters.category;
      }
      if (filters.status) {
        query.status = filters.status;
      }
      if (filters.priority) {
        query.priority = filters.priority;
      }
      if (filters.reportedBy) {
        query.reportedBy = new Types.ObjectId(filters.reportedBy);
      }
      if (filters.assignedTo) {
        query.assignedTo = new Types.ObjectId(filters.assignedTo);
      }
      if (filters.startDate || filters.endDate) {
        query.createdAt = {};
        if (filters.startDate) {
          query.createdAt.$gte = filters.startDate;
        }
        if (filters.endDate) {
          query.createdAt.$lte = filters.endDate;
        }
      }

      const totalItems = await Issue.countDocuments(query);
      const sortObj = buildSortObject(pagination);
      const skip = calculateSkip(pagination.page, pagination.limit);

      const issues = await Issue.find(query)
        .populate('reportedBy', 'name email studentId department')
        .populate('assignedTo', 'name email')
        .sort(sortObj)
        .skip(skip)
        .limit(pagination.limit);

      log.info(`Issues fetched: ${issues.length} issues found`, {
        count: issues.length,
        totalItems,
        currentPage: pagination.page,
        itemsPerPage: pagination.limit,
        filters: JSON.stringify(filters),
      });

      return createPaginatedResponse(issues, totalItems, pagination);
    } catch (error) {
      log.error('Failed to get all issues', error, { filters });
      throw ApiError.internal('Failed to get issues');
    }
  }

  /**
   * Get issues by user (student's own issues)
   */
  async getIssuesByUser(
    userId: string,
    filters: IIssueFilter,
    paginationQuery: any
  ): Promise<PaginatedResponse<IIssue>> {
    const result = await this.getAllIssues({ ...filters, reportedBy: userId }, paginationQuery);
    log.info(`User issues fetched: ${result.data.length} issues for user ${userId}`, {
      userId,
      count: result.data.length,
      totalItems: result.pagination.totalItems,
      currentPage: result.pagination.currentPage,
      itemsPerPage: result.pagination.itemsPerPage,
      filters: JSON.stringify(filters),
    });
    return result;
  }

  /**
   * Update issue (for students - limited fields)
   */
  async updateIssue(
    issueId: string,
    userId: string,
    data: Partial<IIssueInput>,
    imageUrl?: string,
    imagePublicId?: string
  ): Promise<IIssue> {
    try {
      const issue = await this.getIssueById(issueId);

      // Check ownership
      if (issue.reportedBy._id.toString() !== userId) {
        log.warn('Unauthorized issue update attempt', { issueId, userId });
        throw ApiError.forbidden(MESSAGES.ISSUE.NOT_OWNER);
      }

      // Students can only update if issue is still open
      if (issue.status !== IssueStatus.OPEN) {
        log.warn('Update attempt on non-open issue', { issueId, status: issue.status });
        throw ApiError.badRequest('Cannot update issue once it has been picked up for processing');
      }

      // Update allowed fields
      if (data.title) issue.title = data.title;
      if (data.description) issue.description = data.description;
      if (data.category) issue.category = data.category;
      if (data.priority) issue.priority = data.priority;
      if (data.location) issue.location = data.location;
      if (imageUrl) {
        issue.imageUrl = imageUrl;
        issue.imagePublicId = imagePublicId || undefined;
      }

      await issue.save();

      log.info('Issue updated', { issueId, userId, updatedFields: Object.keys(data) });

      return issue.populate('reportedBy', 'name email studentId department');
    } catch (error) {
      if (error instanceof ApiError) throw error;
      log.error('Failed to update issue', error, { issueId, userId });
      throw ApiError.internal('Failed to update issue');
    }
  }

  /**
   * Delete issue
   */
  async deleteIssue(issueId: string, userId: string, userRole: UserRole): Promise<void> {
    try {
      const issue = await this.getIssueById(issueId);

      // Students can only delete their own open issues
      if (userRole === UserRole.STUDENT) {
        if (issue.reportedBy._id.toString() !== userId) {
          log.warn('Unauthorized issue delete attempt', { issueId, userId });
          throw ApiError.forbidden(MESSAGES.ISSUE.NOT_OWNER);
        }
        if (issue.status !== IssueStatus.OPEN) {
          log.warn('Delete attempt on non-open issue', { issueId, status: issue.status });
          throw ApiError.badRequest('Cannot delete issue once it has been picked up for processing');
        }
      }

      await Issue.findByIdAndDelete(issueId);

      log.info('Issue deleted', { issueId, userId, userRole });
    } catch (error) {
      if (error instanceof ApiError) throw error;
      log.error('Failed to delete issue', error, { issueId, userId });
      throw ApiError.internal('Failed to delete issue');
    }
  }

  /**
   * Update issue status (admin only)
   */
  async updateIssueStatus(
    issueId: string,
    adminId: string,
    status: IssueStatus,
    remarks?: string
  ): Promise<IIssue> {
    try {
      const issue = await this.getIssueById(issueId);

      if (issue.status === IssueStatus.RESOLVED) {
        log.warn('Status update attempt on resolved issue', { issueId });
        throw ApiError.badRequest(MESSAGES.ISSUE.ALREADY_RESOLVED);
      }

      const previousStatus = issue.status;
      issue.status = status;
      
      if (remarks) {
        issue.remarks = remarks;
      }

      // Add to status history
      issue.statusHistory.push({
        status,
        changedBy: new Types.ObjectId(adminId),
        changedAt: new Date(),
        remarks,
      });

      // Set resolved date if resolved
      if (status === IssueStatus.RESOLVED) {
        issue.resolvedAt = new Date();
      }

      await issue.save();

      log.info('Issue status updated', { 
        issueId, 
        adminId, 
        previousStatus, 
        newStatus: status 
      });

      // Send notifications
      await this.sendStatusUpdateNotifications(issue, previousStatus, status);

      return issue.populate([
        { path: 'reportedBy', select: 'name email studentId department fcmToken' },
        { path: 'assignedTo', select: 'name email' },
        { path: 'statusHistory.changedBy', select: 'name email' },
      ]);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      log.error('Failed to update issue status', error, { issueId, adminId, status });
      throw ApiError.internal('Failed to update issue status');
    }
  }

  /**
   * Assign issue to admin
   */
  async assignIssue(issueId: string, adminId: string): Promise<IIssue> {
    try {
      const issue = await this.getIssueById(issueId);

      issue.assignedTo = new Types.ObjectId(adminId);
      
      // Auto-update status to in_progress if currently open
      if (issue.status === IssueStatus.OPEN) {
        issue.status = IssueStatus.IN_PROGRESS;
        issue.statusHistory.push({
          status: IssueStatus.IN_PROGRESS,
          changedBy: new Types.ObjectId(adminId),
          changedAt: new Date(),
          remarks: 'Issue assigned and in progress',
        });
      }

      await issue.save();

      log.info('Issue assigned', { issueId, adminId });

      return issue.populate([
        { path: 'reportedBy', select: 'name email studentId department' },
        { path: 'assignedTo', select: 'name email' },
      ]);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      log.error('Failed to assign issue', error, { issueId, adminId });
      throw ApiError.internal('Failed to assign issue');
    }
  }

  /**
   * Add remarks to issue
   */
  async addRemarks(issueId: string, adminId: string, remarks: string): Promise<IIssue> {
    try {
      const issue = await this.getIssueById(issueId);

      issue.remarks = remarks;
      issue.statusHistory.push({
        status: issue.status,
        changedBy: new Types.ObjectId(adminId),
        changedAt: new Date(),
        remarks,
      });

      await issue.save();

      log.info('Remarks added to issue', { issueId, adminId });

      return issue;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      log.error('Failed to add remarks', error, { issueId, adminId });
      throw ApiError.internal('Failed to add remarks');
    }
  }

  /**
   * Get issue statistics
   */
  async getIssueStats(): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byCategory: Record<string, number>;
    byPriority: Record<string, number>;
    resolvedThisMonth: number;
    averageResolutionTime: number;
  }> {
    try {
      const [statusStats, categoryStats, priorityStats, totalCount] = await Promise.all([
        Issue.aggregate([
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ]),
        Issue.aggregate([
          { $group: { _id: '$category', count: { $sum: 1 } } },
        ]),
        Issue.aggregate([
          { $group: { _id: '$priority', count: { $sum: 1 } } },
        ]),
        Issue.countDocuments(),
      ]);

      // Count resolved this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const resolvedThisMonth = await Issue.countDocuments({
        status: IssueStatus.RESOLVED,
        resolvedAt: { $gte: startOfMonth },
      });

      // Calculate average resolution time
      const resolvedIssues = await Issue.find({
        status: IssueStatus.RESOLVED,
        resolvedAt: { $exists: true },
      }).select('createdAt resolvedAt');

      let averageResolutionTime = 0;
      if (resolvedIssues.length > 0) {
        const totalTime = resolvedIssues.reduce((sum, issue) => {
          const resolutionTime = issue.resolvedAt!.getTime() - issue.createdAt.getTime();
          return sum + resolutionTime;
        }, 0);
        averageResolutionTime = Math.round(totalTime / resolvedIssues.length / (1000 * 60 * 60)); // in hours
      }

      log.debug('Issue statistics fetched');

      return {
        total: totalCount,
        byStatus: statusStats.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {}),
        byCategory: categoryStats.reduce((acc, c) => ({ ...acc, [c._id]: c.count }), {}),
        byPriority: priorityStats.reduce((acc, p) => ({ ...acc, [p._id]: p.count }), {}),
        resolvedThisMonth,
        averageResolutionTime,
      };
    } catch (error) {
      log.error('Failed to get issue statistics', error);
      throw ApiError.internal('Failed to get issue statistics');
    }
  }

  /**
   * Search issues
   */
  async searchIssues(
    searchQuery: string,
    paginationQuery: any
  ): Promise<PaginatedResponse<IIssue>> {
    try {
      const pagination = parsePaginationParams(paginationQuery);
      const skip = calculateSkip(pagination.page, pagination.limit);

      const query = {
        $text: { $search: searchQuery },
      };

      const totalItems = await Issue.countDocuments(query);

      const issues = await Issue.find(query)
        .populate('reportedBy', 'name email studentId department')
        .populate('assignedTo', 'name email')
        .sort({ score: { $meta: 'textScore' } })
        .skip(skip)
        .limit(pagination.limit);

      log.debug('Issue search completed', { searchQuery, resultCount: issues.length });

      return createPaginatedResponse(issues, totalItems, pagination);
    } catch (error) {
      log.error('Failed to search issues', error, { searchQuery });
      throw ApiError.internal('Failed to search issues');
    }
  }

  /**
   * Send status update notifications
   */
  private async sendStatusUpdateNotifications(
    issue: IIssue,
    previousStatus: IssueStatus,
    newStatus: IssueStatus
  ): Promise<void> {
    try {
      // Get the reporter's full details
      const reporter = await User.findById(issue.reportedBy);
      if (!reporter) {
        log.warn('Reporter not found for notification', { issueId: issue._id });
        return;
      }

      // Send email notification
      await emailService.sendStatusUpdateEmail(
        reporter.email,
        reporter.name,
        issue.title,
        previousStatus,
        newStatus,
        issue.remarks
      );

      // Send push notification if FCM token exists
      if (reporter.fcmToken) {
        await notificationService.sendPushNotification(
          reporter.fcmToken,
          {
            title: 'Issue Status Updated',
            body: `Your issue "${issue.title}" status changed to ${newStatus.replace('_', ' ')}`,
            data: {
              issueId: issue._id.toString(),
              type: 'status_update',
            },
          }
        );
      }

      log.debug('Status update notifications sent', { issueId: issue._id, reporterId: reporter._id });
    } catch (error) {
      log.error('Failed to send status update notifications', error, { issueId: issue._id });
      // Don't throw - notifications are non-critical
    }
  }
}

export const issueService = new IssueService();
export default issueService;
