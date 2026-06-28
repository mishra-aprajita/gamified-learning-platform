// models/Task.js
const mongoose = require('mongoose');

// ── Default daily task templates ─────────────
// These get auto-assigned to every user each day.
const DEFAULT_DAILY_TASKS = [
  { key: 'post_update',   label: 'Share one learning update', xp: 20, icon: '📝' },
  { key: 'like_posts',    label: 'Like 3 posts from others',  xp: 10, icon: '❤️' },
  { key: 'message_peer',  label: 'Message one student/mentor', xp: 15, icon: '💬' },
  { key: 'pomodoro',      label: 'Complete 1 focus session',  xp: 25, icon: '⏱️' },
];

const TaskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', required: true,
    },
    key: {
      // identifies which default task this is (post_update, like_posts, etc.)
      type: String, required: true,
    },
    label: { type: String, required: true },
    icon:  { type: String, default: '✅' },
    xpReward: { type: Number, default: 10 },
    date: {
      // the calendar day this task belongs to (midnight, normalized)
      type: Date, required: true,
    },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// One task-of-a-kind per user per day
TaskSchema.index({ user: 1, key: 1, date: 1 }, { unique: true });

TaskSchema.statics.DEFAULT_DAILY_TASKS = DEFAULT_DAILY_TASKS;

module.exports = mongoose.model('Task', TaskSchema);
