// controllers/roadmapController.js
const Roadmap     = require('../models/Roadmap');
const UserRoadmap = require('../models/UserRoadmap');
const User        = require('../models/User');

// Bonus XP for finishing an entire roadmap (on top of per-step XP)
const ROADMAP_COMPLETE_BONUS_XP = 300;

// ────────────────────────────────────────────
// @route  GET /api/roadmaps
// @desc   Get all available roadmap templates (browse page)
// @access Public
// ────────────────────────────────────────────
exports.getRoadmaps = async (req, res, next) => {
  try {
    const { category } = req.query;
    const query = category ? { category } : {};
    const roadmaps = await Roadmap.find(query).sort({ createdAt: 1 });
    res.status(200).json({ success: true, count: roadmaps.length, roadmaps });
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────
// @route  GET /api/roadmaps/:id
// @desc   Get a single roadmap with its full step list
// @access Public
// ────────────────────────────────────────────
exports.getRoadmap = async (req, res, next) => {
  try {
    const roadmap = await Roadmap.findById(req.params.id);
    if (!roadmap) return res.status(404).json({ success: false, message: 'Roadmap not found' });
    res.status(200).json({ success: true, roadmap });
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────
// @route  GET /api/roadmaps/mine
// @desc   Get all roadmaps the current user has picked, with progress
// @access Private
// ────────────────────────────────────────────
exports.getMyRoadmaps = async (req, res, next) => {
  try {
    const userRoadmaps = await UserRoadmap.find({ user: req.user._id })
      .populate('roadmap')
      .sort({ updatedAt: -1 });

    const withProgress = userRoadmaps.map(ur => {
      const totalSteps = ur.roadmap?.steps?.length || 0;
      const doneSteps  = ur.completedSteps.length;
      const percent    = totalSteps ? Math.round((doneSteps / totalSteps) * 100) : 0;
      return {
        _id: ur._id,
        roadmap: ur.roadmap,
        completedSteps: ur.completedSteps,
        status: ur.status,
        startedAt: ur.startedAt,
        completedAt: ur.completedAt,
        totalSteps,
        doneSteps,
        percent,
      };
    });

    res.status(200).json({ success: true, userRoadmaps: withProgress });
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────
// @route  POST /api/roadmaps/:id/start
// @desc   Pick a roadmap to start following
// @access Private
// ────────────────────────────────────────────
exports.startRoadmap = async (req, res, next) => {
  try {
    const roadmap = await Roadmap.findById(req.params.id);
    if (!roadmap) return res.status(404).json({ success: false, message: 'Roadmap not found' });

    let userRoadmap = await UserRoadmap.findOne({ user: req.user._id, roadmap: roadmap._id });
    if (userRoadmap) {
      // Already started — just return existing progress
      await userRoadmap.populate('roadmap');
      return res.status(200).json({ success: true, userRoadmap, alreadyStarted: true });
    }

    userRoadmap = await UserRoadmap.create({ user: req.user._id, roadmap: roadmap._id });
    await userRoadmap.populate('roadmap');

    res.status(201).json({ success: true, userRoadmap, alreadyStarted: false });
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────
// @route  PUT /api/roadmaps/:id/steps/:stepId/toggle
// @desc   Mark a step complete / incomplete + award XP
// @access Private
// ────────────────────────────────────────────
exports.toggleStep = async (req, res, next) => {
  try {
    const { id, stepId } = req.params;

    const userRoadmap = await UserRoadmap.findOne({ user: req.user._id, roadmap: id }).populate('roadmap');
    if (!userRoadmap) return res.status(404).json({ success: false, message: "You haven't started this roadmap yet" });

    const step = userRoadmap.roadmap.steps.find(s => s._id.toString() === stepId);
    if (!step) return res.status(404).json({ success: false, message: 'Step not found' });

    const alreadyDone = userRoadmap.completedSteps.some(s => s.toString() === stepId);
    let xpEarned = 0;
    let bonusXP  = 0;

    if (alreadyDone) {
      // Un-complete -> remove XP
      userRoadmap.completedSteps = userRoadmap.completedSteps.filter(s => s.toString() !== stepId);
      await User.findByIdAndUpdate(req.user._id, { $inc: { xp: -step.xpReward } });
      if (userRoadmap.status === 'completed') {
        userRoadmap.status = 'active';
        userRoadmap.completedAt = null;
      }
    } else {
      // Complete -> award XP
      userRoadmap.completedSteps.push(step._id);
      xpEarned = step.xpReward;
      await User.findByIdAndUpdate(req.user._id, { $inc: { xp: xpEarned } });

      // Check if the whole roadmap is now finished
      const totalSteps = userRoadmap.roadmap.steps.length;
      if (userRoadmap.completedSteps.length === totalSteps) {
        userRoadmap.status = 'completed';
        userRoadmap.completedAt = new Date();
        bonusXP = ROADMAP_COMPLETE_BONUS_XP;
        await User.findByIdAndUpdate(req.user._id, { $inc: { xp: bonusXP } });
      }
    }

    await userRoadmap.save();

    res.status(200).json({
      success: true,
      userRoadmap,
      xpEarned,
      bonusXP,
      roadmapCompleted: bonusXP > 0,
    });
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────
// @route  DELETE /api/roadmaps/:id/leave
// @desc   Stop following a roadmap (removes progress)
// @access Private
// ────────────────────────────────────────────
exports.leaveRoadmap = async (req, res, next) => {
  try {
    const result = await UserRoadmap.findOneAndDelete({ user: req.user._id, roadmap: req.params.id });
    if (!result) return res.status(404).json({ success: false, message: 'You are not following this roadmap' });
    res.status(200).json({ success: true, message: 'Left the roadmap' });
  } catch (err) {
    next(err);
  }
};
