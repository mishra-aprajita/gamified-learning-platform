// src/pages/Reports.jsx
import React, { useState, useEffect } from 'react';
import { reportAPI } from '../services/api';
import Mascot from '../components/Mascot';

function ChangeBadge({ value }) {
  if (value === 0) return <span style={{ color: 'var(--text3)', fontSize: 12 }}>— no change</span>;
  const up = value > 0;
  return (
    <span style={{ color: up ? 'var(--green)' : 'var(--orange)', fontSize: 12, fontWeight: 700 }}>
      {up ? '▲' : '▼'} {Math.abs(value)}% vs last week
    </span>
  );
}

export default function Reports() {
  const [report,  setReport]  = useState(null);
  const [monthly, setMonthly] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([reportAPI.getWeekly(), reportAPI.getMonthly()])
      .then(([weeklyRes, monthlyRes]) => {
        setReport(weeklyRes);
        setMonthly(monthlyRes.months);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="page" style={{ textAlign: 'center', paddingTop: 80 }}>
      <Mascot size={80} mood="sleepy" />
      <div style={{ color: 'var(--text2)', marginTop: 16 }}>Nova is building your weekly report...</div>
    </div>
  );

  if (!report) return (
    <div className="page" style={{ textAlign: 'center', paddingTop: 80, color: 'var(--text2)' }}>
      Couldn't load your report. Try again later.
    </div>
  );

  const { summary, dailyXP, weeklyXPTotal, mostActiveDay, recommendation, currentXP, currentStreak, currentLevel } = report;
  const maxXP = Math.max(...dailyXP.map(d => d.estimatedXP), 1);
  const maxMonthXP = Math.max(...monthly.map(m => m.estimatedXP), 1);

  return (
    <div className="page" style={{ maxWidth: 900, margin: '0 auto' }}>

      {/* Header */}
      <div className="level-hero" style={{ marginBottom: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 22, flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center' }}>
            <Mascot size={80} level={currentLevel} mood={weeklyXPTotal > 0 ? 'excited' : 'happy'} />
            <div style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 700, letterSpacing: '0.05em', marginTop: 6 }}>
              NOVA
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div className="level-pill">📊 Weekly Progress Report</div>
            <div className="level-hero-name" style={{ fontSize: 22 }}>
              You earned <span style={{ color: 'var(--violet)' }}>{weeklyXPTotal} XP</span> this week
            </div>
            <div className="level-hero-sub">{recommendation}</div>
          </div>
        </div>
      </div>

      {/* Top stat row */}
      <div className="grid grid-4" style={{ marginBottom: 22 }}>
        <div className="stat-tile">
          <div className="stat-tile-icon" style={{ background: 'rgba(139,107,255,0.12)', color: 'var(--violet)' }}>⚡</div>
          <div><div className="stat-tile-value">{currentXP.toLocaleString()}</div><div className="stat-tile-label">Total XP</div></div>
        </div>
        <div className="stat-tile">
          <div className="stat-tile-icon" style={{ background: 'rgba(255,138,92,0.12)', color: 'var(--orange)' }}>🔥</div>
          <div><div className="stat-tile-value">{currentStreak}</div><div className="stat-tile-label">Day Streak</div></div>
        </div>
        <div className="stat-tile">
          <div className="stat-tile-icon" style={{ background: 'rgba(69,224,232,0.12)', color: 'var(--cyan)' }}>⭐</div>
          <div><div className="stat-tile-value">{currentLevel}</div><div className="stat-tile-label">Current Level</div></div>
        </div>
        <div className="stat-tile">
          <div className="stat-tile-icon" style={{ background: 'rgba(74,222,154,0.12)', color: 'var(--green)' }}>📅</div>
          <div><div className="stat-tile-value">{mostActiveDay?.label || '—'}</div><div className="stat-tile-label">Most Active Day</div></div>
        </div>
      </div>

      {/* Weekly XP chart */}
      <div className="card" style={{ marginBottom: 22 }}>
        <div className="section-title" style={{ marginBottom: 16 }}>Daily XP This Week</div>
        <div className="mini-chart">
          {dailyXP.map((d, i) => (
            <div key={i} className="bar" data-val={`${d.estimatedXP} XP`} style={{
              height: `${(d.estimatedXP / maxXP) * 100}%`,
              background: i === dailyXP.length - 1
                ? 'linear-gradient(180deg, var(--violet), var(--cyan))'
                : 'linear-gradient(180deg, var(--border2), var(--card2))',
            }} />
          ))}
        </div>
        <div style={{ display: 'flex', gap: 7, marginTop: 8 }}>
          {dailyXP.map((d, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: 10, fontWeight: 700, color: i === dailyXP.length - 1 ? 'var(--violet)' : 'var(--text3)' }}>
              {d.label}
            </div>
          ))}
        </div>
      </div>

      {/* Feature breakdown grid */}
      <div className="grid grid-2" style={{ marginBottom: 22 }}>
        <div className="card">
          <div className="section-title" style={{ marginBottom: 14 }}>📝 Learning Posts</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 800 }}>{summary.posts.thisWeek}</div>
          <ChangeBadge value={summary.posts.change} />
        </div>
        <div className="card">
          <div className="section-title" style={{ marginBottom: 14 }}>✅ Tasks Completed</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 800 }}>{summary.tasksCompleted.thisWeek}</div>
          <ChangeBadge value={summary.tasksCompleted.change} />
        </div>
        <div className="card">
          <div className="section-title" style={{ marginBottom: 14 }}>❓ Quizzes Taken</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 800 }}>{summary.quizzesCompleted.thisWeek}</div>
          <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 6 }}>
            Avg score: <strong style={{ color: 'var(--violet)' }}>{summary.quizzesCompleted.avgScoreThisWeek}/5</strong>
          </div>
          <ChangeBadge value={summary.quizzesCompleted.change} />
        </div>
        <div className="card">
          <div className="section-title" style={{ marginBottom: 14 }}>⏱️ Pomodoro Sessions</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 800 }}>{summary.pomodoroSessions.thisWeek}</div>
          <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 6 }}>
            {summary.pomodoroSessions.focusMinutesThisWeek} focus minutes
          </div>
          <ChangeBadge value={summary.pomodoroSessions.change} />
        </div>
      </div>

      {/* Goals completed */}
      {summary.goalsCompleted > 0 && (
        <div className="card" style={{ marginBottom: 22, background: 'rgba(74,222,154,0.06)', borderColor: 'rgba(74,222,154,0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ fontSize: 28 }}>🎯</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15 }}>{summary.goalsCompleted} goal{summary.goalsCompleted > 1 ? 's' : ''} completed this week!</div>
              <div style={{ color: 'var(--text2)', fontSize: 12.5 }}>Great consistency — keep setting new targets.</div>
            </div>
          </div>
        </div>
      )}

      {/* Monthly trend */}
      <div className="card">
        <div className="section-title" style={{ marginBottom: 16 }}>6-Month XP Trend</div>
        <div className="mini-chart" style={{ height: 100 }}>
          {monthly.map((m, i) => (
            <div key={i} className="bar" data-val={`${m.estimatedXP} XP`} style={{
              height: `${(m.estimatedXP / maxMonthXP) * 100}%`,
              background: i === monthly.length - 1
                ? 'linear-gradient(180deg, var(--violet), var(--cyan))'
                : 'linear-gradient(180deg, var(--border2), var(--card2))',
            }} />
          ))}
        </div>
        <div style={{ display: 'flex', gap: 7, marginTop: 8 }}>
          {monthly.map((m, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: 10, fontWeight: 700, color: i === monthly.length - 1 ? 'var(--violet)' : 'var(--text3)' }}>
              {m.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
