// routes/pomodoro.js
const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth');
const {
  completeSession,
  getTodaySessions,
  getStats,
} = require('../controllers/pomodoroController');

router.post('/complete',  protect, completeSession);
router.get ('/today',     protect, getTodaySessions);
router.get ('/stats',     protect, getStats);

module.exports = router;
