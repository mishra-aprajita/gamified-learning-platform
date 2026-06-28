// src/components/XPGauge.jsx
// ─────────────────────────────────────────────
//  Circular progress ring showing XP / level progress.
//  This is the signature visual from the reference design.
// ─────────────────────────────────────────────
import React from 'react';

export default function XPGauge({ percent = 0, size = 180, strokeWidth = 14, label = 'XP', level }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="xp-gauge-wrap" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B6BFF" />
            <stop offset="50%" stopColor="#6F4FE0" />
            <stop offset="100%" stopColor="#45E0E8" />
          </linearGradient>
        </defs>
        {/* Track */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="var(--card2)" strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="url(#gaugeGradient)" strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }}
        />
      </svg>
      <div className="xp-gauge-center">
        <div className="xp-gauge-value">{label}</div>
        {level !== undefined && <div className="xp-gauge-label">Level {level}</div>}
      </div>
    </div>
  );
}
