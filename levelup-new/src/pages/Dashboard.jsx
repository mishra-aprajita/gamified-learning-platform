// src/pages/Dashboard.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI, postAPI } from '../services/api';
import Avatar from '../components/Avatar';
import LevelBadge from '../components/LevelBadge';
import XPGauge from '../components/XPGauge';
import MiniChart from '../components/MiniChart';
import StreakCalendar from '../components/StreakCalendar';
import AchievementBadges from '../components/AchievementBadges';
import Mascot from '../components/Mascot';
import PostCard from '../components/PostCard';
import { weeklyXP, weekDays } from '../data/mockData';

const LEVELS   = ['Beginner', 'Explorer', 'Builder', 'Hacker', 'Architect'];
const LEVEL_XP = { Beginner: 0, Explorer: 500, Builder: 1500, Hacker: 3500, Architect: 7000 };
const NEXT_LEVEL = { Beginner: 'Explorer', Explorer: 'Builder', Builder: 'Hacker', Hacker: 'Architect', Architect: null };

export default function Dashboard({ setPage }) {
  const { user } = useAuth();
  const [posts,       setPosts]       = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [stats,       setStats]       = useState({ sameLevel: 0, aboveLevel: 0, belowLevel: 0 });
  const [loading,     setLoading]     = useState(true);
  const [novaMood,    setNovaMood]    = useState('happy');
  const prevXPRef = useRef(user?.xp ?? 0);
  const prevLevelRef = useRef(user?.level);
  const prevStreakRef = useRef(user?.streak ?? 0);

  // Nova reacts when XP increases (celebrate), a level-up happens (excited),
  // or a streak resets to 0 after being active (sad)
  useEffect(() => {
    if (user?.xp === undefined) return;

    if (prevStreakRef.current > 0 && (user.streak ?? 0) === 0) {
      setNovaMood('sad');
    } else if (user.xp > prevXPRef.current) {
      setNovaMood(user.level !== prevLevelRef.current ? 'excited' : 'celebrate');
    }

    prevXPRef.current = user.xp;
    prevLevelRef.current = user.level;
    prevStreakRef.current = user.streak ?? 0;
  }, [user?.xp, user?.level, user?.streak]);

  useEffect(() => {
    const load = async () => {
      try {
        const [postsRes, lbRes, profileRes] = await Promise.all([
          postAPI.getAll('', 1),
          userAPI.getLeaderboard(),
          userAPI.getProfile(user._id),
        ]);
        setPosts(postsRes.posts.slice(0, 3));
        setLeaderboard(lbRes.leaderboard.slice(0, 5));
        setStats(profileRes.stats);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    if (user) load();
  }, [user]);

  const currentLevel  = user?.level || 'Beginner';
  const levelNum      = LEVELS.indexOf(currentLevel) + 1;
  const nextLevelName = NEXT_LEVEL[currentLevel];
  const prevXP        = LEVEL_XP[currentLevel] || 0;
  const nextXP        = nextLevelName ? LEVEL_XP[nextLevelName] : prevXP + 1000;
  const pct           = Math.min(100, Math.round(((user?.xp || 0) - prevXP) / (nextXP - prevXP) * 100));

  const statTiles = [
    { icon: '⚡', label: 'Total XP',     value: (user?.xp || 0).toLocaleString(), color: 'var(--violet)', bg: 'rgba(139,107,255,0.12)' },
    { icon: '🔥', label: 'Day Streak',   value: `${user?.streak || 0}`,            color: 'var(--orange)', bg: 'rgba(255,138,92,0.12)' },
    { icon: '📝', label: 'Posts',        value: user?.totalPosts || 0,             color: 'var(--green)',  bg: 'rgba(74,222,154,0.12)' },
    { icon: '👥', label: 'Followers',    value: Array.isArray(user?.followers) ? user.followers.length : user?.followers || 0, color: 'var(--cyan)', bg: 'rgba(69,224,232,0.12)' },
  ];

  if (loading) return (
    <div className="page" style={{ textAlign: 'center', paddingTop: 100 }}>
      <Mascot size={80} level={user?.level} mood="sleepy" />
      <div style={{ color: 'var(--text2)', marginTop: 16 }}>Nova is loading your dashboard...</div>
    </div>
  );

  return (
    <div className="page">
      {/* Top row: XP Gauge hero + Nova greeting */}
      <div className="grid grid-2" style={{ marginBottom: 22 }}>
        <div className="level-hero">
          <div className="level-pill">⚡ Level {levelNum} · {currentLevel}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap' }}>
            <XPGauge percent={pct} size={150} label={(user?.xp || 0).toLocaleString()} level={levelNum} />
            <div style={{ flex: 1, minWidth: 180 }}>
              <div className="level-hero-name">Keep climbing!</div>
              <div className="level-hero-sub">
                {nextLevelName
                  ? `${nextXP - (user?.xp || 0)} XP to reach ${nextLevelName}`
                  : "You've reached the top level! 🏆"}
              </div>
              <div className="level-rewards">
                <div className="level-stat">
                  <div className="level-stat-val" style={{ color: 'var(--green)' }}>{stats.belowLevel}</div>
                  <div className="level-stat-lbl">Below you</div>
                </div>
                <div className="level-stat">
                  <div className="level-stat-val" style={{ color: 'var(--violet)' }}>{stats.sameLevel}</div>
                  <div className="level-stat-lbl">At your level</div>
                </div>
                <div className="level-stat">
                  <div className="level-stat-val" style={{ color: 'var(--orange)' }}>{stats.aboveLevel}</div>
                  <div className="level-stat-lbl">Above you</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mascot greeting card */}
        <div className="card" style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', textAlign: 'center', gap: 14,
          background: 'linear-gradient(135deg, var(--card2), var(--card))',
        }}>
          <Mascot size={100} level={user?.level} mood={novaMood} reactFor={2500} />
          <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 700, letterSpacing: '0.05em', marginTop: -10 }}>
            NOVA
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 17 }}>
            "I'm getting closer to my goal every day."
          </div>
          <div style={{ color: 'var(--text2)', fontSize: 13, maxWidth: 280 }}>
            Hey {user?.name?.split(' ')[0] || 'there'} — post today's progress to keep your {user?.streak || 0}-day streak alive 🔥
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setPage('feed')}>
            Continue Learning →
          </button>
        </div>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-4" style={{ marginBottom: 22 }}>
        {statTiles.map((s, i) => (
          <div key={i} className="stat-tile">
            <div className="stat-tile-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
            <div>
              <div className="stat-tile-value">{s.value}</div>
              <div className="stat-tile-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Streak + Badges row */}
      <div className="grid grid-2" style={{ marginBottom: 22 }}>
        <div className="card">
          <div className="section-header">
            <div className="section-title">Streak Tracking</div>
            <div className="streak-flame-big" style={{ fontSize: 28 }}>🔥</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 4 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 800, color: 'var(--orange)' }}>
              {user?.streak || 0}
            </div>
            <div style={{ color: 'var(--text2)', fontSize: 13 }}>consecutive days · best {user?.bestStreak || 0}</div>
          </div>
          <StreakCalendar streak={user?.streak || 0} />
        </div>

        <div className="card">
          <div className="section-header">
            <div className="section-title">Achievement Badges</div>
          </div>
          <AchievementBadges user={user} />
        </div>
      </div>

      {/* Weekly chart */}
      <div className="card" style={{ marginBottom: 22 }}>
        <div className="section-header">
          <div className="section-title">Weekly XP Activity</div>
          <div style={{ fontSize: 13, color: 'var(--text2)' }}>
            This week: <span style={{ color: 'var(--violet)', fontWeight: 800 }}>+{weeklyXP.reduce((a, b) => a + b, 0)} XP</span>
          </div>
        </div>
        <MiniChart data={weeklyXP} labels={weekDays} />
      </div>

      {/* Feed + Leaderboard */}
      <div className="grid grid-2">
        <div>
          <div className="section-header">
            <div className="section-title">Recent in Feed</div>
            <div className="section-link" onClick={() => setPage('feed')}>See all →</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {posts.length > 0 ? posts.map(p => (
              <PostCard key={p._id} post={{
                ...p, initials: p.author?.name?.slice(0, 2).toUpperCase(),
                level: p.author?.level, author: p.author?.name,
                time: new Date(p.createdAt).toLocaleDateString(),
                likes: p.likes?.length || 0, comments: p.comments?.length || 0,
              }} compact />
            )) : (
              <div style={{ color: 'var(--text2)', fontSize: 14 }}>No posts yet. Be the first!</div>
            )}
          </div>
        </div>

        <div>
          <div className="section-header">
            <div className="section-title">Leaderboard</div>
            <div className="section-link" onClick={() => setPage('leaderboard')}>Full table →</div>
          </div>
          <div className="card" style={{ padding: '10px 6px' }}>
            {leaderboard.map(s => (
              <div key={s._id} className={`leaderboard-row ${s._id === user?._id ? 'me' : ''}`}>
                <div className={`rank ${s.rank === 1 ? 'gold' : s.rank === 2 ? 'silver' : s.rank === 3 ? 'bronze' : 'normal'}`}>
                  {s.rank <= 3 ? ['🥇', '🥈', '🥉'][s.rank - 1] : s.rank}
                </div>
                <Avatar initials={s.name?.slice(0, 2).toUpperCase()} size="sm" />
                <div className="lb-info">
                  <div className="lb-name">{s.name}{s._id === user?._id ? ' (You)' : ''}</div>
                  <div className="lb-sub">🔥 {s.streak} streak</div>
                </div>
                <LevelBadge level={s.level} />
                <div className="lb-xp">{s.xp.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
