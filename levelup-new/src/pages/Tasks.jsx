// src/pages/Tasks.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { taskAPI } from '../services/api';
import Mascot from '../components/Mascot';

export default function Tasks() {
  const { user, updateUser } = useAuth();
  const [tasks,         setTasks]         = useState([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [totalCount,    setTotalCount]    = useState(0);
  const [loading,       setLoading]       = useState(true);
  const [toast,         setToast]         = useState(null);
  const [history,       setHistory]       = useState({});

  const loadToday = () => {
    setLoading(true);
    taskAPI.getToday()
      .then(res => {
        setTasks(res.tasks);
        setCompletedCount(res.completedCount);
        setTotalCount(res.totalCount);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadToday();
    taskAPI.getHistory().then(res => setHistory(res.history)).catch(console.error);
  }, []);

  const handleToggle = async (task) => {
    try {
      const res = await taskAPI.toggle(task._id);
      setTasks(prev => prev.map(t => t._id === task._id ? res.task : t));

      const newCompleted = tasks.filter(t => t._id === task._id ? res.task.completed : t.completed).length;
      setCompletedCount(newCompleted);

      if (res.xpEarned !== 0) {
        const totalXP = res.xpEarned + (res.bonusXP || 0);
        updateUser({ xp: Math.max(0, (user.xp || 0) + totalXP) });
        if (res.allTasksBonusAwarded) {
          setToast(`🎉 All tasks done! +${res.xpEarned} XP + ${res.bonusXP} bonus XP`);
        } else if (res.xpEarned > 0) {
          setToast(`✅ +${res.xpEarned} XP earned!`);
        }
        setTimeout(() => setToast(null), 3000);
      }
    } catch (e) { console.error(e); }
  };

  const allDone = totalCount > 0 && completedCount === totalCount;

  // Build last 7 days mini-history strip
  const last7 = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const dayData = history[key];
    last7.push({
      label: d.toLocaleDateString(undefined, { weekday: 'short' }).slice(0, 1),
      pct: dayData ? Math.round((dayData.completed / dayData.total) * 100) : 0,
      isToday: i === 0,
    });
  }

  if (loading) return (
    <div className="page" style={{ textAlign: 'center', paddingTop: 80 }}>
      <Mascot size={80} mood="sleepy" />
      <div style={{ color: 'var(--text2)', marginTop: 16 }}>Nova is fetching today's tasks...</div>
    </div>
  );

  return (
    <div className="page" style={{ maxWidth: 760, margin: '0 auto' }}>

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

      {/* Hero card */}
      <div className="level-hero" style={{ marginBottom: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center' }}>
            <Mascot size={84} level={user?.level} mood={allDone ? 'excited' : 'happy'} />
            <div style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 700, letterSpacing: '0.05em', marginTop: 6 }}>
              NOVA
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div className="level-hero-name" style={{ fontSize: 22 }}>
              {allDone ? 'All done for today! 🎉' : "Today's Learning Tasks"}
            </div>
            <div className="level-hero-sub" style={{ marginBottom: 14 }}>
              {allDone
                ? 'Come back tomorrow for a fresh set of tasks.'
                : `${completedCount} of ${totalCount} completed — keep going!`}
            </div>
            <div className="progress-bar" style={{ maxWidth: 320 }}>
              <div className="progress-fill" style={{
                width: `${totalCount ? (completedCount / totalCount) * 100 : 0}%`,
                background: 'linear-gradient(90deg, var(--violet), var(--cyan))',
              }} />
            </div>
          </div>
        </div>
      </div>

      {/* Task checklist */}
      <div className="card" style={{ marginBottom: 22 }}>
        <div className="section-title" style={{ marginBottom: 16 }}>Task Checklist</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {tasks.map(task => (
            <div
              key={task._id}
              onClick={() => handleToggle(task)}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 16px', borderRadius: 14, cursor: 'pointer',
                background: task.completed ? 'rgba(74,222,154,0.08)' : 'var(--card2)',
                border: `1px solid ${task.completed ? 'rgba(74,222,154,0.3)' : 'var(--border)'}`,
                transition: 'all 0.2s',
              }}
            >
              <div style={{
                width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: task.completed ? 'linear-gradient(135deg, var(--green), var(--cyan))' : 'transparent',
                border: task.completed ? 'none' : '2px solid var(--border2)',
                fontSize: 13, color: 'white', fontWeight: 800,
              }}>
                {task.completed ? '✓' : ''}
              </div>
              <div style={{ fontSize: 20 }}>{task.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontWeight: 700, fontSize: 14,
                  textDecoration: task.completed ? 'line-through' : 'none',
                  color: task.completed ? 'var(--text2)' : 'var(--text)',
                }}>
                  {task.label}
                </div>
              </div>
              <div style={{
                fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 13,
                color: task.completed ? 'var(--green)' : 'var(--violet)',
              }}>
                +{task.xpReward} XP
              </div>
            </div>
          ))}
        </div>

        {allDone && (
          <div style={{
            marginTop: 16, padding: '14px 18px', borderRadius: 14, textAlign: 'center',
            background: 'rgba(74,222,154,0.1)', border: '1px solid rgba(74,222,154,0.3)',
            color: 'var(--green)', fontWeight: 700, fontSize: 13,
          }}>
            🏆 Bonus +50 XP awarded for completing every task today!
          </div>
        )}
      </div>

      {/* 7-day history strip */}
      <div className="card">
        <div className="section-title" style={{ marginBottom: 16 }}>This Week</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {last7.map((d, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{
                height: 64, borderRadius: 10, display: 'flex', alignItems: 'flex-end',
                background: 'var(--card2)', border: `1px solid ${d.isToday ? 'var(--violet)' : 'var(--border)'}`,
                overflow: 'hidden',
              }}>
                <div style={{
                  width: '100%', height: `${d.pct}%`,
                  background: d.pct === 100
                    ? 'linear-gradient(180deg, var(--green), var(--cyan))'
                    : 'linear-gradient(180deg, var(--violet), var(--violet2))',
                  transition: 'height 0.6s ease',
                }} />
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: d.isToday ? 'var(--violet)' : 'var(--text3)', marginTop: 6 }}>
                {d.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
