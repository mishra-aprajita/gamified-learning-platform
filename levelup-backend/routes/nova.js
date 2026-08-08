// routes/nova.js
const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth');
const { chatWithNova } = require('../controllers/novaController');

router.post('/chat', protect, chatWithNova);

module.exports = router;
