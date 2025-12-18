import admin from 'firebase-admin';
import { env } from './env';
import { log } from '../utils/logger';

let firebaseInitialized = false;

export const initializeFirebase = (): void => {
  if (firebaseInitialized) return;

  if (!env.FIREBASE_PROJECT_ID || !env.FIREBASE_PRIVATE_KEY || !env.FIREBASE_CLIENT_EMAIL) {
    log.warn('Firebase credentials not configured. Push notifications will be disabled.');
    return;
  }

  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: env.FIREBASE_PROJECT_ID,
        privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        clientEmail: env.FIREBASE_CLIENT_EMAIL,
      }),
    });

    firebaseInitialized = true;
    log.info('Firebase Admin initialized');
  } catch (error) {
    log.error('Failed to initialize Firebase', error);
  }
};

export const getFirebaseAdmin = (): typeof admin | null => {
  if (!firebaseInitialized) return null;
  return admin;
};

export const isFirebaseInitialized = (): boolean => firebaseInitialized;

export default admin;
