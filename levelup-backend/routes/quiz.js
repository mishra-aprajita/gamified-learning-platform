// routes/quiz.js
const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth');
const {
  getTodayQuiz,
  submitQuiz,
  getQuizHistory,
  getQuizLeaderboard,
} = require('../controllers/quizController');

router.get ('/today',        protect, getTodayQuiz);
router.post('/submit',       protect, submitQuiz);
router.get ('/history',      protect, getQuizHistory);
router.get ('/leaderboard',  getQuizLeaderboard);

module.exports = router;
