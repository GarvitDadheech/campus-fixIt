import jwt from 'jsonwebtoken';
import { env } from '../config';
import { User } from '../models';
import {
    IAuthTokens,
    ILoginInput,
    IRegisterInput,
    ITokenPayload,
    IUser,
    UserRole,
} from '../types';
import { ApiError, log } from '../utils';
import { MESSAGES } from '../utils/constants';

class AuthService {
  /**
   * Generate access and refresh tokens
   */
  generateTokens(user: IUser): IAuthTokens {
    const payload: ITokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as string,
    } as jwt.SignOptions);

    const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN as string,
    } as jwt.SignOptions);

    return { accessToken, refreshToken };
  }

  /**
   * Verify access token
   */
  verifyAccessToken(token: string): ITokenPayload {
    try {
      return jwt.verify(token, env.JWT_SECRET) as ITokenPayload;
    } catch (error) {
      log.debug('Access token verification failed', { error });
      throw ApiError.unauthorized(MESSAGES.AUTH.TOKEN_INVALID);
    }
  }

  /**
   * Verify refresh token
   */
  verifyRefreshToken(token: string): ITokenPayload {
    try {
      return jwt.verify(token, env.JWT_REFRESH_SECRET) as ITokenPayload;
    } catch (error) {
      log.debug('Refresh token verification failed', { error });
      throw ApiError.unauthorized(MESSAGES.AUTH.TOKEN_INVALID);
    }
  }

  /**
   * Register a new user
   */
  async register(data: IRegisterInput): Promise<{ user: IUser; tokens: IAuthTokens }> {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email: data.email.toLowerCase() });
      if (existingUser) {
        log.warn('Registration attempt with existing email', { email: data.email });
        throw ApiError.conflict(MESSAGES.AUTH.USER_EXISTS);
      }

      // Create new user
      const user = await User.create({
        name: data.name,
        email: data.email.toLowerCase(),
        password: data.password,
        role: data.role || UserRole.STUDENT,
        studentId: data.studentId,
        department: data.department,
        phone: data.phone,
      });

      log.info('New user registered', { userId: user._id, email: user.email, role: user.role });

      // Generate tokens
      const tokens = this.generateTokens(user);

      return { user, tokens };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      log.error('Registration failed', error);
      throw ApiError.internal('Registration failed');
    }
  }

  /**
   * Login user
   */
  async login(data: ILoginInput): Promise<{ user: IUser; tokens: IAuthTokens }> {
    try {
      // Find user by email (include password field)
      const user = await User.findOne({ email: data.email.toLowerCase() }).select('+password');
      
      if (!user) {
        log.warn('Login attempt with non-existent email', { email: data.email });
        throw ApiError.unauthorized(MESSAGES.AUTH.INVALID_CREDENTIALS);
      }

      // Check if user is active
      if (!user.isActive) {
        log.warn('Login attempt by disabled user', { userId: user._id, email: user.email });
        throw ApiError.forbidden(MESSAGES.AUTH.ACCOUNT_DISABLED);
      }

      // Check password
      const isPasswordValid = await user.comparePassword(data.password);
      if (!isPasswordValid) {
        log.warn('Login attempt with invalid password', { email: data.email });
        throw ApiError.unauthorized(MESSAGES.AUTH.INVALID_CREDENTIALS);
      }

      log.info('User logged in', { userId: user._id, email: user.email });

      // Generate tokens
      const tokens = this.generateTokens(user);

      return { user, tokens };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      log.error('Login failed', error);
      throw ApiError.internal('Login failed');
    }
  }

  /**
   * Refresh tokens
   */
  async refreshTokens(refreshToken: string): Promise<IAuthTokens> {
    try {
      const payload = this.verifyRefreshToken(refreshToken);

      // Find user
      const user = await User.findById(payload.userId);
      if (!user) {
        log.warn('Token refresh attempt for non-existent user', { userId: payload.userId });
        throw ApiError.unauthorized(MESSAGES.AUTH.USER_NOT_FOUND);
      }

      if (!user.isActive) {
        log.warn('Token refresh attempt by disabled user', { userId: user._id });
        throw ApiError.forbidden(MESSAGES.AUTH.ACCOUNT_DISABLED);
      }

      log.debug('Tokens refreshed', { userId: user._id });

      // Generate new tokens
      return this.generateTokens(user);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      log.error('Token refresh failed', error);
      throw ApiError.internal('Token refresh failed');
    }
  }

  /**
   * Get user from token
   */
  async getUserFromToken(token: string): Promise<IUser> {
    try {
      const payload = this.verifyAccessToken(token);
      
      const user = await User.findById(payload.userId);
      if (!user) {
        log.warn('Token validation for non-existent user', { userId: payload.userId });
        throw ApiError.unauthorized(MESSAGES.AUTH.USER_NOT_FOUND);
      }

      if (!user.isActive) {
        log.warn('Token validation for disabled user', { userId: user._id });
        throw ApiError.forbidden(MESSAGES.AUTH.ACCOUNT_DISABLED);
      }

      return user;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      log.error('Get user from token failed', error);
      throw ApiError.unauthorized(MESSAGES.AUTH.TOKEN_INVALID);
    }
  }

  /**
   * Change password
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    try {
      const user = await User.findById(userId).select('+password');
      if (!user) {
        log.warn('Password change attempt for non-existent user', { userId });
        throw ApiError.notFound(MESSAGES.AUTH.USER_NOT_FOUND);
      }

      const isPasswordValid = await user.comparePassword(currentPassword);
      if (!isPasswordValid) {
        log.warn('Password change attempt with invalid current password', { userId });
        throw ApiError.badRequest(MESSAGES.USER.INVALID_PASSWORD);
      }

      user.password = newPassword;
      await user.save();

      log.info('Password changed successfully', { userId });
    } catch (error) {
      if (error instanceof ApiError) throw error;
      log.error('Password change failed', error, { userId });
      throw ApiError.internal('Password change failed');
    }
  }

  /**
   * Create admin user (for seeding)
   */
  async createAdmin(data: IRegisterInput): Promise<IUser> {
    try {
      const existingUser = await User.findOne({ email: data.email.toLowerCase() });
      if (existingUser) {
        log.warn('Admin creation attempt with existing email', { email: data.email });
        throw ApiError.conflict(MESSAGES.AUTH.USER_EXISTS);
      }

      const admin = await User.create({
        ...data,
        email: data.email.toLowerCase(),
        role: UserRole.ADMIN,
      });

      log.info('Admin user created', { adminId: admin._id, email: admin.email });

      return admin;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      log.error('Admin creation failed', error);
      throw ApiError.internal('Admin creation failed');
    }
  }
}

export const authService = new AuthService();
export default authService;
