const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth');
const {
  getUsers,
  getLeaderboard,
  getUserProfile,
  followUser,
  getUserPosts,
} = require('../controllers/userController');

router.get ('/',                  getUsers);
router.get ('/leaderboard',       getLeaderboard);
router.get ('/:id',               getUserProfile);
router.put ('/:id/follow',        protect, followUser);
router.get ('/:id/posts',         getUserPosts);

module.exports = router;
