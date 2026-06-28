import React from 'react';

const levelColors = {
  Beginner:  '#5D6092',
  Explorer:  '#4ADE9A',
  Builder:   '#45E0E8',
  Hacker:    '#8B6BFF',
  Architect: '#FFC25C',
};

export default function LevelBadge({ level, size = 'sm' }) {
  const color = levelColors[level] || '#5D6092';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: size === 'lg' ? '7px 16px' : '4px 11px',
      borderRadius: 20,
      fontSize: size === 'lg' ? 13 : 11,
      fontWeight: 700,
      background: `${color}22`,
      color,
      border: `1px solid ${color}45`,
      whiteSpace: 'nowrap',
    }}>
      ✦ {level}
    </span>
  );
}
