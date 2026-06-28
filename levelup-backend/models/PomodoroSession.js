// models/PomodoroSession.js
const mongoose = require('mongoose');

const PomodoroSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', required: true,
    },
    durationMinutes: {
      // length of the focus session (usually 25)
      type: Number, required: true, default: 25,
    },
    label: {
      // what the student was working on, e.g. "DSA practice"
      type: String, default: '', maxlength: 100,
    },
    xpEarned: { type: Number, default: 25 },
    completedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PomodoroSession', PomodoroSessionSchema);
