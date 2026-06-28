// routes/nova.js
const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth');
const { chatWithNova, getDailyTip } = require('../controllers/novaController');

router.post('/chat',       protect, chatWithNova);
router.get ('/daily-tip',  protect, getDailyTip);

module.exports = router;
