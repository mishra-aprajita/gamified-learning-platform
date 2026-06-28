// models/Question.js
const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: ['dsa', 'web', 'ml', 'sys', 'general'],
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'easy',
    },
    questionText: {
      type: String, required: true, maxlength: 400,
    },
    options: {
      // Always exactly 4 choices
      type: [String],
      validate: {
        validator: (arr) => arr.length === 4,
        message: 'A question must have exactly 4 options',
      },
      required: true,
    },
    correctIndex: {
      // index (0-3) of the correct option
      type: Number, required: true, min: 0, max: 3,
    },
    explanation: {
      type: String, default: '', maxlength: 400,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Question', QuestionSchema);
