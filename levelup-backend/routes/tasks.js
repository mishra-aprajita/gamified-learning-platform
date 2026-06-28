// routes/tasks.js
const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth');
const {
  getTodayTasks,
  toggleTask,
  getTaskHistory,
} = require('../controllers/taskController');

router.get('/today',          protect, getTodayTasks);
router.get('/history',        protect, getTaskHistory);
router.put('/:id/complete',   protect, toggleTask);

module.exports = router;
