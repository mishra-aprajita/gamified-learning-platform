// src/pages/Badges.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { BADGE_DEFS } from '../components/AchievementBadges';

const ANIM_PREF_KEY = 'xpify_badge_animations';

// ── Helper: compute a rough progress value for badges that track a number ──
function getProgressInfo(badge, user) {
  const streak = user.streak || 0;
  const posts  = user.totalPosts || 0;
  const likes  = user.totalLikes || 0;

  switch (badge.id) {
    case 'starter':      return { current: Math.min(posts, 1),  target: 1 };
    case 'consistent':   return { current: Math.min(streak, 7), target: 7 };
    case 'unstoppable':  return { current: Math.min(streak, 30), target: 30 };
    case 'centurion':    return { current: Math.min(streak, 100), target: 100 };
    case 'popular':      return { current: Math.min(likes, 10), target: 10 };
    case 'prolific':     return { current: Math.min(posts, 20), target: 20 };
    default:              return null; // level/role based — binary unlock
  }
}

// ── Builds a short "how to unlock" hint for the hover tooltip ──
function getUnlockHint(badge, progress) {
  if (progress) {
    return `${progress.current}/${progress.target} — ${badge.desc}`;
  }
  return badge.desc; // level/role badges: just show the description
}

export default function Badges() {
  const { user } = useAuth();
  const unlockedCount = BADGE_DEFS.filter(b => b.requirement(user)).length;

  // Persisted on/off toggle for the pulsing glow animation on unlocked badges
  const [animationsOn, setAnimationsOn] = useState(() => {
    const saved = localStorage.getItem(ANIM_PREF_KEY);
    return saved === null ? true : saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem(ANIM_PREF_KEY, String(animationsOn));
  }, [animationsOn]);

  return (
    <div className="page" style={{ maxWidth: 900, margin: '0 auto' }}>

      {/* Header summary */}
      <div className="level-hero" style={{ marginBottom: 22, textAlign: 'center' }}>
        <div className="level-pill" style={{ margin: '0 auto 16px' }}>🏅 Achievements</div>
        <div className="level-hero-name" style={{ fontSize: 30 }}>
          {unlockedCount} / {BADGE_DEFS.length} Unlocked
        </div>
        <div className="level-hero-sub">Keep posting, streaking, and climbing levels to unlock them all</div>
        <div className="progress-bar" style={{ maxWidth: 320, margin: '0 auto 20px' }}>
          <div className="progress-fill" style={{
            width: `${(unlockedCount / BADGE_DEFS.length) * 100}%`,
            background: 'linear-gradient(90deg, var(--violet), var(--cyan))',
          }} />
        </div>

        {/* Unlock Animations toggle */}
        <button
          className={`unlock-anim-btn ${animationsOn ? 'active' : ''}`}
          onClick={() => setAnimationsOn(prev => !prev)}
        >
          {animationsOn ? '✨ Unlock Animations: ON' : '〇 Unlock Animations: OFF'}
        </button>
      </div>

      {/* Badge grid with detail */}
      <div className="badge-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
        {BADGE_DEFS.map(badge => {
          const unlocked = badge.requirement(user);
          const progress = getProgressInfo(badge, user);
          const pct = progress ? Math.round((progress.current / progress.target) * 100) : (unlocked ? 100 : 0);
          const hint = getUnlockHint(badge, progress);

          const tileClasses = [
            'badge-tile',
            unlocked ? 'unlocked' : 'locked',
            !animationsOn ? 'animations-off' : '',
          ].filter(Boolean).join(' ');

          return (
            <div key={badge.id} className={tileClasses} style={{ padding: 22 }}>

              {/* Hover tooltip — shows unlock condition / progress */}
              <div className="badge-tooltip">
                {unlocked ? `✓ Unlocked — ${badge.desc}` : `🔒 ${hint}`}
              </div>

              <div className={`badge-icon-circle ${badge.tier}`} style={{ width: 64, height: 64, fontSize: 28 }}>
                {badge.icon}
              </div>
              <div className="badge-name" style={{ fontSize: 15 }}>{badge.name}</div>
              <div className="badge-tier">
                {badge.tier} {unlocked ? '· Unlocked ✓' : ''}
              </div>
              <div style={{ color: 'var(--text2)', fontSize: 12.5, minHeight: 32 }}>{badge.desc}</div>

              {!unlocked && progress && (
                <div style={{ width: '100%' }}>
                  <div className="progress-bar" style={{ marginBottom: 6 }}>
                    <div className="progress-fill" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, var(--violet), var(--cyan))' }} />
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>{progress.current} / {progress.target}</div>
                </div>
              )}
              {unlocked && (
                <div style={{
                  padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                  background: 'rgba(74,222,154,0.12)', color: 'var(--green)', border: '1px solid rgba(74,222,154,0.3)',
                }}>
                  ✓ Earned
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
