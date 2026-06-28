// models/Goal.js
const mongoose = require('mongoose');

const GoalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', required: true,
    },
    title: {
      type: String, required: [true, 'Goal title is required'],
      trim: true, maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String, default: '', maxlength: 300,
    },
    category: {
      type: String,
      enum: ['dsa', 'web', 'ml', 'project', 'sys', 'general'],
      default: 'general',
    },
    targetValue: {
      // e.g. 100 (problems), 30 (days), 3 (projects)
      type: Number, required: true, min: 1,
    },
    currentValue: {
      type: Number, default: 0, min: 0,
    },
    unit: {
      // e.g. "problems", "days", "projects", "hours"
      type: String, default: 'tasks', maxlength: 20,
    },
    deadline: {
      type: Date, default: null,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'abandoned'],
      default: 'active',
    },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Virtual: progress percentage
GoalSchema.virtual('progressPercent').get(function () {
  if (this.targetValue === 0) return 0;
  return Math.min(100, Math.round((this.currentValue / this.targetValue) * 100));
});

GoalSchema.set('toJSON', { virtuals: true });

// Auto-mark completed when target reached
GoalSchema.pre('save', function (next) {
  if (this.currentValue >= this.targetValue && this.status === 'active') {
    this.status = 'completed';
    this.completedAt = new Date();
  }
  next();
});

module.exports = mongoose.model('Goal', GoalSchema);
