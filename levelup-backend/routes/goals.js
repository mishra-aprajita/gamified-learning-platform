// routes/goals.js
const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth');
const {
  getGoals,
  createGoal,
  getGoal,
  updateGoal,
  updateProgress,
  abandonGoal,
  deleteGoal,
} = require('../controllers/goalController');

router.get   ('/',                  protect, getGoals);
router.post  ('/',                  protect, createGoal);
router.get   ('/:id',               protect, getGoal);
router.put   ('/:id',               protect, updateGoal);
router.put   ('/:id/progress',      protect, updateProgress);
router.put   ('/:id/abandon',       protect, abandonGoal);
router.delete('/:id',               protect, deleteGoal);

module.exports = router;
