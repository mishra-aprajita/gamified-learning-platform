const User = require('../models/User');
const Post = require('../models/Post');
const { getXPProgress } = require('../utils/xpHelper');

// ────────────────────────────────────────────
// @route  GET /api/users
// @desc   Get all users (community page)
// @access Public
// ────────────────────────────────────────────
exports.getUsers = async (req, res, next) => {
  try {
    const { level, search, sort = 'xp' } = req.query;

    let query = {};
    if (level)  query.level = level;
    if (search) query.name  = { $regex: search, $options: 'i' };

    const sortMap = { xp: { xp: -1 }, streak: { streak: -1 }, newest: { createdAt: -1 } };

    const users = await User.find(query)
      .select('name avatar bio level xp streak skills totalPosts followers role')
      .sort(sortMap[sort] || { xp: -1 })
      .limit(50);

    res.status(200).json({ success: true, count: users.length, users });
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────
// @route  GET /api/users/leaderboard
// @desc   Get leaderboard (top 50 by XP)
// @access Public
// ────────────────────────────────────────────
exports.getLeaderboard = async (req, res, next) => {
  try {
    const users = await User.getLeaderboard(50);

    // Add rank number
    const ranked = users.map((u, i) => ({
      rank: i + 1,
      _id: u._id,
      name: u.name,
      avatar: u.avatar,
      level: u.level,
      xp: u.xp,
      streak: u.streak,
      totalPosts: u.totalPosts,
      followerCount: u.followers.length,
    }));

    res.status(200).json({ success: true, leaderboard: ranked });
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────
// @route  GET /api/users/:id
// @desc   Get single user profile
// @access Public
// ────────────────────────────────────────────
exports.getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('followers', 'name avatar level')
      .populate('following', 'name avatar level');

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Get user's recent posts
    const posts = await Post.find({ author: req.params.id })
      .sort({ createdAt: -1 })
      .limit(5);

    // XP progress info
    const xpProgress = getXPProgress(user.xp);

    // Count how many users are at same / above / below level
    const levelOrder = ['Beginner', 'Explorer', 'Builder', 'Hacker', 'Architect'];
    const userLevelIndex = levelOrder.indexOf(user.level);

    const [sameLevel, aboveLevel, belowLevel] = await Promise.all([
      User.countDocuments({ level: user.level, _id: { $ne: user._id } }),
      User.countDocuments({ xp: { $gt: user.xp } }),
      User.countDocuments({ xp: { $lt: user.xp } }),
    ]);

    res.status(200).json({
      success: true,
      user,
      posts,
      xpProgress,
      stats: { sameLevel, aboveLevel, belowLevel },
    });
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────
// @route  PUT /api/users/:id/follow
// @desc   Follow / unfollow a user
// @access Private
// ────────────────────────────────────────────
exports.followUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: "You can't follow yourself" });
    }

    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ success: false, message: 'User not found' });

    const currentUser   = await User.findById(req.user._id);
    const alreadyFollowing = currentUser.following.includes(req.params.id);

    if (alreadyFollowing) {
      // Unfollow
      await User.findByIdAndUpdate(req.user._id,    { $pull: { following: req.params.id } });
      await User.findByIdAndUpdate(req.params.id,   { $pull: { followers: req.user._id  } });
    } else {
      // Follow
      await User.findByIdAndUpdate(req.user._id,    { $addToSet: { following: req.params.id } });
      await User.findByIdAndUpdate(req.params.id,   { $addToSet: { followers: req.user._id  } });
    }

    res.status(200).json({
      success: true,
      following: !alreadyFollowing,
      message: alreadyFollowing ? 'Unfollowed' : 'Following',
    });
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────
// @route  GET /api/users/:id/posts
// @desc   Get all posts by a user
// @access Public
// ────────────────────────────────────────────
exports.getUserPosts = async (req, res, next) => {
  try {
    const posts = await Post.find({ author: req.params.id })
      .populate('author', 'name avatar level')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: posts.length, posts });
  } catch (err) {
    next(err);
  }
};
