const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth');
const {
  register,
  login,
  googleLogin,
  getMe,
  updateProfile,
  changePassword,
  setFocusAreas,
} = require('../controllers/authController');

router.post('/register',         register);
router.post('/login',            login);
router.post('/google',           googleLogin);
router.get ('/me',               protect, getMe);
router.put ('/update',           protect, updateProfile);
router.put ('/change-password',  protect, changePassword);
router.put ('/focus-areas',      protect, setFocusAreas);

module.exports = router;
