// src/layout/Topbar.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/Avatar';

const pageTitles = {
  dashboard: 'Dashboard', feed: 'Learning Feed', leaderboard: 'Leaderboard',
  community: 'Community', messages: 'Messages', profile: 'My Profile',
  goals: 'Learning Goals', tasks: 'Daily Tasks', badges: 'Achievements',
  roadmap: 'Learning Roadmap', quiz: 'Daily Quiz Challenge',
  pomodoro: 'Pomodoro Timer', reports: 'Weekly Report',
};

const MOCK_NOTIFS = [
  { icon: '🔥', text: 'Your streak is on fire! Keep posting daily.', time: 'Just now' },
  { icon: '⭐', text: 'You unlocked a new badge!',                    time: '15m ago' },
  { icon: '💬', text: 'You have a new message.',                      time: '1h ago'  },
  { icon: '🏆', text: 'You moved up the leaderboard!',                time: '3h ago'  },
];

export default function Topbar({ page, setMobileOpen }) {
  const { user } = useAuth();
  const [showNotif, setShowNotif] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('levelup_theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('levelup_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  return (
    <div className="topbar">
      <div className="hamburger" onClick={() => setMobileOpen(p => !p)}>
        <span /><span /><span />
      </div>

      <div className="topbar-title">{pageTitles[page]}</div>

      <div className="topbar-actions">
        <div className="search-bar">
          <span style={{ color: 'var(--text3)', fontSize: 15 }}>⌕</span>
          <input placeholder="Search students, topics..." />
        </div>

        <div className="icon-btn" onClick={toggleTheme} title="Toggle theme">
          {theme === 'dark' ? '🌙' : '☀️'}
        </div>

        <div style={{ position: 'relative' }}>
          <div className="icon-btn" onClick={() => setShowNotif(p => !p)}>
            🔔<div className="notif-dot" />
          </div>
          {showNotif && (
            <div className="notif-panel">
              <div style={{
                padding: '14px 16px 10px', display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', borderBottom: '1px solid var(--border)',
              }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>Notifications</div>
                <div style={{ fontSize: 12, color: 'var(--violet)', cursor: 'pointer' }}>Mark all read</div>
              </div>
              {MOCK_NOTIFS.map((n, i) => (
                <div key={i} className="notif-item">
                  <div className="notif-icon">{n.icon}</div>
                  <div>
                    <div className="notif-text">{n.text}</div>
                    <div className="notif-time">{n.time}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Avatar initials={(user?.name || 'U').slice(0, 2).toUpperCase()} size="sm" />
      </div>
    </div>
  );
}
