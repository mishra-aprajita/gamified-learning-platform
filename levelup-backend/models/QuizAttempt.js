// models/QuizAttempt.js
const mongoose = require('mongoose');

const AnswerSchema = new mongoose.Schema({
  question:      { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  selectedIndex: { type: Number, required: true },
  isCorrect:     { type: Boolean, required: true },
}, { _id: false });

const QuizAttemptSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', required: true,
    },
    date: {
      // normalized to midnight — one attempt per user per day
      type: Date, required: true,
    },
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
    answers: [AnswerSchema],
    score: { type: Number, default: 0 },       // number correct
    total: { type: Number, default: 5 },
    xpEarned: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

QuizAttemptSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('QuizAttempt', QuizAttemptSchema);
