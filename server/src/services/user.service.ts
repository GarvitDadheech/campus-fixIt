import { Types } from 'mongoose';
import { User } from '../models';
import { IUser, PaginatedResponse, UserRole } from '../types';
import { ApiError, buildSortObject, calculateSkip, createPaginatedResponse, log, MESSAGES, parsePaginationParams } from '../utils';

class UserService {
  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<IUser> {
    try {
      if (!Types.ObjectId.isValid(userId)) {
        log.warn('Invalid user ID format', { userId });
        throw ApiError.badRequest(MESSAGES.VALIDATION.INVALID_OBJECT_ID);
      }

      const user = await User.findById(userId);
      if (!user) {
        log.warn('User not found', { userId });
        throw ApiError.notFound(MESSAGES.AUTH.USER_NOT_FOUND);
      }

      return user;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      log.error('Failed to get user by ID', error, { userId });
      throw ApiError.internal('Failed to get user');
    }
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<IUser | null> {
    try {
      return User.findOne({ email: email.toLowerCase() });
    } catch (error) {
      log.error('Failed to get user by email', error, { email });
      throw ApiError.internal('Failed to get user');
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string,
    data: {
      name?: string;
      phone?: string;
      department?: string;
      studentId?: string;
      avatar?: string;
    }
  ): Promise<IUser> {
    try {
      const user = await this.getUserById(userId);

      if (data.name) user.name = data.name;
      if (data.phone !== undefined) user.phone = data.phone;
      if (data.department !== undefined) user.department = data.department;
      if (data.studentId !== undefined) user.studentId = data.studentId;
      if (data.avatar !== undefined) user.avatar = data.avatar;

      await user.save();

      log.info('User profile updated', { userId, updatedFields: Object.keys(data) });

      return user;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      log.error('Failed to update user profile', error, { userId });
      throw ApiError.internal('Failed to update profile');
    }
  }

  /**
   * Update FCM token for push notifications
   */
  async updateFcmToken(userId: string, fcmToken: string): Promise<void> {
    try {
      await User.findByIdAndUpdate(userId, { fcmToken });
      log.debug('FCM token updated', { userId });
    } catch (error) {
      log.error('Failed to update FCM token', error, { userId });
      throw ApiError.internal('Failed to update FCM token');
    }
  }

  /**
   * Remove FCM token (on logout)
   */
  async removeFcmToken(userId: string): Promise<void> {
    try {
      await User.findByIdAndUpdate(userId, { fcmToken: null });
      log.debug('FCM token removed', { userId });
    } catch (error) {
      log.error('Failed to remove FCM token', error, { userId });
      throw ApiError.internal('Failed to remove FCM token');
    }
  }

  /**
   * Get all users (admin only)
   */
  async getAllUsers(
    filters: { role?: UserRole; isActive?: boolean; search?: string },
    paginationQuery: any
  ): Promise<PaginatedResponse<IUser>> {
    try {
      const pagination = parsePaginationParams(paginationQuery);
      const query: any = {};

      if (filters.role) {
        query.role = filters.role;
      }
      if (filters.isActive !== undefined) {
        query.isActive = filters.isActive;
      }
      if (filters.search) {
        query.$or = [
          { name: { $regex: filters.search, $options: 'i' } },
          { email: { $regex: filters.search, $options: 'i' } },
          { studentId: { $regex: filters.search, $options: 'i' } },
        ];
      }

      const totalItems = await User.countDocuments(query);
      const sortObj = buildSortObject(pagination);
      const skip = calculateSkip(pagination.page, pagination.limit);

      const users = await User.find(query)
        .sort(sortObj)
        .skip(skip)
        .limit(pagination.limit);

      log.debug('Users fetched', { count: users.length, filters });

      return createPaginatedResponse(users, totalItems, pagination);
    } catch (error) {
      log.error('Failed to get all users', error, { filters });
      throw ApiError.internal('Failed to get users');
    }
  }

  /**
   * Toggle user active status (admin only)
   */
  async toggleUserStatus(userId: string): Promise<IUser> {
    try {
      const user = await this.getUserById(userId);
      user.isActive = !user.isActive;
      await user.save();

      log.info('User status toggled', { userId, isActive: user.isActive });

      return user;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      log.error('Failed to toggle user status', error, { userId });
      throw ApiError.internal('Failed to toggle user status');
    }
  }

  /**
   * Update user role (admin only)
   */
  async updateUserRole(userId: string, role: UserRole): Promise<IUser> {
    try {
      const user = await this.getUserById(userId);
      const previousRole = user.role;
      user.role = role;
      await user.save();

      log.info('User role updated', { userId, previousRole, newRole: role });

      return user;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      log.error('Failed to update user role', error, { userId, role });
      throw ApiError.internal('Failed to update user role');
    }
  }

  /**
   * Delete user (admin only)
   */
  async deleteUser(userId: string): Promise<void> {
    try {
      const user = await this.getUserById(userId);
      await User.findByIdAndDelete(userId);

      log.info('User deleted', { userId, email: user.email });
    } catch (error) {
      if (error instanceof ApiError) throw error;
      log.error('Failed to delete user', error, { userId });
      throw ApiError.internal('Failed to delete user');
    }
  }

  /**
   * Get all admin FCM tokens (for notifications)
   */
  async getAdminFcmTokens(): Promise<string[]> {
    try {
      const admins = await User.find({
        role: UserRole.ADMIN,
        isActive: true,
        fcmToken: { $ne: null, $exists: true },
      }).select('fcmToken');

      return admins.map((admin) => admin.fcmToken).filter(Boolean) as string[];
    } catch (error) {
      log.error('Failed to get admin FCM tokens', error);
      return []; // Return empty array instead of throwing
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(): Promise<{
    total: number;
    students: number;
    admins: number;
    activeUsers: number;
    inactiveUsers: number;
  }> {
    try {
      const [total, students, admins, activeUsers] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: UserRole.STUDENT }),
        User.countDocuments({ role: UserRole.ADMIN }),
        User.countDocuments({ isActive: true }),
      ]);

      return {
        total,
        students,
        admins,
        activeUsers,
        inactiveUsers: total - activeUsers,
      };
    } catch (error) {
      log.error('Failed to get user statistics', error);
      throw ApiError.internal('Failed to get user statistics');
    }
  }
}

export const userService = new UserService();
export default userService;
