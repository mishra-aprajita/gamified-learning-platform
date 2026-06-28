import React from 'react';
import Avatar from './Avatar';
import LevelBadge from './LevelBadge';

export default function PostCard({ post, liked, onLike, compact = false }) {
  return (
    <div className="post-card" style={compact ? { padding: 16 } : {}}>
      <div className="post-header">
        <Avatar initials={post.initials} size="md" />
        <div className="post-meta">
          <div className="post-author">{post.author}</div>
          <div className="post-time">
            {post.time}{post.xp ? ` · ${post.xp.toLocaleString()} XP` : ''}
          </div>
        </div>
        <LevelBadge level={post.level} />
      </div>

      <div
        className="post-content"
        style={compact ? {
          fontSize: 13,
          WebkitLineClamp: 2,
          display: '-webkit-box',
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        } : {}}
      >
        {post.content}
      </div>

      <div className="post-tags" style={compact ? { marginBottom: 0 } : {}}>
        {post.tags.map(t => (
          <span key={t} className={`tag ${t}`}>{t.toUpperCase()}</span>
        ))}
      </div>

      {!compact && (
        <div className="post-actions">
          <div className={`post-action ${liked ? 'liked' : ''}`} onClick={() => onLike && onLike(post.id)}>
            {liked ? '❤️' : '🤍'} {post.likes}
          </div>
          <div className="post-action">💬 {post.comments}</div>
          <div className="post-action">↗ Share</div>
          <div className="post-action" style={{ marginLeft: 'auto' }}>🔖</div>
        </div>
      )}
    </div>
  );
}
