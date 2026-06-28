// models/UserRoadmap.js
const mongoose = require('mongoose');

const UserRoadmapSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', required: true,
    },
    roadmap: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Roadmap', required: true,
    },
    // Set of step._id values the user has completed
    completedSteps: [{ type: mongoose.Schema.Types.ObjectId }],
    status: {
      type: String,
      enum: ['active', 'completed'],
      default: 'active',
    },
    startedAt:   { type: Date, default: Date.now },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// A user can only follow a given roadmap once
UserRoadmapSchema.index({ user: 1, roadmap: 1 }, { unique: true });

module.exports = mongoose.model('UserRoadmap', UserRoadmapSchema);
