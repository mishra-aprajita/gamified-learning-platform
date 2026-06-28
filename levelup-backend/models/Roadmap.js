// models/Roadmap.js
const mongoose = require('mongoose');

// ── A single step within a roadmap template ──
const StepSchema = new mongoose.Schema({
  order:       { type: Number, required: true },
  title:       { type: String, required: true },
  description: { type: String, default: '' },
  xpReward:    { type: Number, default: 50 },
  resourceUrl: { type: String, default: '' }, // optional link to article/video
}, { _id: true });

// ── The roadmap template itself (DSA Roadmap, Web Dev Roadmap, etc.) ──
const RoadmapSchema = new mongoose.Schema(
  {
    title: {
      type: String, required: true, trim: true, maxlength: 100,
    },
    description: { type: String, default: '', maxlength: 300 },
    category: {
      type: String,
      enum: ['dsa', 'web', 'ml', 'sys', 'general'],
      default: 'general',
    },
    icon: { type: String, default: '🗺️' },
    steps: [StepSchema],
    isOfficial: { type: Boolean, default: true }, // pre-built vs user-created
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Roadmap', RoadmapSchema);
