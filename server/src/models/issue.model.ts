import mongoose, { Model, Schema } from 'mongoose';
import { IIssue, IssueCategory, IssuePriority, IssueStatus, IStatusHistory } from '../types';

const statusHistorySchema = new Schema<IStatusHistory>(
  {
    status: {
      type: String,
      enum: Object.values(IssueStatus),
      required: true,
    },
    changedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    changedAt: {
      type: Date,
      default: Date.now,
    },
    remarks: {
      type: String,
      trim: true,
      maxlength: [500, 'Remarks cannot exceed 500 characters'],
    },
  },
  { _id: false }
);

const issueSchema = new Schema<IIssue>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    category: {
      type: String,
      enum: {
        values: Object.values(IssueCategory),
        message: 'Invalid category. Must be one of: electrical, water, internet, infrastructure',
      },
      required: [true, 'Category is required'],
    },
    priority: {
      type: String,
      enum: {
        values: Object.values(IssuePriority),
        message: 'Invalid priority. Must be one of: low, medium, high, critical',
      },
      default: IssuePriority.MEDIUM,
    },
    status: {
      type: String,
      enum: {
        values: Object.values(IssueStatus),
        message: 'Invalid status. Must be one of: open, in_progress, resolved',
      },
      default: IssueStatus.OPEN,
    },
    location: {
      type: String,
      trim: true,
      maxlength: [200, 'Location cannot exceed 200 characters'],
    },
    imageUrl: {
      type: String,
      default: null,
    },
    imagePublicId: {
      type: String,
      default: null,
    },
    reportedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reporter is required'],
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    remarks: {
      type: String,
      trim: true,
      maxlength: [500, 'Remarks cannot exceed 500 characters'],
    },
    statusHistory: {
      type: [statusHistorySchema],
      default: [],
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        const { __v, ...rest } = ret;
        return rest;
      },
    },
  }
);

// Indexes for faster queries
issueSchema.index({ reportedBy: 1, createdAt: -1 });
issueSchema.index({ status: 1, createdAt: -1 });
issueSchema.index({ category: 1, status: 1 });
issueSchema.index({ priority: 1, status: 1 });
issueSchema.index({ assignedTo: 1, status: 1 });
issueSchema.index({ createdAt: -1 });

// Text index for search functionality
issueSchema.index({ title: 'text', description: 'text', location: 'text' });

// Pre-save middleware to add initial status to history
issueSchema.pre('save', function (next) {
  if (this.isNew && this.statusHistory.length === 0) {
    this.statusHistory.push({
      status: this.status,
      changedBy: this.reportedBy,
      changedAt: new Date(),
      remarks: 'Issue created',
    });
  }
  next();
});

// Virtual for time since creation
issueSchema.virtual('timeSinceCreation').get(function () {
  const now = new Date();
  const created = this.createdAt;
  const diffMs = now.getTime() - created.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (diffDays > 0) {
    return `${diffDays} day(s) ago`;
  }
  return `${diffHours} hour(s) ago`;
});

// Enable virtuals in JSON output
issueSchema.set('toJSON', { virtuals: true });
issueSchema.set('toObject', { virtuals: true });

const Issue: Model<IIssue> = mongoose.model<IIssue>('Issue', issueSchema);

export default Issue;

