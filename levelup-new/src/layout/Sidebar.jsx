// src/layout/Sidebar.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/Avatar';

const navItems = [
  { id: 'dashboard',   icon: '⊞', label: 'Dashboard' },
  { id: 'feed',        icon: '◈', label: 'Feed' },
  { id: 'leaderboard', icon: '◆', label: 'Leaderboard' },
  { id: 'community',   icon: '◉', label: 'Community' },
  { id: 'messages',    icon: '✉', label: 'Messages' },
  { id: 'profile',     icon: '◎', label: 'Profile' },
];

const growthItems = [
  { id: 'goals',    icon: '🎯', label: 'Goals' },
  { id: 'tasks',    icon: '✅', label: 'Daily Tasks' },
  { id: 'roadmap',  icon: '🗺️', label: 'Roadmap' },
  { id: 'quiz',     icon: '❓', label: 'Daily Quiz' },
  { id: 'cssquest', icon: '💎', label: 'CSS Quest' },   // 👈 added
  { id: 'pomodoro', icon: '⏱️', label: 'Pomodoro' },
  { id: 'reports',  icon: '📊', label: 'Weekly Report' },
  { id: 'badges',   icon: '🏅', label: 'Badges' },
];

export default function Sidebar({ page, setPage, collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
  const { user } = useAuth();
  const navigate = (id) => { setPage(id); setMobileOpen(false); };

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
      <div className="logo" onClick={() => setCollapsed(!collapsed)}>
        <div className="logo-icon">⚡</div>
        {!collapsed && <div className="logo-text">XPify</div>}
      </div>

      <nav className="nav">
        {!collapsed && <div className="nav-section-label">Main</div>}
        {navItems.map(item => (
          <div key={item.id} className={`nav-item ${page === item.id ? 'active' : ''}`}
            onClick={() => navigate(item.id)} title={collapsed ? item.label : ''}>
            <span className="nav-icon">{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
          </div>
        ))}

        {!collapsed && <div className="nav-section-label">Growth</div>}
        {growthItems.map(item => (
          <div key={item.id} className={`nav-item ${page === item.id ? 'active' : ''}`}
            onClick={() => navigate(item.id)} title={collapsed ? item.label : ''}>
            <span className="nav-icon">{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
          </div>
        ))}
      </nav>

      <div className="sidebar-user" onClick={() => navigate('profile')}>
        <Avatar initials={(user?.name || 'U').slice(0, 2).toUpperCase()} size="sm" />
        {!collapsed && (
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.name || 'Student'}</div>
            <div className="sidebar-user-level">⚡ {user?.level || 'Beginner'} · {user?.xp || 0} XP</div>
          </div>
        )}
      </div>
    </div>
  );
}