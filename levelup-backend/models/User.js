const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

// ── Level thresholds ─────────────────────────
const LEVELS = [
  { name: 'Beginner',  minXP: 0    },
  { name: 'Explorer',  minXP: 500  },
  { name: 'Builder',   minXP: 1500 },
  { name: 'Hacker',    minXP: 3500 },
  { name: 'Architect', minXP: 7000 },
];

const getLevelFromXP = (xp) => {
  let level = LEVELS[0];
  for (const l of LEVELS) {
    if (xp >= l.minXP) level = l;
  }
  return level.name;
};

// ── Schema ───────────────────────────────────
const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String, required: [true, 'Name is required'],
      trim: true, maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String, required: [true, 'Email is required'],
      unique: true, lowercase: true, trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // never returned in queries by default
      required: function () { return !this.googleId; }, // not required for Google sign-in users
    },
    googleId: {
      type: String, default: null, unique: true, sparse: true,
    },
    authProvider: {
      type: String, enum: ['local', 'google'], default: 'local',
    },
    bio:    { type: String, default: '', maxlength: 200 },
    avatar: { type: String, default: '' },

    // ── Skills ─────────────────────────────
    skills: [{ type: String }],

    // ── Focus Areas (chosen during onboarding's Goal Selection step) ──
    focusAreas: [{
      category:        { type: String, enum: ['dsa', 'coding', 'aptitude', 'placement', 'communication'] },
      weeklyTargetPct: { type: Number, default: 40, min: 10, max: 100 },
    }],
    onboardingComplete: { type: Boolean, default: false },

    // ── XP & Level ─────────────────────────
    xp: { type: Number, default: 0 },
    level: {
      type: String,
      enum: ['Beginner', 'Explorer', 'Builder', 'Hacker', 'Architect'],
      default: 'Beginner',
    },

    // ── Streak ─────────────────────────────
    streak:      { type: Number, default: 0 },
    bestStreak:  { type: Number, default: 0 },
    lastPostDate: { type: Date, default: null },

    // ── Quiz Streak (separate from posting streak) ──
    quizStreak:     { type: Number, default: 0 },
    bestQuizStreak: { type: Number, default: 0 },
    lastQuizDate:   { type: Date, default: null },

    // ── Social ─────────────────────────────
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    // ── Stats ──────────────────────────────
    totalPosts:    { type: Number, default: 0 },
    totalLikes:    { type: Number, default: 0 },
    totalComments: { type: Number, default: 0 },

    role: { type: String, enum: ['student', 'mentor', 'admin'], default: 'student' },
  },
  { timestamps: true }
);

// ── Hash password before saving ──────────────
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ── Auto-update level when XP changes ────────
UserSchema.pre('save', function (next) {
  if (this.isModified('xp')) {
    this.level = getLevelFromXP(this.xp);
  }
  next();
});

// ── Instance methods ─────────────────────────
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

UserSchema.methods.addXP = async function (amount) {
  this.xp += amount;
  this.level = getLevelFromXP(this.xp);
  await this.save();
};

// ── Static: get leaderboard ──────────────────
UserSchema.statics.getLeaderboard = function (limit = 50) {
  return this.find()
    .select('name email avatar xp level streak totalPosts followers')
    .sort({ xp: -1 })
    .limit(limit);
};

module.exports = mongoose.model('User', UserSchema);
