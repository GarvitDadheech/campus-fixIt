import mongoose from 'mongoose';
import { env } from '../config/env';
import { User } from '../models';
import { UserRole } from '../types';
import { log } from '../utils';

const seedAdmin = async (): Promise<void> => {
  try {
    // Connect to MongoDB
    await mongoose.connect(env.MONGODB_URI);
    log.info('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: UserRole.ADMIN });
    if (existingAdmin) {
      log.warn(`Admin user already exists: ${existingAdmin.email}`);
      process.exit(0);
    }

    // Create default admin
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@campusfixit.com',
      password: 'admin123', // Will be hashed automatically
      role: UserRole.ADMIN,
      isActive: true,
    });

    log.info('Admin user created successfully!');
    log.info(`Email: ${admin.email}`);
    log.info('Password: admin123');
    log.warn('Please change the password after first login!');

    process.exit(0);
  } catch (error) {
    log.error('Error seeding admin', error);
    process.exit(1);
  }
};

// Run if called directly
seedAdmin();
