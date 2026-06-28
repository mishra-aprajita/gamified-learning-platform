// src/components/Mascot.jsx
// ─────────────────────────────────────────────
//  Nova — the evolving mascot character that represents the
//  student's learning companion throughout XPify.
//
//  Nova has 5 visual evolution stages tied to the student's level,
//  and reacts with different expressions depending on what's happening
//  (XP gain, streak milestones, perfect quiz score, streak lost, etc).
// ─────────────────────────────────────────────
import React, { useId, useState, useEffect } from 'react';

// ── Evolution stages, keyed by level name ────
const STAGE_BY_LEVEL = {
  Beginner:  1,
  Explorer:  2,
  Builder:   3,
  Hacker:    4,
  Architect: 5,
};

// ── Per-stage visual config ──────────────────
const STAGE_CONFIG = {
  1: { // Beginner — simple blob, dim glow, no accessories
    colors: ['#9C8FFF', '#8B6BFF', '#6F4FE0'],
    glowOpacity: 0.18,
    hasSparkle: false,
    hasOrbit: false,
    hasVisor: false,
    hasHalo: false,
  },
  2: { // Explorer — gains a sparkle accent, slightly brighter
    colors: ['#A78BFF', '#8B6BFF', '#6F4FE0'],
    glowOpacity: 0.22,
    hasSparkle: true,
    hasOrbit: false,
    hasVisor: false,
    hasHalo: false,
  },
  3: { // Builder — gains an orbiting accent particle, more saturated
    colors: ['#A78BFF', '#7B5BFF', '#5A3FD0'],
    glowOpacity: 0.26,
    hasSparkle: true,
    hasOrbit: true,
    hasVisor: false,
    hasHalo: false,
  },
  4: { // Hacker — gains a glowing visor line, cyan intensifies
    colors: ['#9B7FFF', '#6F4FE0', '#4B2FB8'],
    glowOpacity: 0.32,
    hasSparkle: true,
    hasOrbit: true,
    hasVisor: true,
    hasHalo: false,
  },
  5: { // Architect — full halo ring, strongest glow, multi-particle orbit
    colors: ['#C9B8FF', '#8B6BFF', '#4B2FB8'],
    glowOpacity: 0.42,
    hasSparkle: true,
    hasOrbit: true,
    hasVisor: true,
    hasHalo: true,
  },
};

// ── Reaction → eye/mouth shape config ────────
const REACTIONS = ['happy', 'celebrate', 'excited', 'thinking', 'sad', 'sleepy'];

export default function Mascot({
  size = 120,
  level = 'Beginner',
  mood = 'happy',
  animate = true,
  reactFor = 0, // ms duration to auto-revert to 'happy' after a temporary reaction (0 = stays as-is)
}) {
  const uid = useId();
  const bodyGradientId  = `novaBody-${uid}`;
  const cheekGradientId = `novaCheek-${uid}`;
  const haloGradientId  = `novaHalo-${uid}`;

  const stage  = STAGE_BY_LEVEL[level] || 1;
  const config = STAGE_CONFIG[stage];
  const safeMood = REACTIONS.includes(mood) ? mood : 'happy';

  // ── Auto-revert temporary reactions back to 'happy' ──
  const [currentMood, setCurrentMood] = useState(safeMood);
  useEffect(() => {
    setCurrentMood(safeMood);
    if (reactFor > 0 && safeMood !== 'happy') {
      const timer = setTimeout(() => setCurrentMood('happy'), reactFor);
      return () => clearTimeout(timer);
    }
  }, [safeMood, reactFor]);

  const bounceClass = currentMood === 'celebrate' ? 'mascot-celebrate' : '';
  const shakeClass   = currentMood === 'sad' ? 'mascot-sad-shake' : '';

  return (
    <div className="mascot-wrap" style={{ width: size, height: size }}>
      {animate && (
        <div className="mascot-glow" style={{ opacity: config.glowOpacity * 4 }} />
      )}

      {/* Halo ring — Architect stage only */}
      {config.hasHalo && (
        <svg
          width={size * 1.5} height={size * 1.5}
          viewBox="0 0 300 300"
          className="mascot-halo-spin"
          style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 0 }}
        >
          <defs>
            <linearGradient id={haloGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFD56A" />
              <stop offset="50%" stopColor="#8B6BFF" />
              <stop offset="100%" stopColor="#45E0E8" />
            </linearGradient>
          </defs>
          <circle cx="150" cy="150" r="125" fill="none" stroke={`url(#${haloGradientId})`} strokeWidth="3" strokeDasharray="10 14" opacity="0.6" />
        </svg>
      )}

      {/* Orbiting particle — Builder stage and above */}
      {config.hasOrbit && animate && (
        <div className="mascot-orbit" style={{ width: size * 1.35, height: size * 1.35 }}>
          <div className="mascot-orbit-dot" style={{ background: stage >= 5 ? '#FFD56A' : '#45E0E8' }} />
        </div>
      )}

      <svg
        className={`${animate ? 'mascot-bob' : ''} ${bounceClass} ${shakeClass}`}
        width={size} height={size} viewBox="0 0 200 200"
        style={{ position: 'relative', zIndex: 1 }}
        aria-label={`Nova, your learning companion — stage ${stage}, ${currentMood}`}
      >
        <defs>
          <radialGradient id={bodyGradientId} cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor={config.colors[0]} />
            <stop offset="55%" stopColor={config.colors[1]} />
            <stop offset="100%" stopColor={config.colors[2]} />
          </radialGradient>
          <radialGradient id={cheekGradientId} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FF9FD8" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#FF9FD8" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* ── Nova's Evolving Crystal Diamond Body ── */}
        <g 
          transform={stage >= 4 ? 'scale(1.02)' : undefined}
          transformOrigin="100 100"
        >
          {/* Main Crystal Shape Group using stage gradient colors */}
          {/* Back Facet Shadow */}
          <polygon points="100,18 45,75 100,182" fill={config.colors[2]} />
          {/* Front Right Main Facet */}
          <polygon points="100,18 155,75 100,182" fill={`url(#${bodyGradientId})`} />
          
          {/* Top Geometry - Flat-ish faceted cuts */}
          <polygon points="100,18 45,75 100,75" fill={config.colors[0]} opacity="0.25" />
          <polygon points="100,18 155,75 100,75" fill="#FFFFFF" opacity="0.15" />
        </g>

        {/* Soft inner highlight adapted to crystal edges */}
        <polygon points="100,40 70,75 100,110" fill="#FFFFFF" opacity="0.15" />

        {/* Visor line — Hacker stage and above */}
        {config.hasVisor && (
          <rect x="58" y="86" width="84" height="10" rx="5" fill="#45E0E8" opacity="0.55" />
        )}

        {/* Cheeks */}
        <circle cx="58" cy="118" r="16" fill={`url(#${cheekGradientId})`} />
        <circle cx="142" cy="118" r="16" fill={`url(#${cheekGradientId})`} />

        {/* ── Eyes — vary by mood ── */}
        {currentMood === 'happy' && (
          <>
            <circle cx="76" cy="98" r="9" fill="#1B1535" />
            <circle cx="124" cy="98" r="9" fill="#1B1535" />
            <circle cx="79" cy="95" r="3" fill="#FFFFFF" />
            <circle cx="127" cy="95" r="3" fill="#FFFFFF" />
          </>
        )}
        {currentMood === 'celebrate' && (
          <>
            {/* Big sparkly star-eyes */}
            <path d="M76 90 L80 98 L88 98 L82 103 L84 111 L76 106 L68 111 L70 103 L64 98 L72 98 Z" fill="#FFD56A" />
            <path d="M124 90 L128 98 L136 98 L130 103 L132 111 L124 106 L116 111 L118 103 L112 98 L120 98 Z" fill="#FFD56A" />
          </>
        )}
        {currentMood === 'excited' && (
          <>
            <circle cx="76" cy="97" r="10" fill="#1B1535" />
            <circle cx="124" cy="97" r="10" fill="#1B1535" />
            <circle cx="80" cy="93" r="4" fill="#FFFFFF" />
            <circle cx="128" cy="93" r="4" fill="#FFFFFF" />
            <circle cx="72" cy="100" r="2" fill="#FFFFFF" opacity="0.8" />
            <circle cx="120" cy="100" r="2" fill="#FFFFFF" opacity="0.8" />
          </>
        )}
        {currentMood === 'thinking' && (
          <>
            <path d="M68 98 Q76 88, 84 98" stroke="#1B1535" strokeWidth="5" fill="none" strokeLinecap="round" />
            <path d="M116 98 Q124 88, 132 98" stroke="#1B1535" strokeWidth="5" fill="none" strokeLinecap="round" />
          </>
        )}
        {currentMood === 'sad' && (
          <>
            <ellipse cx="76" cy="100" rx="8" ry="9" fill="#1B1535" />
            <ellipse cx="124" cy="100" rx="8" ry="9" fill="#1B1535" />
            <path d="M68 90 Q76 86, 82 91" stroke="#1B1535" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M118 91 Q124 86, 132 90" stroke="#1B1535" strokeWidth="3" fill="none" strokeLinecap="round" />
          </>
        )}
        {currentMood === 'sleepy' && (
          <>
            <path d="M68 98 L84 98" stroke="#1B1535" strokeWidth="5" fill="none" strokeLinecap="round" />
            <path d="M116 98 L132 98" stroke="#1B1535" strokeWidth="5" fill="none" strokeLinecap="round" />
          </>
        )}

        {/* ── Mouth — varies by mood ── */}
        {currentMood === 'sad' ? (
          <path d="M84 128 Q100 120, 116 128" stroke="#1B1535" strokeWidth="5" fill="none" strokeLinecap="round" />
        ) : currentMood === 'celebrate' || currentMood === 'excited' ? (
          <path d="M78 120 Q100 142, 122 120 Q100 132, 78 120 Z" fill="#1B1535" />
        ) : currentMood === 'sleepy' ? (
          <ellipse cx="100" cy="124" rx="6" ry="4" fill="#1B1535" />
        ) : (
          <path d="M82 122 Q100 138, 118 122" stroke="#1B1535" strokeWidth="5" fill="none" strokeLinecap="round" />
        )}

        {/* Sparkle accent — Explorer stage and above */}
        {config.hasSparkle && (
          <g opacity="0.9">
            <path d="M156 48 L160 58 L170 62 L160 66 L156 76 L152 66 L142 62 L152 58 Z" fill="#45E0E8" />
          </g>
        )}
      </svg>
    </div>
  );
}

export { STAGE_BY_LEVEL };