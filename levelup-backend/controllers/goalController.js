// controllers/goalController.js
const Goal = require('../models/Goal');
const User = require('../models/User');

// XP reward for completing a goal (scales a little with target size)
const GOAL_COMPLETE_BASE_XP = 150;

// ────────────────────────────────────────────
// @route  GET /api/goals
// @desc   Get all goals for current user
// @access Private
// ────────────────────────────────────────────
exports.getGoals = async (req, res, next) => {
  try {
    const { status } = req.query; // optional filter: active | completed | abandoned
    const query = { user: req.user._id };
    if (status) query.status = status;

    const goals = await Goal.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: goals.length, goals });
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────
// @route  POST /api/goals
// @desc   Create a new learning goal
// @access Private
// ────────────────────────────────────────────
exports.createGoal = async (req, res, next) => {
  try {
    const { title, description, category, targetValue, unit, deadline } = req.body;

    const goal = await Goal.create({
      user: req.user._id,
      title,
      description,
      category,
      targetValue,
      unit,
      deadline,
    });

    res.status(201).json({ success: true, goal });
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────
// @route  GET /api/goals/:id
// @desc   Get a single goal
// @access Private
// ────────────────────────────────────────────
exports.getGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });
    res.status(200).json({ success: true, goal });
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────
// @route  PUT /api/goals/:id
// @desc   Update goal details (title, target, deadline, etc.)
// @access Private
// ────────────────────────────────────────────
exports.updateGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });

    const { title, description, category, targetValue, unit, deadline } = req.body;
    if (title !== undefined)       goal.title = title;
    if (description !== undefined) goal.description = description;
    if (category !== undefined)    goal.category = category;
    if (targetValue !== undefined) goal.targetValue = targetValue;
    if (unit !== undefined)        goal.unit = unit;
    if (deadline !== undefined)    goal.deadline = deadline;

    await goal.save();
    res.status(200).json({ success: true, goal });
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────
// @route  PUT /api/goals/:id/progress
// @desc   Update progress (currentValue) on a goal
// @access Private
// ────────────────────────────────────────────
exports.updateProgress = async (req, res, next) => {
  try {
    const { increment, value } = req.body;
    // Either pass { increment: 5 } to add 5, or { value: 20 } to set directly

    const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });

    const wasActive = goal.status === 'active';

    if (typeof value === 'number') {
      goal.currentValue = Math.max(0, value);
    } else if (typeof increment === 'number') {
      goal.currentValue = Math.max(0, goal.currentValue + increment);
    }

    await goal.save(); // pre-save hook auto-marks completed if target reached

    let xpEarned = 0;
    // Award XP only the moment it transitions active -> completed
    if (wasActive && goal.status === 'completed') {
      xpEarned = GOAL_COMPLETE_BASE_XP;
      await User.findByIdAndUpdate(req.user._id, { $inc: { xp: xpEarned } });
    }

    res.status(200).json({ success: true, goal, xpEarned, justCompleted: xpEarned > 0 });
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────
// @route  PUT /api/goals/:id/abandon
// @desc   Mark a goal as abandoned
// @access Private
// ────────────────────────────────────────────
exports.abandonGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { status: 'abandoned' },
      { new: true }
    );
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });
    res.status(200).json({ success: true, goal });
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────
// @route  DELETE /api/goals/:id
// @desc   Delete a goal
// @access Private
// ────────────────────────────────────────────
exports.deleteGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });
    res.status(200).json({ success: true, message: 'Goal deleted' });
  } catch (err) {
    next(err);
  }
};
