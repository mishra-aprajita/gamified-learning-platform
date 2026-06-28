// controllers/reportController.js
const Post            = require('../models/Post');
const Task             = require('../models/Task');
const QuizAttempt      = require('../models/QuizAttempt');
const PomodoroSession  = require('../models/PomodoroSession');
const Goal              = require('../models/Goal');
const User               = require('../models/User');

const startOfDay = (d = new Date()) => {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  return date;
};

// ────────────────────────────────────────────
// @route  GET /api/reports/weekly
// @desc   Get a full weekly activity report for the current user
//         (this week vs last week, broken down by feature)
// @access Private
// ────────────────────────────────────────────
exports.getWeeklyReport = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const now = new Date();
    const thisWeekStart = startOfDay(new Date(now));
    thisWeekStart.setDate(thisWeekStart.getDate() - 6); // last 7 days inclusive of today

    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    const lastWeekEnd = new Date(thisWeekStart); // exclusive end = start of this week

    // ── Run all aggregations in parallel ──────
    const [
      postsThisWeek, postsLastWeek,
      tasksThisWeek, tasksLastWeek,
      quizThisWeek,  quizLastWeek,
      pomodoroThisWeek, pomodoroLastWeek,
      goalsCompletedThisWeek,
      user,
    ] = await Promise.all([
      Post.find({ author: userId, createdAt: { $gte: thisWeekStart } }),
      Post.find({ author: userId, createdAt: { $gte: lastWeekStart, $lt: lastWeekEnd } }),

      Task.find({ user: userId, date: { $gte: thisWeekStart }, completed: true }),
      Task.find({ user: userId, date: { $gte: lastWeekStart, $lt: lastWeekEnd }, completed: true }),

      QuizAttempt.find({ user: userId, date: { $gte: thisWeekStart }, completed: true }),
      QuizAttempt.find({ user: userId, date: { $gte: lastWeekStart, $lt: lastWeekEnd }, completed: true }),

      PomodoroSession.find({ user: userId, completedAt: { $gte: thisWeekStart } }),
      PomodoroSession.find({ user: userId, completedAt: { $gte: lastWeekStart, $lt: lastWeekEnd } }),

      Goal.find({ user: userId, status: 'completed', completedAt: { $gte: thisWeekStart } }),

      User.findById(userId),
    ]);

    // ── Build daily XP breakdown for the week (for a bar chart) ──
    const dailyXP = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date();
      day.setDate(day.getDate() - i);
      const dayStart = startOfDay(day);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const dayPosts    = postsThisWeek.filter(p => p.createdAt >= dayStart && p.createdAt < dayEnd).length;
      const dayTasks    = tasksThisWeek.filter(t => t.date >= dayStart && t.date < dayEnd).length;
      const dayQuiz     = quizThisWeek.filter(q => q.date >= dayStart && q.date < dayEnd);
      const dayPomodoro = pomodoroThisWeek.filter(p => p.completedAt >= dayStart && p.completedAt < dayEnd).length;

      const quizXP = dayQuiz.reduce((sum, q) => sum + (q.xpEarned || 0), 0);

      dailyXP.push({
        date: dayStart.toISOString().slice(0, 10),
        label: dayStart.toLocaleDateString(undefined, { weekday: 'short' }),
        posts: dayPosts,
        tasksCompleted: dayTasks,
        quizXP,
        pomodoroSessions: dayPomodoro,
        // Rough estimated XP for that day (posts*50 + tasks*~17avg + quizXP + pomodoro*25)
        estimatedXP: dayPosts * 50 + dayTasks * 17 + quizXP + dayPomodoro * 25,
      });
    }

    const weeklyXPTotal = dailyXP.reduce((sum, d) => sum + d.estimatedXP, 0);

    // ── Helper to compute % change ──
    const pctChange = (curr, prev) => {
      if (prev === 0) return curr > 0 ? 100 : 0;
      return Math.round(((curr - prev) / prev) * 100);
    };

    const summary = {
      posts: {
        thisWeek: postsThisWeek.length,
        lastWeek: postsLastWeek.length,
        change: pctChange(postsThisWeek.length, postsLastWeek.length),
      },
      tasksCompleted: {
        thisWeek: tasksThisWeek.length,
        lastWeek: tasksLastWeek.length,
        change: pctChange(tasksThisWeek.length, tasksLastWeek.length),
      },
      quizzesCompleted: {
        thisWeek: quizThisWeek.length,
        lastWeek: quizLastWeek.length,
        change: pctChange(quizThisWeek.length, quizLastWeek.length),
        avgScoreThisWeek: quizThisWeek.length
          ? Math.round((quizThisWeek.reduce((s, q) => s + q.score, 0) / quizThisWeek.length) * 100) / 100
          : 0,
      },
      pomodoroSessions: {
        thisWeek: pomodoroThisWeek.length,
        lastWeek: pomodoroLastWeek.length,
        change: pctChange(pomodoroThisWeek.length, pomodoroLastWeek.length),
        focusMinutesThisWeek: pomodoroThisWeek.reduce((s, p) => s + p.durationMinutes, 0),
      },
      goalsCompleted: goalsCompletedThisWeek.length,
    };

    // ── Most active day this week ──
    const mostActiveDay = dailyXP.reduce((best, d) => d.estimatedXP > (best?.estimatedXP || -1) ? d : best, null);

    // ── Simple personalized recommendation ──
    let recommendation = "You're doing great — keep the momentum going! 🚀";
    if (summary.posts.thisWeek === 0) {
      recommendation = 'Try sharing at least one learning update this week to keep your streak alive 📝';
    } else if (summary.quizzesCompleted.thisWeek < 3) {
      recommendation = 'Take the Daily Quiz a few more times this week to sharpen your fundamentals ❓';
    } else if (summary.pomodoroSessions.thisWeek < 3) {
      recommendation = 'Try a few Pomodoro focus sessions to build deeper concentration habits ⏱️';
    }

    res.status(200).json({
      success: true,
      weekRange: { start: thisWeekStart, end: now },
      currentXP: user.xp,
      currentStreak: user.streak,
      currentLevel: user.level,
      weeklyXPTotal,
      dailyXP,
      mostActiveDay,
      summary,
      recommendation,
    });
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────
// @route  GET /api/reports/monthly
// @desc   Lightweight monthly XP trend (for the bar chart seen in reference UI)
// @access Private
// ────────────────────────────────────────────
exports.getMonthlyTrend = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const months = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd    = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

      const posts = await Post.countDocuments({ author: userId, createdAt: { $gte: monthStart, $lt: monthEnd } });
      const pomodoro = await PomodoroSession.countDocuments({ user: userId, completedAt: { $gte: monthStart, $lt: monthEnd } });

      months.push({
        label: monthStart.toLocaleDateString(undefined, { month: 'short' }),
        posts,
        pomodoroSessions: pomodoro,
        estimatedXP: posts * 50 + pomodoro * 25,
      });
    }

    res.status(200).json({ success: true, months });
  } catch (err) {
    next(err);
  }
};
