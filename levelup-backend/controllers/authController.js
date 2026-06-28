const jwt  = require('jsonwebtoken');
const User = require('../models/User');

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

    // Verify the ID token directly with Google (no extra npm package needed)
    const verifyRes = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`
    );
    const payload = await verifyRes.json();

    if (!verifyRes.ok || !payload.email) {
      return res.status(401).json({ success: false, message: 'Invalid Google token' });
    }

    // Confirm the token was issued for OUR app, not someone else's
    if (process.env.GOOGLE_CLIENT_ID && payload.aud !== process.env.GOOGLE_CLIENT_ID) {
      return res.status(401).json({ success: false, message: 'Google token was not issued for this app' });
    }

    const { sub: googleId, email, name, picture } = payload;

    // Find by googleId first, then fall back to matching email (account linking)
    let user = await User.findOne({ googleId });
    if (!user) {
      user = await User.findOne({ email: email.toLowerCase() });
      if (user) {
        // Existing local account with same email -> link Google to it
        user.googleId = googleId;
        user.authProvider = 'google';
        if (!user.avatar) user.avatar = picture || '';
        await user.save();
      }
    }

    if (!user) {
      // Brand new user via Google
      user = await User.create({
        name: name || email.split('@')[0],
        email: email.toLowerCase(),
        googleId,
        authProvider: 'google',
        avatar: picture || '',
      });
    }

    sendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────
// @route  POST /api/auth/register
// @desc   Register new user
// @access Public
// ────────────────────────────────────────────
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, bio, skills } = req.body;

    // Check duplicate email
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({ name, email, password, bio, skills });
    sendToken(user, 201, res);
  } catch (err) {
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

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please enter email and password' });
    }

    // Include password field (excluded by default)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
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
