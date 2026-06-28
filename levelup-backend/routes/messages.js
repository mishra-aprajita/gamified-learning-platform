const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth');
const {
  getConversations,
  getMessages,
  sendMessage,
} = require('../controllers/messageController');

router.get ('/',           protect, getConversations);
router.get ('/:userId',    protect, getMessages);
router.post('/:userId',    protect, sendMessage);

module.exports = router;
