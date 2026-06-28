// src/App.js
import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar     from './layout/Sidebar';
import Topbar      from './layout/Topbar';
import Dashboard   from './pages/Dashboard';
import Feed        from './pages/Feed';
import Leaderboard from './pages/Leaderboard';
import Community   from './pages/Community';
import Messages     from './pages/Messages';
import Profile      from './pages/Profile';
import Auth          from './pages/Auth';
import Landing        from './pages/Landing';
import GoalSelection   from './pages/GoalSelection';
import Goals          from './pages/Goals';
import Tasks           from './pages/Tasks';
import Roadmap          from './pages/Roadmap';
import Quiz               from './pages/Quiz';
import Pomodoro             from './pages/Pomodoro';
import Reports               from './pages/Reports';
import Badges            from './pages/Badges';
import Mascot         from './components/Mascot';
import NovaChat         from './components/NovaChat';

function AppInner() {
  const { user, loading } = useAuth();
  const [page,       setPage]       = useState('dashboard');
  const [collapsed,  setCollapsed]  = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  // Controls what a logged-out visitor sees: the marketing landing page first,
  // then the login/register screen once they choose to continue.
  const [authView,   setAuthView]   = useState('landing'); // 'landing' | 'login' | 'register'

  useEffect(() => {
    const handler = () => { if (window.innerWidth > 768) setMobileOpen(false); };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  // Apply saved theme on first load
  useEffect(() => {
    const theme = localStorage.getItem('levelup_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', theme);
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ textAlign:'center' }}>
          <Mascot size={90} mood="sleepy" />
          <div style={{ color:'var(--text2)', marginTop:16 }}>Nova is loading XPify...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    if (authView === 'landing') {
      return (
        <Landing
          onGetStarted={() => setAuthView('register')}
          onLogin={() => setAuthView('login')}
        />
      );
    }
    return <Auth initialMode={authView} onBack={() => setAuthView('landing')} />;
  }

  // First-time users complete the Goal Selection onboarding step
  // before they ever see the main Dashboard.
  if (!user.onboardingComplete) {
    return <GoalSelection onContinue={() => setPage('dashboard')} />;
  }

  const pageProps = { setPage };

  return (
    <div className="app">
      <div className={`overlay ${mobileOpen ? 'visible' : ''}`} onClick={() => setMobileOpen(false)} />
      <Sidebar page={page} setPage={setPage} collapsed={collapsed} setCollapsed={setCollapsed} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className={`main-content ${collapsed ? 'expanded' : ''}`}>
        <Topbar page={page} setMobileOpen={setMobileOpen} />
        {page === 'dashboard'   && <Dashboard   {...pageProps} />}
        {page === 'feed'        && <Feed        {...pageProps} />}
        {page === 'leaderboard' && <Leaderboard {...pageProps} />}
        {page === 'community'   && <Community   {...pageProps} />}
        {page === 'messages'    && <Messages    {...pageProps} />}
        {page === 'profile'     && <Profile     {...pageProps} />}
        {page === 'goals'       && <Goals       {...pageProps} />}
        {page === 'tasks'       && <Tasks       {...pageProps} />}
        {page === 'roadmap'     && <Roadmap     {...pageProps} />}
        {page === 'quiz'        && <Quiz        {...pageProps} />}
        {page === 'pomodoro'    && <Pomodoro    {...pageProps} />}
        {page === 'reports'     && <Reports     {...pageProps} />}
        {page === 'badges'      && <Badges      {...pageProps} />}
      </div>
      <NovaChat />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
