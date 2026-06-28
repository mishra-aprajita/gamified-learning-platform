import React from 'react';

const sizes = { sm: 34, md: 38, lg: 64, xl: 84 };
const fonts = { sm: 13, md: 14, lg: 22, xl: 30 };

export default function Avatar({ initials, size = 'md', color }) {
  const s = sizes[size];
  const f = fonts[size];
  return (
    <div style={{
      width: s, height: s, borderRadius: '50%', flexShrink: 0,
      background: color || 'linear-gradient(135deg, #8B6BFF, #45E0E8)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: f, fontWeight: 800, color: '#fff',
      fontFamily: 'var(--font-display)',
      border: '2px solid rgba(139,107,255,0.25)',
    }}>
      {initials}
    </div>
  );
}
