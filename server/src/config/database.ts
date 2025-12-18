import mongoose from 'mongoose';
import { log } from '../utils/logger';
import { env } from './env';

export const connectDatabase = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI);

    log.info(`MongoDB Connected: ${conn.connection.host}`);

    mongoose.connection.on('error', (err) => {
      log.error(`MongoDB connection error: ${err}`);
    });

    mongoose.connection.on('disconnected', () => {
      log.warn('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      log.info('MongoDB reconnected');
    });

    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      log.info('MongoDB connection closed due to app termination');
      process.exit(0);
    });

  } catch (error) {
    log.error('Error connecting to MongoDB', error);
    process.exit(1);
  }
};

export default connectDatabase;
