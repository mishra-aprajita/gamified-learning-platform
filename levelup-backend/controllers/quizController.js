// controllers/quizController.js
const Question    = require('../models/Question');
const QuizAttempt = require('../models/QuizAttempt');
const User        = require('../models/User');

const QUESTIONS_PER_DAY = 5;
const XP_PER_CORRECT     = 15;
const PERFECT_SCORE_BONUS = 50;  // bonus for getting all 5 right
const QUIZ_STREAK_WEEK_BONUS = 100; // bonus for a 7-day quiz streak

// ── Helpers ───────────────────────────────────
const startOfDay = (d = new Date()) => {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  return date;
};

const isSameDay = (a, b) => {
  if (!a || !b) return false;
  const da = new Date(a), db = new Date(b);
  return da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth() && da.getDate() === db.getDate();
};

const isYesterday = (date) => {
  if (!date) return false;
  const d = new Date(date);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return isSameDay(d, yesterday);
};

// Deterministic daily question picker — same 5 questions for everyone on a given day,
// but rotates day to day based on a simple date-seeded shuffle.
const pickDailyQuestions = async (date) => {
  const allQuestions = await Question.find();
  if (allQuestions.length === 0) return [];

  // Seed shuffle using the date so it's consistent across requests on the same day
  const seed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
  const shuffled = [...allQuestions].sort((a, b) => {
    const ha = (seed * 31 + a._id.toString().charCodeAt(0)) % 997;
    const hb = (seed * 31 + b._id.toString().charCodeAt(0)) % 997;
    return ha - hb;
  });

  return shuffled.slice(0, Math.min(QUESTIONS_PER_DAY, shuffled.length));
};

// ────────────────────────────────────────────
// @route  GET /api/quiz/today
// @desc   Get (or create) today's quiz attempt for current user
// @access Private
// ────────────────────────────────────────────
exports.getTodayQuiz = async (req, res, next) => {
  try {
    const today = startOfDay();
    let attempt = await QuizAttempt.findOne({ user: req.user._id, date: today });

    if (!attempt) {
      const questions = await pickDailyQuestions(today);
      if (questions.length === 0) {
        return res.status(404).json({ success: false, message: 'No quiz questions available yet' });
      }
      attempt = await QuizAttempt.create({
        user: req.user._id,
        date: today,
        questions: questions.map(q => q._id),
        total: questions.length,
      });
    }

    // Populate question text/options, but NEVER send correctIndex if not completed yet
    const questions = await Question.find({ _id: { $in: attempt.questions } });
    const orderedQuestions = attempt.questions.map(qid =>
      questions.find(q => q._id.toString() === qid.toString())
    );

    const safeQuestions = orderedQuestions.map(q => ({
      _id: q._id,
      category: q.category,
      difficulty: q.difficulty,
      questionText: q.questionText,
      options: q.options,
      // Only reveal correct answer + explanation if quiz already completed
      ...(attempt.completed ? { correctIndex: q.correctIndex, explanation: q.explanation } : {}),
    }));

    res.status(200).json({
      success: true,
      attemptId: attempt._id,
      questions: safeQuestions,
      completed: attempt.completed,
      score: attempt.score,
      total: attempt.total,
      answers: attempt.completed ? attempt.answers : [],
      quizStreak: req.user.quizStreak,
    });
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────
// @route  POST /api/quiz/submit
// @desc   Submit all answers for today's quiz at once
// @body   { answers: [{ questionId, selectedIndex }, ...] }
// @access Private
// ────────────────────────────────────────────
exports.submitQuiz = async (req, res, next) => {
  try {
    const { answers } = req.body;
    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ success: false, message: 'Answers array is required' });
    }

    const today = startOfDay();
    const attempt = await QuizAttempt.findOne({ user: req.user._id, date: today });
    if (!attempt) return res.status(404).json({ success: false, message: 'No quiz found for today — fetch it first' });
    if (attempt.completed) return res.status(400).json({ success: false, message: 'You already completed today\'s quiz' });

    const questions = await Question.find({ _id: { $in: attempt.questions } });

    let score = 0;
    const gradedAnswers = answers.map(a => {
      const q = questions.find(q => q._id.toString() === a.questionId);
      const isCorrect = q ? q.correctIndex === a.selectedIndex : false;
      if (isCorrect) score += 1;
      return { question: a.questionId, selectedIndex: a.selectedIndex, isCorrect };
    });

    attempt.answers = gradedAnswers;
    attempt.score = score;
    attempt.completed = true;
    attempt.completedAt = new Date();

    // ── XP calculation ──────────────────────
    let xpEarned = score * XP_PER_CORRECT;
    const perfectScore = score === attempt.total;
    if (perfectScore) xpEarned += PERFECT_SCORE_BONUS;

    attempt.xpEarned = xpEarned;
    await attempt.save();

    // ── Quiz streak logic ───────────────────
    const user = await User.findById(req.user._id);
    let streakBonus = 0;
    let streakExtended = false;

    if (!isSameDay(user.lastQuizDate, today)) {
      if (isYesterday(user.lastQuizDate)) {
        user.quizStreak += 1;
      } else {
        user.quizStreak = 1;
      }
      user.lastQuizDate = today;
      streakExtended = true;
      if (user.quizStreak > user.bestQuizStreak) user.bestQuizStreak = user.quizStreak;
      if (user.quizStreak % 7 === 0) streakBonus = QUIZ_STREAK_WEEK_BONUS;
    }

    user.xp += xpEarned + streakBonus;
    await user.save();

    res.status(200).json({
      success: true,
      score,
      total: attempt.total,
      xpEarned,
      streakBonus,
      perfectScore,
      quizStreak: user.quizStreak,
      streakExtended,
      // Reveal correct answers + explanations now that it's submitted
      results: questions.map(q => ({
        _id: q._id,
        questionText: q.questionText,
        options: q.options,
        correctIndex: q.correctIndex,
        explanation: q.explanation,
        userAnswer: gradedAnswers.find(a => a.question.toString() === q._id.toString())?.selectedIndex,
      })),
    });
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────
// @route  GET /api/quiz/history
// @desc   Get past quiz attempts (last 30 days) for stats/calendar
// @access Private
// ────────────────────────────────────────────
exports.getQuizHistory = async (req, res, next) => {
  try {
    const since = new Date();
    since.setDate(since.getDate() - 30);

    const attempts = await QuizAttempt.find({
      user: req.user._id,
      date: { $gte: startOfDay(since) },
      completed: true,
    }).sort({ date: 1 }).select('date score total xpEarned');

    res.status(200).json({ success: true, history: attempts });
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────
// @route  GET /api/quiz/leaderboard
// @desc   Top quiz streaks across all students
// @access Public
// ────────────────────────────────────────────
exports.getQuizLeaderboard = async (req, res, next) => {
  try {
    const users = await User.find({ quizStreak: { $gt: 0 } })
      .select('name avatar level quizStreak bestQuizStreak')
      .sort({ quizStreak: -1 })
      .limit(20);

    res.status(200).json({ success: true, leaderboard: users });
  } catch (err) {
    next(err);
  }
};
