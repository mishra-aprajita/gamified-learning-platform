// ── XP reward values ─────────────────────────
const XP_REWARDS = {
  POST_CREATED:    50,
  POST_LIKED:      10,   // XP for the post author when someone likes
  COMMENT_MADE:    15,
  STREAK_BONUS:    30,   // daily streak bonus
  STREAK_WEEK:     100,  // bonus for 7-day streak
  STREAK_MONTH:    500,  // bonus for 30-day streak
  PROFILE_COMPLETE: 100,
};

// ── Level thresholds ─────────────────────────
const LEVELS = [
  { name: 'Beginner',  minXP: 0,    number: 1 },
  { name: 'Explorer',  minXP: 500,  number: 2 },
  { name: 'Builder',   minXP: 1500, number: 3 },
  { name: 'Hacker',    minXP: 3500, number: 4 },
  { name: 'Architect', minXP: 7000, number: 5 },
];

const getLevelFromXP = (xp) => {
  let current = LEVELS[0];
  for (const l of LEVELS) {
    if (xp >= l.minXP) current = l;
  }
  return current;
};

const getNextLevel = (xp) => {
  const currentLevel = getLevelFromXP(xp);
  const nextIndex = LEVELS.findIndex(l => l.name === currentLevel.name) + 1;
  return LEVELS[nextIndex] || null; // null if already max level
};

const getXPProgress = (xp) => {
  const current = getLevelFromXP(xp);
  const next    = getNextLevel(xp);
  if (!next) return { percent: 100, current, next: null, xpNeeded: 0 };

  const range   = next.minXP - current.minXP;
  const earned  = xp - current.minXP;
  const percent = Math.round((earned / range) * 100);
  return { percent, current, next, xpNeeded: next.minXP - xp };
};

// ── Streak helpers ───────────────────────────
const isToday = (date) => {
  if (!date) return false;
  const d = new Date(date);
  const now = new Date();
  return (
    d.getDate()     === now.getDate()   &&
    d.getMonth()    === now.getMonth()  &&
    d.getFullYear() === now.getFullYear()
  );
};

const isYesterday = (date) => {
  if (!date) return false;
  const d   = new Date(date);
  const yes = new Date();
  yes.setDate(yes.getDate() - 1);
  return (
    d.getDate()     === yes.getDate()   &&
    d.getMonth()    === yes.getMonth()  &&
    d.getFullYear() === yes.getFullYear()
  );
};

/**
 * Update user streak after a post.
 * Returns { streakUpdated, bonusXP }
 */
const updateStreak = (user) => {
  let bonusXP = 0;

  if (isToday(user.lastPostDate)) {
    // Already posted today — no streak change
    return { streakUpdated: false, bonusXP: 0 };
  }

  if (isYesterday(user.lastPostDate)) {
    // Posted yesterday → extend streak
    user.streak += 1;
  } else {
    // Gap of more than 1 day → reset streak
    user.streak = 1;
  }

  user.lastPostDate = new Date();
  if (user.streak > user.bestStreak) user.bestStreak = user.streak;

  // Streak bonuses
  bonusXP += XP_REWARDS.STREAK_BONUS;
  if (user.streak === 7)  bonusXP += XP_REWARDS.STREAK_WEEK;
  if (user.streak === 30) bonusXP += XP_REWARDS.STREAK_MONTH;

  return { streakUpdated: true, bonusXP };
};

module.exports = { XP_REWARDS, LEVELS, getLevelFromXP, getNextLevel, getXPProgress, updateStreak, isToday };
