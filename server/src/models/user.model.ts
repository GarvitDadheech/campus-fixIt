import bcrypt from 'bcryptjs';
import mongoose, { Model, Schema } from 'mongoose';
import { IUser, UserRole } from '../types';

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't include password in queries by default
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.STUDENT,
    },
    studentId: {
      type: String,
      trim: true,
      sparse: true, // Allow multiple null values
    },
    department: {
      type: String,
      trim: true,
      maxlength: [100, 'Department cannot exceed 100 characters'],
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[\d\s\-+()]+$/, 'Please provide a valid phone number'],
    },
    avatar: {
      type: String,
      default: null,
    },
    fcmToken: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        const { password, __v, ...rest } = ret;
        return rest;
      },
    },
  }
);

// Index for faster queries (email and studentId already indexed via unique/sparse)
userSchema.index({ role: 1 });

// Hash password before saving
userSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    return false;
  }
};

// Static method to find user by email (including password)
userSchema.statics.findByEmail = function (email: string) {
  return this.findOne({ email }).select('+password');
};

const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);

export default User;

