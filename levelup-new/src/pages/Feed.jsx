// src/pages/Feed.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { postAPI } from '../services/api';
import Avatar from '../components/Avatar';
import PostCard from '../components/PostCard';

const TABS = [['all','All'],['dsa','DSA'],['web','Web'],['ml','ML'],['project','Projects'],['sys','System']];

export default function Feed() {
  const { user, updateUser } = useAuth();
  const [posts,    setPosts]   = useState([]);
  const [tab,      setTab]     = useState('all');
  const [text,     setText]    = useState('');
  const [selTag,   setSelTag]  = useState(null);
  const [likedIds, setLikedIds]= useState([]);
  const [loading,  setLoading] = useState(true);
  const [posting,  setPosting] = useState(false);
  const [page,     setPage]    = useState(1);
  const [hasMore,  setHasMore] = useState(true);

  const loadPosts = useCallback(async (tagVal, pageNum) => {
    try {
      setLoading(true);
      const res = await postAPI.getAll(tagVal === 'all' ? '' : tagVal, pageNum);
      if (pageNum === 1) setPosts(res.posts);
      else setPosts(prev => [...prev, ...res.posts]);
      setHasMore(pageNum < res.pages);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { setPage(1); loadPosts(tab, 1); }, [tab, loadPosts]);

  const handlePost = async () => {
    if (!text.trim()) return;
    setPosting(true);
    try {
      const res = await postAPI.create({ content: text, tags: selTag ? [selTag] : [] });
      setPosts(prev => [res.post, ...prev]);
      setText(''); setSelTag(null);
      if (res.xpEarned) updateUser({ xp: user.xp + res.xpEarned, streak: res.newStreak, level: res.newLevel });
    } catch (e) { console.error(e); }
    finally { setPosting(false); }
  };

  const toggleLike = async (postId) => {
    try {
      const res = await postAPI.like(postId);
      setLikedIds(prev => res.liked ? [...prev, postId] : prev.filter(x => x !== postId));
      setPosts(prev => prev.map(p => p._id === postId
        ? { ...p, likes: res.liked ? [...(p.likes||[]), user._id] : (p.likes||[]).filter(id => id !== user._id) }
        : p));
    } catch (e) { console.error(e); }
  };

  const normalizePost = (p) => ({
    ...p, id: p._id,
    author: p.author?.name || 'Unknown',
    initials: (p.author?.name || 'UN').slice(0,2).toUpperCase(),
    level: p.author?.level || 'Beginner',
    xp: p.author?.xp,
    time: new Date(p.createdAt).toLocaleDateString(),
    likes: Array.isArray(p.likes) ? p.likes.length : p.likes,
    comments: Array.isArray(p.comments) ? p.comments.length : p.comments,
  });

  return (
    <div className="page" style={{ maxWidth:720, margin:'0 auto' }}>
      <div className="compose">
        <div style={{ display:'flex', gap:12, marginBottom:12 }}>
          <Avatar initials={(user?.name||'U').slice(0,2).toUpperCase()} size="md" />
          <div style={{ flex:1 }}>
            <textarea className="compose-input" placeholder="Share what you're learning today... 🚀"
              value={text} onChange={e => setText(e.target.value)} rows={3} />
          </div>
        </div>
        <div className="compose-footer">
          <div className="compose-tags">
            {['dsa','web','ml','project','sys'].map(t => (
              <button key={t} className={`compose-tag-btn ${selTag===t?'selected':''}`} onClick={() => setSelTag(selTag===t?null:t)}>
                #{t.toUpperCase()}
              </button>
            ))}
          </div>
          <button className="btn btn-primary btn-sm" onClick={handlePost} disabled={posting}>
            {posting ? '⏳' : 'Post ✦'}
          </button>
        </div>
      </div>

      <div className="tabs">
        {TABS.map(([v,l]) => (
          <div key={v} className={`tab ${tab===v?'active':''}`} onClick={() => setTab(v)}>{l}</div>
        ))}
      </div>

      {loading && posts.length === 0 ? (
        <div style={{ textAlign:'center', padding:60, color:'var(--text2)' }}>⏳ Loading feed...</div>
      ) : posts.length === 0 ? (
        <div style={{ textAlign:'center', padding:60, color:'var(--text2)' }}>
          <div style={{ fontSize:48, opacity:0.3 }}>📝</div>
          <div style={{ marginTop:12 }}>No posts yet. Be the first to share!</div>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {posts.map(p => (
            <PostCard key={p._id} post={normalizePost(p)}
              liked={likedIds.includes(p._id) || (Array.isArray(p.likes) && p.likes.includes(user?._id))}
              onLike={() => toggleLike(p._id)} />
          ))}
          {hasMore && (
            <button className="btn btn-ghost" style={{ width:'100%' }}
              onClick={() => { const next = page+1; setPage(next); loadPosts(tab, next); }}>
              Load more posts
            </button>
          )}
        </div>
      )}
    </div>
  );
}
