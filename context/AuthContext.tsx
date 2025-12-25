import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { STORAGE_KEYS } from '../constants/config';
import { apiService } from '../services/api';
import { logout as logoutAction, setUser } from '../store/authSlice';
import { LoginInput, RegisterInput, User } from '../types';
import { showErrorToast } from '../utils/toast';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: LoginInput) => Promise<void>;
  register: (data: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();

  // Load user from storage on mount
  useEffect(() => {
    loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadUser = async () => {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

      if (userData && token) {
        const parsedUser = JSON.parse(userData);
        setUserState(parsedUser);
        dispatch(setUser(parsedUser));
        // Verify token is still valid
        await refreshUser();
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginInput) => {
    try {
      setIsLoading(true);
      const response = await apiService.login(credentials.email, credentials.password);

      if (response.success && response.data) {
        const { user: userData, accessToken, refreshToken } = response.data;

        // Store tokens and user data
        await AsyncStorage.multiSet([
          [STORAGE_KEYS.ACCESS_TOKEN, accessToken],
          [STORAGE_KEYS.REFRESH_TOKEN, refreshToken],
          [STORAGE_KEYS.USER_DATA, JSON.stringify(userData)],
        ]);

        setUserState(userData);
        dispatch(setUser(userData));
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      // Show toast with detailed error
      showErrorToast(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterInput) => {
    // Don't set isLoading during registration to prevent redirects
    // The register screen handles its own loading state
    try {
      const response = await apiService.register(data);

      if (response.success && response.data) {
        const { user: userData, accessToken, refreshToken } = response.data;

        // Store tokens and user data
        await AsyncStorage.multiSet([
          [STORAGE_KEYS.ACCESS_TOKEN, accessToken],
          [STORAGE_KEYS.REFRESH_TOKEN, refreshToken],
          [STORAGE_KEYS.USER_DATA, JSON.stringify(userData)],
        ]);

        setUserState(userData);
        dispatch(setUser(userData));
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error: any) {
      // Show toast with detailed error
      showErrorToast(error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear storage regardless of API call result
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.USER_DATA,
      ]);
      setUserState(null);
      dispatch(logoutAction());
    }
  };

  const refreshUser = async () => {
    try {
      const response = await apiService.getCurrentUser();
      if (response.success && response.data) {
        const userData = response.data.user;
        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
        setUserState(userData);
        dispatch(setUser(userData));
      }
    } catch {
      // If refresh fails, logout user
      await logout();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

