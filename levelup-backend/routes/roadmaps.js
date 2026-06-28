// routes/roadmaps.js
const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth');
const {
  getRoadmaps,
  getRoadmap,
  getMyRoadmaps,
  startRoadmap,
  toggleStep,
  leaveRoadmap,
} = require('../controllers/roadmapController');

// Public browse routes
router.get('/',      getRoadmaps);
router.get('/mine',  protect, getMyRoadmaps);
router.get('/:id',   getRoadmap);

// Private progress routes
router.post  ('/:id/start',                    protect, startRoadmap);
router.put   ('/:id/steps/:stepId/toggle',     protect, toggleStep);
router.delete('/:id/leave',                    protect, leaveRoadmap);

module.exports = router;
