// controllers/taskController.js
const Task = require('../models/Task');
const User = require('../models/User');

// Bonus XP for completing ALL of today's tasks
const ALL_TASKS_BONUS_XP = 50;

// ── Helper: normalize a date to midnight (so "today" always matches) ──
const startOfDay = (d = new Date()) => {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  return date;
};

// ────────────────────────────────────────────
// @route  GET /api/tasks/today
// @desc   Get (or auto-create) today's task list for current user
// @access Private
// ────────────────────────────────────────────
exports.getTodayTasks = async (req, res, next) => {
  try {
    const today = startOfDay();
    let tasks = await Task.find({ user: req.user._id, date: today });

    // First visit today -> create the default task set
    if (tasks.length === 0) {
      const defaults = Task.DEFAULT_DAILY_TASKS;
      tasks = await Task.insertMany(
        defaults.map(t => ({
          user: req.user._id,
          key: t.key,
          label: t.label,
          icon: t.icon,
          xpReward: t.xp,
          date: today,
          completed: false,
        }))
      );
    }

    const completedCount = tasks.filter(t => t.completed).length;
    res.status(200).json({
      success: true,
      tasks,
      completedCount,
      totalCount: tasks.length,
      allCompleted: completedCount === tasks.length,
    });
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────
// @route  PUT /api/tasks/:id/complete
// @desc   Mark a task complete (or toggle back to incomplete) + award XP
// @access Private
// ────────────────────────────────────────────
exports.toggleTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    const wasCompleted = task.completed;
    task.completed = !wasCompleted;
    task.completedAt = task.completed ? new Date() : null;
    await task.save();

    let xpEarned = 0;
    let bonusXP  = 0;

    if (!wasCompleted && task.completed) {
      // Just completed -> award task XP
      xpEarned = task.xpReward;
      await User.findByIdAndUpdate(req.user._id, { $inc: { xp: xpEarned } });

      // Check if this was the last task of the day -> bonus
      const today = startOfDay();
      const allTasks = await Task.find({ user: req.user._id, date: today });
      const allDone = allTasks.every(t => t.completed);
      if (allDone) {
        bonusXP = ALL_TASKS_BONUS_XP;
        await User.findByIdAndUpdate(req.user._id, { $inc: { xp: bonusXP } });
      }
    } else if (wasCompleted && !task.completed) {
      // Un-completed -> remove the XP that was awarded
      await User.findByIdAndUpdate(req.user._id, { $inc: { xp: -task.xpReward } });
    }

    res.status(200).json({
      success: true,
      task,
      xpEarned,
      bonusXP,
      allTasksBonusAwarded: bonusXP > 0,
    });
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────
// @route  GET /api/tasks/history
// @desc   Get task completion history (last 30 days) for streak-style display
// @access Private
// ────────────────────────────────────────────
exports.getTaskHistory = async (req, res, next) => {
  try {
    const since = new Date();
    since.setDate(since.getDate() - 30);

    const tasks = await Task.find({
      user: req.user._id,
      date: { $gte: startOfDay(since) },
    }).sort({ date: 1 });

    // Group by date -> { completed, total }
    const byDate = {};
    tasks.forEach(t => {
      const key = t.date.toISOString().slice(0, 10);
      if (!byDate[key]) byDate[key] = { completed: 0, total: 0 };
      byDate[key].total += 1;
      if (t.completed) byDate[key].completed += 1;
    });

    res.status(200).json({ success: true, history: byDate });
  } catch (err) {
    next(err);
  }
};
