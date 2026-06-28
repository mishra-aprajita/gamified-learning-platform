const Post = require('../models/Post');
const User = require('../models/User');
const { XP_REWARDS, updateStreak } = require('../utils/xpHelper');

// ────────────────────────────────────────────
// @route  GET /api/posts
// @desc   Get all posts (feed) with pagination
// @access Public
// ────────────────────────────────────────────
exports.getPosts = async (req, res, next) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 10;
    const tag   = req.query.tag; // filter by tag

    const query = tag ? { tags: tag } : {};

    const posts = await Post.find(query)
      .populate('author', 'name avatar level xp streak')
      .populate('comments.user', 'name avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Post.countDocuments(query);

    res.status(200).json({
      success: true,
      count: posts.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      posts,
    });
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────
// @route  POST /api/posts
// @desc   Create a new post + award XP + update streak
// @access Private
// ────────────────────────────────────────────
exports.createPost = async (req, res, next) => {
  try {
    const { content, tags } = req.body;
    const user = await User.findById(req.user._id);

    // Create post
    const post = await Post.create({
      author: user._id, content, tags,
    });

    // ── XP & Streak logic ────────────────────
    let totalXP = XP_REWARDS.POST_CREATED;
    const { streakUpdated, bonusXP } = updateStreak(user);
    if (streakUpdated) totalXP += bonusXP;

    user.xp          += totalXP;
    user.totalPosts  += 1;
    // level is updated automatically via pre-save hook
    await user.save();

    // Populate author before sending back
    await post.populate('author', 'name avatar level xp streak');

    res.status(201).json({
      success: true,
      post,
      xpEarned: totalXP,
      streakUpdated,
      newStreak: user.streak,
      newLevel:  user.level,
    });
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────
// @route  GET /api/posts/:id
// @desc   Get single post
// @access Public
// ────────────────────────────────────────────
exports.getPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'name avatar level xp streak')
      .populate('comments.user', 'name avatar level');

    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    res.status(200).json({ success: true, post });
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────
// @route  DELETE /api/posts/:id
// @desc   Delete own post
// @access Private
// ────────────────────────────────────────────
exports.deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this post' });
    }

    await post.deleteOne();
    await User.findByIdAndUpdate(req.user._id, { $inc: { totalPosts: -1 } });

    res.status(200).json({ success: true, message: 'Post deleted' });
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────
// @route  PUT /api/posts/:id/like
// @desc   Like / unlike a post
// @access Private
// ────────────────────────────────────────────
exports.likePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const userId    = req.user._id;
    const alreadyLiked = post.likes.includes(userId);

    if (alreadyLiked) {
      // Unlike
      post.likes = post.likes.filter(id => id.toString() !== userId.toString());
    } else {
      // Like
      post.likes.push(userId);
      // Award XP to post author (not to the liker)
      if (post.author.toString() !== userId.toString()) {
        await User.findByIdAndUpdate(post.author, { $inc: { xp: XP_REWARDS.POST_LIKED } });
      }
    }

    await post.save();
    res.status(200).json({
      success: true,
      liked: !alreadyLiked,
      likeCount: post.likes.length,
    });
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────
// @route  POST /api/posts/:id/comments
// @desc   Add a comment
// @access Private
// ────────────────────────────────────────────
exports.addComment = async (req, res, next) => {
  try {
    const { content } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    post.comments.push({ user: req.user._id, content });
    await post.save();

    // Award XP to commenter
    await User.findByIdAndUpdate(req.user._id, { $inc: { xp: XP_REWARDS.COMMENT_MADE, totalComments: 1 } });

    await post.populate('comments.user', 'name avatar level');
    const newComment = post.comments[post.comments.length - 1];

    res.status(201).json({ success: true, comment: newComment });
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────
// @route  DELETE /api/posts/:id/comments/:commentId
// @desc   Delete own comment
// @access Private
// ────────────────────────────────────────────
exports.deleteComment = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });

    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    comment.deleteOne();
    await post.save();
    res.status(200).json({ success: true, message: 'Comment deleted' });
  } catch (err) {
    next(err);
  }
};
