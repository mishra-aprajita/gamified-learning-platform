const jwt  = require('jsonwebtoken');
const User = require('../models/User');
const { duplicateKeyMessage } = require('../utils/mongoDuplicateKey');

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

// ── Generate JWT token ───────────────────────
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

// ── Send token response ──────────────────────
const sendToken = (user, statusCode, res) => {
  const token = generateToken(user._id);
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      _id:         user._id,
      name:        user.name,
      email:       user.email,
      avatar:      user.avatar,
      bio:         user.bio,
      skills:      user.skills,
      xp:          user.xp,
      level:       user.level,
      streak:      user.streak,
      bestStreak:  user.bestStreak,
      totalPosts:  user.totalPosts,
      followers:   user.followers.length,
      following:   user.following.length,
      role:        user.role,
      focusAreas:          user.focusAreas,
      onboardingComplete:  user.onboardingComplete,
    },
  });
};

const normalizeEmail = (email) => String(email || '').toLowerCase().trim();

const validateRegisterInput = ({ name, email, password }) => {
  const trimmedName = String(name || '').trim();
  if (!trimmedName) {
    return { ok: false, status: 400, message: 'Name is required' };
  }
  if (trimmedName.length > 50) {
    return { ok: false, status: 400, message: 'Name cannot exceed 50 characters' };
  }

  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    return { ok: false, status: 400, message: 'Email is required' };
  }
  if (!EMAIL_REGEX.test(normalizedEmail)) {
    return { ok: false, status: 400, message: 'Please enter a valid email' };
  }

  if (!password || String(password).length < 6) {
    return { ok: false, status: 400, message: 'Password must be at least 6 characters' };
  }

  return { ok: true, trimmedName, normalizedEmail };
};

// ────────────────────────────────────────────
// @route  POST /api/auth/google
// @desc   Login or register via Google Sign-In
// @body   { credential }  ← the ID token from Google's button
// @access Public
// ────────────────────────────────────────────
exports.googleLogin = async (req, res, next) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ success: false, message: 'Missing Google credential' });
    }

    const verifyRes = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`
    );
    const payload = await verifyRes.json();

    if (!verifyRes.ok || !payload.email) {
      return res.status(401).json({ success: false, message: 'Invalid Google token' });
    }

    if (process.env.GOOGLE_CLIENT_ID && payload.aud !== process.env.GOOGLE_CLIENT_ID) {
      return res.status(401).json({ success: false, message: 'Google token was not issued for this app' });
    }

    const googleId = payload.sub;
    const email = normalizeEmail(payload.email);
    const name = payload.name || email.split('@')[0];
    const picture = payload.picture || '';

    let user = await User.findOne({ googleId });
    if (!user) {
      user = await User.findOne({ email }).select('+password');
      if (user) {
        if (user.password && !user.googleId) {
          return res.status(409).json({
            success: false,
            message: 'This email is already registered using password. Sign in with email and password.',
          });
        }

        user.googleId = googleId;
        user.authProvider = 'google';
        if (!user.avatar && picture) user.avatar = picture;
        await user.save();
      }
    }

    if (!user) {
      user = await User.create({
        name,
        email,
        googleId,
        authProvider: 'google',
        avatar: picture,
      });
    }

    sendToken(user, 200, res);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: duplicateKeyMessage(err) });
    }
    next(err);
  }
};

// ────────────────────────────────────────────
// @route  POST /api/auth/register
// @desc   Register new user (local email/password only)
// @access Public
// ────────────────────────────────────────────
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, bio, skills } = req.body;

    const validation = validateRegisterInput({ name, email, password });
    if (!validation.ok) {
      return res.status(validation.status).json({ success: false, message: validation.message });
    }

    const { trimmedName, normalizedEmail } = validation;

    const existing = await User.findOne({ email: normalizedEmail }).select('+password');
    if (existing) {
      if (existing.googleId && !existing.password) {
        return res.status(409).json({
          success: false,
          message: 'This email is registered with Google. Please sign in with Google.',
        });
      }
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({
      name: trimmedName,
      email: normalizedEmail,
      password,
      authProvider: 'local',
      ...(bio != null && bio !== '' ? { bio: String(bio).trim() } : {}),
      ...(Array.isArray(skills) ? { skills } : {}),
    });

    sendToken(user, 201, res);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: duplicateKeyMessage(err) });
    }
    next(err);
  }
};

// ────────────────────────────────────────────
// @route  POST /api/auth/login
// @desc   Login user
// @access Public
// ────────────────────────────────────────────
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || !password) {
      return res.status(400).json({ success: false, message: 'Please enter email and password' });
    }

    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.password) {
      return res.status(401).json({
        success: false,
        message: 'This account uses Google sign-in. Please continue with Google.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    sendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────
// @route  GET /api/auth/me
// @desc   Get logged-in user's profile
// @access Private
// ────────────────────────────────────────────
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('followers', 'name avatar level')
      .populate('following', 'name avatar level');

    res.status(200).json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────
// @route  PUT /api/auth/update
// @desc   Update profile (name, bio, skills, avatar)
// @access Private
// ────────────────────────────────────────────
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, bio, skills, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, bio, skills, avatar },
      { new: true, runValidators: true }
    );
    res.status(200).json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────
// @route  PUT /api/auth/change-password
// @desc   Change password
// @access Private
// ────────────────────────────────────────────
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();
    sendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────
// @route  PUT /api/auth/focus-areas
// @desc   Save the student's chosen focus areas from the Goal Selection
//         onboarding step (e.g. DSA, Coding, Aptitude, Placement, Communication)
// @body   { focusAreas: [{ category, weeklyTargetPct }, ...] }
// @access Private
// ────────────────────────────────────────────
exports.setFocusAreas = async (req, res, next) => {
  try {
    const { focusAreas } = req.body;

    if (!Array.isArray(focusAreas) || focusAreas.length === 0) {
      return res.status(400).json({ success: false, message: 'Select at least one focus area' });
    }

    const VALID_CATEGORIES = ['dsa', 'coding', 'aptitude', 'placement', 'communication'];
    const cleaned = focusAreas
      .filter(f => VALID_CATEGORIES.includes(f.category))
      .map(f => ({
        category: f.category,
        weeklyTargetPct: Math.min(100, Math.max(10, Number(f.weeklyTargetPct) || 40)),
      }));

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { focusAreas: cleaned, onboardingComplete: true },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      focusAreas: user.focusAreas,
      onboardingComplete: user.onboardingComplete,
    });
  } catch (err) {
    next(err);
  }
};
