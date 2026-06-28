const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth');
const {
  getPosts,
  createPost,
  getPost,
  deletePost,
  likePost,
  addComment,
  deleteComment,
} = require('../controllers/postController');

router.get ('/',                              getPosts);
router.post('/',               protect,       createPost);
router.get ('/:id',                           getPost);
router.delete('/:id',          protect,       deletePost);
router.put ('/:id/like',       protect,       likePost);
router.post('/:id/comments',   protect,       addComment);
router.delete('/:id/comments/:commentId', protect, deleteComment);

module.exports = router;
