import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

interface EnvConfig {
  NODE_ENV: string;
  PORT: number;
  MONGODB_URI: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  JWT_REFRESH_SECRET: string;
  JWT_REFRESH_EXPIRES_IN: string;
  
  // Cloudinary
  CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;
  
  // Email (Gmail)
  EMAIL_USER: string;
  EMAIL_PASSWORD: string;
  
  // Firebase (for push notifications)
  FIREBASE_PROJECT_ID: string;
  FIREBASE_PRIVATE_KEY: string;
  FIREBASE_CLIENT_EMAIL: string;
}

const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;
  if (value === undefined) {
    throw new Error(`Environment variable ${key} is not defined`);
  }
  return value;
};

const getEnvVarAsNumber = (key: string, defaultValue?: number): number => {
  // eslint-disable-next-line expo/no-dynamic-env-var
  const value = process.env[key];
  if (value === undefined) {
    if (defaultValue !== undefined) return defaultValue;
    throw new Error(`Environment variable ${key} is not defined`);
  }
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    throw new Error(`Environment variable ${key} is not a valid number`);
  }
  return parsed;
};

export const env: EnvConfig = {
  NODE_ENV: getEnvVar('NODE_ENV', 'development'),
  PORT: getEnvVarAsNumber('PORT', 5000),
  MONGODB_URI: getEnvVar('MONGODB_URI', 'mongodb://localhost:27017/campus-fixit'),
  JWT_SECRET: getEnvVar('JWT_SECRET', 'your-super-secret-jwt-key-change-in-production'),
  JWT_EXPIRES_IN: getEnvVar('JWT_EXPIRES_IN', '7d'),
  JWT_REFRESH_SECRET: getEnvVar('JWT_REFRESH_SECRET', 'your-super-secret-refresh-key-change-in-production'),
  JWT_REFRESH_EXPIRES_IN: getEnvVar('JWT_REFRESH_EXPIRES_IN', '30d'),
  
  // Cloudinary
  CLOUDINARY_CLOUD_NAME: getEnvVar('CLOUDINARY_CLOUD_NAME', ''),
  CLOUDINARY_API_KEY: getEnvVar('CLOUDINARY_API_KEY', ''),
  CLOUDINARY_API_SECRET: getEnvVar('CLOUDINARY_API_SECRET', ''),
  
  // Email (Gmail)
  EMAIL_USER: getEnvVar('EMAIL_USER', ''),
  EMAIL_PASSWORD: getEnvVar('EMAIL_PASSWORD', ''),
  
  // Firebase
  FIREBASE_PROJECT_ID: getEnvVar('FIREBASE_PROJECT_ID', ''),
  FIREBASE_PRIVATE_KEY: getEnvVar('FIREBASE_PRIVATE_KEY', ''),
  FIREBASE_CLIENT_EMAIL: getEnvVar('FIREBASE_CLIENT_EMAIL', ''),
};

export default env;
