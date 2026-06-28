// src/pages/Landing.jsx
import React from 'react';
import Mascot from '../components/Mascot';

const FEATURES = [
  { icon: '🎯', title: 'Learning Goals',     desc: 'Set targets and track real progress, not just intentions.' },
  { icon: '✅', title: 'Daily Tasks',         desc: 'Bite-sized daily actions that compound into real skill.' },
  { icon: '🗺️', title: 'Learning Roadmaps',   desc: 'Structured paths for DSA, Web Dev, ML, and System Design.' },
  { icon: '❓', title: 'Daily Quiz',          desc: 'Sharpen fundamentals with 5 quick questions every day.' },
  { icon: '⏱️', title: 'Pomodoro Timer',      desc: 'Focused 25-minute sessions that actually earn you XP.' },
  { icon: '📊', title: 'Weekly Reports',      desc: 'See your growth across every feature, week over week.' },
];

export default function Landing({ onGetStarted, onLogin }) {
  return (
    <div style={{ minHeight: '100vh', overflow: 'hidden' }}>

      {/* ── Top nav bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 32px', maxWidth: 1100, margin: '0 auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 12,
            background: 'linear-gradient(135deg, var(--violet), var(--cyan))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, boxShadow: '0 0 20px rgba(139,107,255,0.4)',
          }}>⚡</div>
          <span style={{
            fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em',
          }}>XPify</span>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={onLogin}>Login</button>
      </div>

      {/* ── Hero section ── */}
      <div style={{
        maxWidth: 720, margin: '0 auto', textAlign: 'center',
        padding: '40px 24px 60px',
      }}>
        <Mascot size={130} />
        <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 700, letterSpacing: '0.08em', marginTop: 10 }}>
          MEET NOVA, YOUR LEARNING COMPANION
        </div>

        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 800, letterSpacing: '-0.02em',
          fontSize: 'clamp(32px, 5vw, 48px)', lineHeight: 1.15, margin: '20px 0 16px',
        }}>
          Turn Your Learning Into{' '}
          <span style={{
            background: 'linear-gradient(135deg, var(--violet), var(--cyan))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>
            Momentum
          </span>
        </h1>

        <p style={{ color: 'var(--text2)', fontSize: 16, lineHeight: 1.6, maxWidth: 520, margin: '0 auto 32px' }}>
          XPify turns DSA, coding, and skill-building into a game you actually want to play —
          track your XP, keep your streak alive, and climb the leaderboard with students just like you.
        </p>

        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            className="btn btn-primary"
            style={{ padding: '14px 32px', fontSize: 15 }}
            onClick={onGetStarted}
          >
            🚀 Get Started Free
          </button>
          <button
            className="btn btn-ghost"
            style={{ padding: '14px 32px', fontSize: 15 }}
            onClick={onLogin}
          >
            I already have an account
          </button>
        </div>
      </div>

      {/* ── Stats strip ── */}
      <div style={{
        display: 'flex', justifyContent: 'center', gap: 48, flexWrap: 'wrap',
        padding: '0 24px 60px', maxWidth: 720, margin: '0 auto',
      }}>
        {[
          ['12', 'Features'],
          ['5', 'Levels to climb'],
          ['∞', 'Streak potential'],
        ].map(([val, label]) => (
          <div key={label} style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 800, color: 'var(--violet)' }}>{val}</div>
            <div style={{ color: 'var(--text2)', fontSize: 13 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* ── Feature grid ── */}
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, marginBottom: 8 }}>
            Everything you need to level up
          </div>
          <div style={{ color: 'var(--text2)', fontSize: 14 }}>One platform, every habit that actually moves the needle.</div>
        </div>

        <div className="grid grid-3">
          {FEATURES.map((f, i) => (
            <div key={i} className="card" style={{ textAlign: 'center' }}>
              <div style={{
                width: 52, height: 52, borderRadius: 16, margin: '0 auto 16px',
                background: 'rgba(139,107,255,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
              }}>
                {f.icon}
              </div>
              <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 6 }}>{f.title}</div>
              <div style={{ color: 'var(--text2)', fontSize: 13, lineHeight: 1.5 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Final CTA ── */}
      <div className="level-hero" style={{
        maxWidth: 700, margin: '0 auto 60px', textAlign: 'center', padding: '40px 32px',
      }}>
        <div className="level-hero-name" style={{ fontSize: 24 }}>Ready to start your streak?</div>
        <div className="level-hero-sub">Join a community of students leveling up together, one day at a time.</div>
        <button className="btn btn-primary" style={{ padding: '14px 36px', fontSize: 15 }} onClick={onGetStarted}>
          ⚡ Create Free Account
        </button>
      </div>

      {/* ── Footer ── */}
      <div style={{ textAlign: 'center', color: 'var(--text3)', fontSize: 12.5, padding: '0 24px 32px' }}>
        © {new Date().getFullYear()} XPify. Built for students, by students.
      </div>
    </div>
  );
}
