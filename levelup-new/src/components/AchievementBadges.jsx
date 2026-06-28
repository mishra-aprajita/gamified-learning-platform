// src/components/AchievementBadges.jsx
import React from 'react';

export const BADGE_DEFS = [
  { id: 'starter',     name: 'Starter',      icon: '🚀', tier: 'bronze', desc: 'Share your first post',          requirement: (u) => (u.totalPosts || 0) >= 1 },
  { id: 'consistent',  name: 'Consistent',   icon: '📅', tier: 'silver', desc: '7-day streak',                    requirement: (u) => (u.streak || 0) >= 7 },
  { id: 'unstoppable', name: 'Unstoppable',  icon: '🔥', tier: 'gold',   desc: '30-day streak',                   requirement: (u) => (u.streak || 0) >= 30 },
  { id: 'popular',     name: 'Popular',      icon: '❤️', tier: 'silver', desc: '10+ likes received',              requirement: (u) => (u.totalLikes || 0) >= 10 },
  { id: 'leveled',     name: 'Leveled Up',   icon: '⭐', tier: 'bronze', desc: 'Reach Explorer level or above',   requirement: (u) => u.level && u.level !== 'Beginner' },
  { id: 'builder',     name: 'Builder',      icon: '🛠️', tier: 'silver', desc: 'Reach Builder level',              requirement: (u) => ['Builder','Hacker','Architect'].includes(u.level) },
  { id: 'hacker',      name: 'Hacker',       icon: '💻', tier: 'gold',   desc: 'Reach Hacker level',               requirement: (u) => ['Hacker','Architect'].includes(u.level) },
  { id: 'architect',   name: 'Architect',    icon: '🏛️', tier: 'gold',   desc: 'Reach Architect — the top level',  requirement: (u) => u.level === 'Architect' },
  { id: 'prolific',    name: 'Prolific',     icon: '📝', tier: 'silver', desc: '20+ posts shared',                requirement: (u) => (u.totalPosts || 0) >= 20 },
  { id: 'mentor',      name: 'Mentor',       icon: '🎓', tier: 'gold',   desc: 'Recognized as a community mentor', requirement: (u) => u.role === 'mentor' },
  { id: 'champion',    name: 'Champion',     icon: '🏆', tier: 'gold',   desc: 'Reach Rank #1 on the leaderboard', requirement: (u) => (u.rank || 99) === 1 },
  { id: 'centurion',   name: 'Centurion',    icon: '💯', tier: 'gold',   desc: '100-day streak',                  requirement: (u) => (u.streak || 0) >= 100 },
];

export default function AchievementBadges({ user = {}, compact = false }) {
  const defs = compact ? BADGE_DEFS.slice(0, 6) : BADGE_DEFS;
  const animationsOn = (() => {
    const saved = localStorage.getItem('xpify_badge_animations');
    return saved === null ? true : saved === 'true';
  })();

  return (
    <div className="badge-grid">
      {defs.map(badge => {
        const unlocked = badge.requirement(user);
        const tileClasses = [
          'badge-tile',
          unlocked ? 'unlocked' : 'locked',
          !animationsOn ? 'animations-off' : '',
        ].filter(Boolean).join(' ');
        return (
          <div key={badge.id} className={tileClasses}>
            <div className="badge-tooltip">
              {unlocked ? `✓ Unlocked — ${badge.desc}` : `🔒 ${badge.desc}`}
            </div>
            <div className={`badge-icon-circle ${badge.tier}`}>{badge.icon}</div>
            <div className="badge-name">{badge.name}</div>
            <div className="badge-tier">{unlocked ? badge.tier : 'Locked'}</div>
          </div>
        );
      })}
    </div>
  );
}
