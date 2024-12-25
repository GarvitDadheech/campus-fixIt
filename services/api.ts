import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { API_CONFIG, STORAGE_KEYS } from '../constants/config';
import { ApiResponse } from '../types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ApiResponse>) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        // Handle 401 - Unauthorized
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
            if (refreshToken) {
              const response = await axios.post(`${API_CONFIG.BASE_URL}/auth/refresh`, {
                refreshToken,
              });

              const { accessToken } = response.data.data;
              await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);

              // Retry original request with new token
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              }
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, clear storage and redirect to login
            await AsyncStorage.multiRemove([
              STORAGE_KEYS.ACCESS_TOKEN,
              STORAGE_KEYS.REFRESH_TOKEN,
              STORAGE_KEYS.USER_DATA,
            ]);
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Generic request method
  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.request<ApiResponse<T>>({
        method,
        url,
        data,
        ...config,
      });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      throw this.handleError(axiosError);
    }
  }

  // Error handler
  private handleError(error: AxiosError<ApiResponse>): Error {
    if (error.response) {
      // Server responded with error
      const { data, status } = error.response;
      const message = data?.message || error.message || 'An error occurred';
      const apiError = new Error(message) as any;
      apiError.status = status;
      apiError.data = data;
      // Extract validation errors from response
      apiError.errors = data?.errors || (data?.data?.errors ? data.data.errors : undefined);
      return apiError;
    } else if (error.request) {
      // Request made but no response
      return new Error('Network error. Please check your connection.');
    } else {
      // Something else happened
      return new Error(error.message || 'An unexpected error occurred');
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request<{ user: any; accessToken: string; refreshToken: string }>(
      'POST',
      '/auth/login',
      { email, password }
    );
  }

  async register(data: {
    name: string;
    email: string;
    password: string;
    studentId?: string;
    department?: string;
    phone?: string;
  }) {
    return this.request<{ user: any; accessToken: string; refreshToken: string }>(
      'POST',
      '/auth/register',
      data
    );
  }

  async getCurrentUser() {
    return this.request<{ user: any }>('GET', '/auth/me');
  }

  async changePassword(currentPassword: string, newPassword: string) {
    return this.request('PUT', '/auth/change-password', {
      currentPassword,
      newPassword,
    });
  }

  async logout() {
    return this.request('POST', '/auth/logout');
  }

  // Issue endpoints
  async createIssue(data: FormData) {
    return this.request<{ _id: string }>('POST', '/issues', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  async getMyIssues(params?: {
    page?: number;
    limit?: number;
    status?: string;
    category?: string;
    priority?: string;
  }) {
    const queryString = params
      ? '?' + new URLSearchParams(params as any).toString()
      : '';
    // ApiResponse.paginated returns: { data: [...issues...], pagination: {...} }
    // So the generic type should be the array of issues directly
    return this.request<any[]>('GET', `/issues/my${queryString}`);
  }

  async getAllIssues(params?: {
    page?: number;
    limit?: number;
    status?: string;
    category?: string;
    priority?: string;
  }) {
    const queryString = params
      ? '?' + new URLSearchParams(params as any).toString()
      : '';
    // ApiResponse.paginated returns: { data: [...issues...], pagination: {...} }
    // So the generic type should be the array of issues directly
    return this.request<any[]>('GET', `/issues${queryString}`);
  }

  async getIssueById(issueId: string) {
    return this.request<any>('GET', `/issues/${issueId}`);
  }

  async updateIssue(issueId: string, data: FormData | any) {
    const isFormData = data instanceof FormData;
    return this.request('PUT', `/issues/${issueId}`, data, {
      headers: isFormData
        ? {
            'Content-Type': 'multipart/form-data',
          }
        : undefined,
    });
  }

  async deleteIssue(issueId: string) {
    return this.request('DELETE', `/issues/${issueId}`);
  }

  async searchIssues(query: string, params?: { page?: number; limit?: number }) {
    const queryString = params
      ? '?' + new URLSearchParams({ q: query, ...params } as any).toString()
      : `?q=${query}`;
    return this.request<{ data: any[]; pagination: any }>('GET', `/issues/search${queryString}`);
  }

  // Admin endpoints
  async updateIssueStatus(issueId: string, status: string, remarks?: string) {
    return this.request('PATCH', `/admin/issues/${issueId}/status`, {
      status,
      remarks,
    });
  }

  async assignIssue(issueId: string) {
    return this.request('PATCH', `/admin/issues/${issueId}/assign`);
  }

  async assignIssueToAdmin(issueId: string, adminId: string) {
    return this.request('PATCH', `/admin/issues/${issueId}/assign/${adminId}`);
  }

  async addRemarks(issueId: string, remarks: string) {
    return this.request('PATCH', `/admin/issues/${issueId}/remarks`, { remarks });
  }

  async resolveIssue(issueId: string, remarks?: string) {
    return this.request('PATCH', `/admin/issues/${issueId}/resolve`, { remarks });
  }

  async getAllUsers(params?: {
    page?: number;
    limit?: number;
    role?: string;
    isActive?: boolean;
    search?: string;
  }) {
    const queryString = params
      ? '?' + new URLSearchParams(params as any).toString()
      : '';
    return this.request<{ data: any[]; pagination: any }>('GET', `/admin/users${queryString}`);
  }

  async toggleUserStatus(userId: string) {
    return this.request('PATCH', `/admin/users/${userId}/toggle-status`);
  }

  async updateUserRole(userId: string, role: string) {
    return this.request('PATCH', `/admin/users/${userId}/role`, { role });
  }

  async deleteUser(userId: string) {
    return this.request('DELETE', `/admin/users/${userId}`);
  }

  async getDashboardStats() {
    return this.request('GET', '/admin/stats');
  }

  // User endpoints
  async updateProfile(data: FormData | any) {
    const isFormData = data instanceof FormData;
    return this.request('PUT', '/users/profile', data, {
      headers: isFormData
        ? {
            'Content-Type': 'multipart/form-data',
          }
        : undefined,
    });
  }

}

export const apiService = new ApiService();
export default apiService;

