// controllers/pomodoroController.js
const PomodoroSession = require('../models/PomodoroSession');
const User = require('../models/User');

const XP_PER_SESSION = 25;

const startOfDay = (d = new Date()) => {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  return date;
};

// ────────────────────────────────────────────
// @route  POST /api/pomodoro/complete
// @desc   Log a completed focus session + award XP
// @body   { durationMinutes, label }
// @access Private
// ────────────────────────────────────────────
exports.completeSession = async (req, res, next) => {
  try {
    const { durationMinutes, label } = req.body;

    const session = await PomodoroSession.create({
      user: req.user._id,
      durationMinutes: durationMinutes || 25,
      label: label || '',
      xpEarned: XP_PER_SESSION,
    });

    await User.findByIdAndUpdate(req.user._id, { $inc: { xp: XP_PER_SESSION } });

    // Count today's total sessions for a quick streak-like display
    const today = startOfDay();
    const todayCount = await PomodoroSession.countDocuments({
      user: req.user._id,
      completedAt: { $gte: today },
    });

    res.status(201).json({
      success: true,
      session,
      xpEarned: XP_PER_SESSION,
      todayCount,
    });
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────
// @route  GET /api/pomodoro/today
// @desc   Get today's completed sessions
// @access Private
// ────────────────────────────────────────────
exports.getTodaySessions = async (req, res, next) => {
  try {
    const today = startOfDay();
    const sessions = await PomodoroSession.find({
      user: req.user._id,
      completedAt: { $gte: today },
    }).sort({ completedAt: -1 });

    const totalMinutes = sessions.reduce((sum, s) => sum + s.durationMinutes, 0);

    res.status(200).json({
      success: true,
      sessions,
      count: sessions.length,
      totalMinutes,
    });
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────
// @route  GET /api/pomodoro/stats
// @desc   Get last 7 days of session counts (for chart)
// @access Private
// ────────────────────────────────────────────
exports.getStats = async (req, res, next) => {
  try {
    const since = new Date();
    since.setDate(since.getDate() - 6);
    const sinceStart = startOfDay(since);

    const sessions = await PomodoroSession.find({
      user: req.user._id,
      completedAt: { $gte: sinceStart },
    });

    // Group by day
    const byDay = {};
    sessions.forEach(s => {
      const key = startOfDay(s.completedAt).toISOString().slice(0, 10);
      byDay[key] = (byDay[key] || 0) + 1;
    });

    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days.push({ date: key, count: byDay[key] || 0 });
    }

    const totalSessions = sessions.length;
    const totalFocusMinutes = sessions.reduce((sum, s) => sum + s.durationMinutes, 0);

    res.status(200).json({ success: true, days, totalSessions, totalFocusMinutes });
  } catch (err) {
    next(err);
  }
};
