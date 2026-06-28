// routes/reports.js
const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth');
const {
  getWeeklyReport,
  getMonthlyTrend,
} = require('../controllers/reportController');

router.get('/weekly',   protect, getWeeklyReport);
router.get('/monthly',  protect, getMonthlyTrend);

module.exports = router;
