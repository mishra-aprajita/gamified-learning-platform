import React from 'react';

export default function XPBar({ current, prev, next, label = true }) {
  const pct = Math.min(100, Math.round(((current - prev) / (next - prev)) * 100));
  return (
    <div className="xp-bar-wrap">
      {label && (
        <div className="xp-bar-header">
          <span style={{ color: 'var(--text2)', fontWeight: 600 }}>Progress to next level</span>
          <span style={{ color: 'var(--violet)', fontWeight: 800 }}>
            {current.toLocaleString()} / {next.toLocaleString()} XP
          </span>
        </div>
      )}
      <div className="xp-bar-bg">
        <div className="xp-bar-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
