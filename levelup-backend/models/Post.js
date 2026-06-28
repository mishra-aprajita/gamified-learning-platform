const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema(
  {
    user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, maxlength: 500 },
  },
  { timestamps: true }
);

const PostSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', required: true,
    },
    content: {
      type: String,
      required: [true, 'Post content is required'],
      maxlength: [1000, 'Post cannot exceed 1000 characters'],
    },
    tags: [{
      type: String,
      enum: ['dsa', 'web', 'ml', 'project', 'sys', 'general'],
    }],
    likes:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [CommentSchema],
    xpAwarded: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Virtual: like count
PostSchema.virtual('likeCount').get(function () {
  return this.likes.length;
});

// Virtual: comment count
PostSchema.virtual('commentCount').get(function () {
  return this.comments.length;
});

PostSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Post', PostSchema);
