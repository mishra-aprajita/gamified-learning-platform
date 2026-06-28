// src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI, authAPI } from '../services/api';
import Avatar from '../components/Avatar';
import LevelBadge from '../components/LevelBadge';
import XPGauge from '../components/XPGauge';
import MiniChart from '../components/MiniChart';
import StreakCalendar from '../components/StreakCalendar';
import AchievementBadges from '../components/AchievementBadges';
import PostCard from '../components/PostCard';
import { weeklyXP, weekDays } from '../data/mockData';

const LEVELS     = ['Beginner','Explorer','Builder','Hacker','Architect'];
const LEVEL_XP   = { Beginner:0, Explorer:500, Builder:1500, Hacker:3500, Architect:7000 };
const NEXT_LEVEL = { Beginner:'Explorer', Explorer:'Builder', Builder:'Hacker', Hacker:'Architect', Architect:null };
const SKILL_COLORS = ['web','dsa','ml','project','sys'];

export default function Profile() {
  const { user, logout, updateUser } = useAuth();
  const [posts,    setPosts]   = useState([]);
  const [stats,    setStats]   = useState({ sameLevel:0, aboveLevel:0, belowLevel:0 });
  const [editing,  setEditing] = useState(false);
  const [loading,  setLoading] = useState(true);
  const [saving,   setSaving]  = useState(false);
  const [form,     setForm]    = useState({ name:'', bio:'', skills:'' });

  useEffect(() => {
    if (!user) return;
    setForm({ name: user.name||'', bio: user.bio||'', skills: (user.skills||[]).join(', ') });
    userAPI.getProfile(user._id)
      .then(res => { setPosts(res.posts); setStats(res.stats); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await authAPI.updateProfile({
        name: form.name, bio: form.bio,
        skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
      });
      updateUser(res.user);
      setEditing(false);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  if (!user) return null;

  const currentLevel  = user.level || 'Beginner';
  const levelNum      = LEVELS.indexOf(currentLevel) + 1;
  const nextLevelName = NEXT_LEVEL[currentLevel];
  const prevXP         = LEVEL_XP[currentLevel] || 0;
  const nextXP          = nextLevelName ? LEVEL_XP[nextLevelName] : prevXP + 1000;
  const pct = Math.min(100, Math.round(((user.xp||0)-prevXP)/(nextXP-prevXP)*100));
  const skills = user.skills || [];

  return (
    <div className="page" style={{ maxWidth:900, margin:'0 auto' }}>
      {/* Header card */}
      <div className="card" style={{ marginBottom:20, background:'linear-gradient(135deg, var(--card2), var(--card))' }}>
        <div style={{ display:'flex', alignItems:'flex-start', gap:24, flexWrap:'wrap' }}>
          <Avatar initials={(user.name||'U').slice(0,2).toUpperCase()} size="xl" />
          <div style={{ flex:1, minWidth:220 }}>
            {editing ? (
              <input value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))}
                className="input-field" style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:800, marginBottom:10, maxWidth:300 }} />
            ) : (
              <div style={{ fontFamily:'var(--font-display)', fontSize:26, fontWeight:800, marginBottom:8 }}>{user.name}</div>
            )}
            <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap', marginBottom:14 }}>
              <LevelBadge level={currentLevel} size="lg" />
              <span style={{ color:'var(--text3)', fontSize:13 }}>
                {stats.aboveLevel} students above you · {stats.sameLevel} at your level
              </span>
            </div>
            {editing ? (
              <textarea value={form.bio} onChange={e=>setForm(p=>({...p,bio:e.target.value}))}
                className="input-field" style={{ resize:'none', maxWidth:480 }} rows={2} placeholder="Write your bio..." />
            ) : (
              <div style={{ color:'var(--text2)', fontSize:14, maxWidth:480 }}>
                {user.bio || 'No bio yet. Click Edit Profile to add one!'}
              </div>
            )}
          </div>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            {editing ? (
              <>
                <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
                  {saving ? '⏳ Saving' : '✓ Save'}
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>Cancel</button>
              </>
            ) : (
              <>
                <button className="btn btn-primary btn-sm" onClick={() => setEditing(true)}>Edit Profile</button>
                <button className="btn btn-ghost btn-sm" style={{ color:'var(--orange)' }} onClick={logout}>Logout</button>
              </>
            )}
          </div>
        </div>

        <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginTop:20 }}>
          {user.role === 'mentor' && <span className="badge-pill mentor">🎓 Mentor</span>}
          {user.streak >= 7        && <span className="badge-pill streak">🔥 {user.streak} Day Streak</span>}
          {stats.aboveLevel < 10   && <span className="badge-pill top">⭐ Top Student</span>}
        </div>

        <div style={{ display:'flex', gap:28, borderTop:'1px solid var(--border)', paddingTop:20, marginTop:20, flexWrap:'wrap' }}>
          {[
            [(user.xp||0).toLocaleString(), 'XP Earned'],
            [user.totalPosts||0, 'Posts'],
            [Array.isArray(user.followers) ? user.followers.length : user.followers||0, 'Followers'],
            [Array.isArray(user.following) ? user.following.length : user.following||0, 'Following'],
            [user.streak||0, 'Day Streak'],
          ].map(([v,l]) => (
            <div key={l} style={{ textAlign:'center' }}>
              <div style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:22 }}>{v}</div>
              <div style={{ color:'var(--text2)', fontSize:12, marginTop:2 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* XP Gauge + Streak */}
      <div className="grid grid-2" style={{ marginBottom:20 }}>
        <div className="card" style={{ textAlign:'center' }}>
          <div className="section-title" style={{ marginBottom:18, textAlign:'left' }}>XP & Level Progression</div>
          <XPGauge percent={pct} size={160} label={(user.xp||0).toLocaleString()} level={levelNum} />
          {nextLevelName && (
            <div style={{ marginTop:16, fontSize:13, color:'var(--text2)' }}>
              <span style={{ color:'var(--violet)', fontWeight:800 }}>{nextXP-(user.xp||0)} XP</span> to reach {nextLevelName} 🎯
            </div>
          )}
        </div>

        <div className="card">
          <div className="section-title" style={{ marginBottom:16 }}>Streak Tracking</div>
          <div style={{ display:'flex', alignItems:'baseline', gap:10, marginBottom:8 }}>
            <div style={{ fontFamily:'var(--font-display)', fontSize:32, fontWeight:800, color:'var(--orange)' }}>{user.streak||0}</div>
            <div style={{ color:'var(--text2)', fontSize:13 }}>days · best {user.bestStreak||0}</div>
          </div>
          <StreakCalendar streak={user.streak||0} cells={49} />
        </div>
      </div>

      {/* Skills + Weekly chart */}
      <div className="grid grid-2" style={{ marginBottom:20 }}>
        <div className="card">
          <div className="section-title" style={{ marginBottom:16 }}>Skills</div>
          {editing ? (
            <div>
              <div style={{ fontSize:13, color:'var(--text2)', marginBottom:8 }}>Comma-separated (e.g. React, DSA, Python)</div>
              <input value={form.skills} onChange={e=>setForm(p=>({...p,skills:e.target.value}))}
                className="input-field" placeholder="React, DSA, Python..." />
            </div>
          ) : (
            <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
              {skills.length > 0
                ? skills.map((s,i) => <span key={s} className={`tag ${SKILL_COLORS[i % SKILL_COLORS.length]}`}>{s}</span>)
                : <div style={{ color:'var(--text3)', fontSize:14 }}>No skills added yet</div>}
            </div>
          )}
        </div>

        <div className="card">
          <div className="section-title" style={{ marginBottom:16 }}>Weekly XP</div>
          <MiniChart data={weeklyXP} labels={weekDays} />
        </div>
      </div>

      {/* Achievement Badges */}
      <div className="card" style={{ marginBottom:20 }}>
        <div className="section-title" style={{ marginBottom:18 }}>Achievement Badges</div>
        <AchievementBadges user={user} />
      </div>

      {/* Recent posts */}
      <div className="card">
        <div className="section-title" style={{ marginBottom:20 }}>Your Posts</div>
        {loading ? (
          <div style={{ textAlign:'center', padding:40, color:'var(--text2)' }}>⏳ Loading...</div>
        ) : posts.length === 0 ? (
          <div style={{ textAlign:'center', padding:40, color:'var(--text2)' }}>
            <div style={{ fontSize:36, opacity:0.3 }}>📝</div>
            <div style={{ marginTop:12 }}>No posts yet — share your first learning update!</div>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {posts.map(p => (
              <PostCard key={p._id} post={{
                ...p, id:p._id,
                author: user.name, initials:(user.name||'U').slice(0,2).toUpperCase(),
                level: user.level, time: new Date(p.createdAt).toLocaleDateString(),
                likes: p.likes?.length||0, comments: p.comments?.length||0,
              }} compact />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
