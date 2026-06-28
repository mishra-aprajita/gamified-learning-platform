// src/pages/Pomodoro.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { pomodoroAPI } from '../services/api';
import Mascot from '../components/Mascot';

const WORK_MINUTES  = 25;
const BREAK_MINUTES = 5;

export default function Pomodoro() {
  const { user, updateUser } = useAuth();
  const [mode,          setMode]          = useState('work'); // 'work' | 'break'
  const [secondsLeft,   setSecondsLeft]   = useState(WORK_MINUTES * 60);
  const [running,       setRunning]       = useState(false);
  const [label,         setLabel]         = useState('');
  const [todayCount,    setTodayCount]    = useState(0);
  const [todayMinutes,  setTodayMinutes]  = useState(0);
  const [sessions,      setSessions]      = useState([]);
  const [weekStats,     setWeekStats]     = useState([]);
  const [toast,         setToast]         = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [novaMood,      setNovaMood]      = useState('happy');

  const intervalRef = useRef(null);

  // ── Load today's sessions + week stats ──────
  const loadData = useCallback(() => {
    Promise.all([pomodoroAPI.getToday(), pomodoroAPI.getStats()])
      .then(([todayRes, statsRes]) => {
        setSessions(todayRes.sessions);
        setTodayCount(todayRes.count);
        setTodayMinutes(todayRes.totalMinutes);
        setWeekStats(statsRes.days);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Timer tick ───────────────────────────────
  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            handleTimerEnd();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]); // eslint-disable-line

  const handleTimerEnd = async () => {
    setRunning(false);
    if (mode === 'work') {
      // Log completed work session
      try {
        const res = await pomodoroAPI.complete({ durationMinutes: WORK_MINUTES, label });
        updateUser({ xp: (user.xp || 0) + res.xpEarned });
        setToast(`🎉 Focus session complete! +${res.xpEarned} XP`);
        setNovaMood('celebrate');
        setTimeout(() => { setToast(null); setNovaMood('happy'); }, 3000);
        loadData();
      } catch (e) { console.error(e); }
      setMode('break');
      setSecondsLeft(BREAK_MINUTES * 60);
    } else {
      setMode('work');
      setSecondsLeft(WORK_MINUTES * 60);
    }
  };

  const toggleRunning = () => setRunning(r => !r);

  const resetTimer = () => {
    setRunning(false);
    setSecondsLeft(mode === 'work' ? WORK_MINUTES * 60 : BREAK_MINUTES * 60);
  };

  const switchMode = (newMode) => {
    setRunning(false);
    setMode(newMode);
    setSecondsLeft(newMode === 'work' ? WORK_MINUTES * 60 : BREAK_MINUTES * 60);
  };

  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const secs = String(secondsLeft % 60).padStart(2, '0');
  const totalSeconds = mode === 'work' ? WORK_MINUTES * 60 : BREAK_MINUTES * 60;
  const pct = ((totalSeconds - secondsLeft) / totalSeconds) * 100;

  // Circular progress calc
  const size = 220, stroke = 14;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  if (loading) return (
    <div className="page" style={{ textAlign: 'center', paddingTop: 80 }}>
      <Mascot size={80} mood="sleepy" level={user?.level} />
      <div style={{ color: 'var(--text2)', marginTop: 16 }}>Nova is setting up your timer...</div>
    </div>
  );

  return (
    <div className="page" style={{ maxWidth: 720, margin: '0 auto' }}>
      {toast && (
        <div style={{
          position: 'fixed', top: 90, right: 32, zIndex: 300,
          background: 'linear-gradient(135deg, var(--violet), var(--violet2))',
          color: 'white', padding: '14px 22px', borderRadius: 16,
          fontWeight: 700, fontSize: 14, boxShadow: 'var(--shadow-glow)',
        }}>
          {toast}
        </div>
      )}

      {/* Mode tabs */}
      <div className="tabs" style={{ margin: '0 auto 26px', justifyContent: 'center', width: 'fit-content' }}>
        <div className={`tab ${mode === 'work' ? 'active' : ''}`} onClick={() => switchMode('work')}>🎯 Focus (25m)</div>
        <div className={`tab ${mode === 'break' ? 'active' : ''}`} onClick={() => switchMode('break')}>☕ Break (5m)</div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <Mascot size={64} level={user?.level} mood={novaMood} reactFor={2500} />
      </div>

      {/* Timer card */}
      <div className="card" style={{ textAlign: 'center', padding: 36, marginBottom: 24 }}>
        <div style={{ position: 'relative', width: size, height: size, margin: '0 auto 24px' }}>
          <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
            <defs>
              <linearGradient id="pomGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={mode === 'work' ? '#8B6BFF' : '#4ADE9A'} />
                <stop offset="100%" stopColor={mode === 'work' ? '#45E0E8' : '#45E0E8'} />
              </linearGradient>
            </defs>
            <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="var(--card2)" strokeWidth={stroke} />
            <circle
              cx={size/2} cy={size/2} r={radius} fill="none"
              stroke="url(#pomGradient)" strokeWidth={stroke}
              strokeDasharray={circumference} strokeDashoffset={offset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
          <div style={{
            position: 'absolute', top: 0, left: 0, width: size, height: size,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 52, fontWeight: 800 }}>{mins}:{secs}</div>
            <div style={{ fontSize: 13, color: 'var(--text2)', fontWeight: 600, marginTop: 4 }}>
              {mode === 'work' ? '🎯 Focus Time' : '☕ Break Time'}
            </div>
          </div>
        </div>

        {mode === 'work' && (
          <input
            className="input-field"
            placeholder="What are you focusing on? (e.g. DSA practice)"
            value={label}
            onChange={e => setLabel(e.target.value)}
            style={{ maxWidth: 320, margin: '0 auto 20px' }}
          />
        )}

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button className="btn btn-primary" style={{ padding: '12px 32px', fontSize: 15 }} onClick={toggleRunning}>
            {running ? '⏸ Pause' : '▶ Start'}
          </button>
          <button className="btn btn-ghost" onClick={resetTimer}>↺ Reset</button>
        </div>
      </div>

      {/* Today's stats */}
      <div className="grid grid-2" style={{ marginBottom: 22 }}>
        <div className="stat-tile">
          <div className="stat-tile-icon" style={{ background: 'rgba(139,107,255,0.12)', color: 'var(--violet)' }}>⏱️</div>
          <div>
            <div className="stat-tile-value">{todayCount}</div>
            <div className="stat-tile-label">Sessions Today</div>
          </div>
        </div>
        <div className="stat-tile">
          <div className="stat-tile-icon" style={{ background: 'rgba(74,222,154,0.12)', color: 'var(--green)' }}>🧠</div>
          <div>
            <div className="stat-tile-value">{todayMinutes}m</div>
            <div className="stat-tile-label">Focus Time Today</div>
          </div>
        </div>
      </div>

      {/* Week chart */}
      <div className="card" style={{ marginBottom: 22 }}>
        <div className="section-title" style={{ marginBottom: 16 }}>This Week's Focus Sessions</div>
        <div className="mini-chart">
          {weekStats.map((d, i) => {
            const max = Math.max(...weekStats.map(x => x.count), 1);
            return (
              <div key={i} className="bar" data-val={`${d.count} sessions`} style={{
                height: `${(d.count / max) * 100}%`,
                background: i === weekStats.length - 1
                  ? 'linear-gradient(180deg, var(--violet), var(--cyan))'
                  : 'linear-gradient(180deg, var(--border2), var(--card2))',
              }} />
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: 7, marginTop: 8 }}>
          {weekStats.map((d, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: 10, fontWeight: 700, color: i === weekStats.length - 1 ? 'var(--violet)' : 'var(--text3)' }}>
              {new Date(d.date).toLocaleDateString(undefined, { weekday: 'short' }).slice(0, 1)}
            </div>
          ))}
        </div>
      </div>

      {/* Today's session log */}
      {sessions.length > 0 && (
        <div className="card">
          <div className="section-title" style={{ marginBottom: 14 }}>Today's Sessions</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {sessions.map(s => (
              <div key={s._id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 14px', borderRadius: 12, background: 'var(--card2)',
              }}>
                <div style={{ fontSize: 16 }}>⏱️</div>
                <div style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{s.label || 'Focus session'}</div>
                <div style={{ fontSize: 12, color: 'var(--text3)' }}>{s.durationMinutes}m</div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 12, color: 'var(--violet)' }}>+{s.xpEarned} XP</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
