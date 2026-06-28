// src/pages/Goals.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { goalAPI } from '../services/api';

const CATEGORY_META = {
  dsa:     { label: 'DSA',     tagClass: 'dsa',     icon: '🧩' },
  web:     { label: 'Web Dev', tagClass: 'web',     icon: '🌐' },
  ml:      { label: 'ML',      tagClass: 'ml',      icon: '🤖' },
  project: { label: 'Project', tagClass: 'project', icon: '🛠️' },
  sys:     { label: 'System',  tagClass: 'sys',     icon: '🗄️' },
  general: { label: 'General', tagClass: 'web',     icon: '🎯' },
};

const EMPTY_FORM = { title: '', description: '', category: 'general', targetValue: 10, unit: 'tasks', deadline: '' };

export default function Goals() {
  const { user, updateUser } = useAuth();
  const [goals,    setGoals]    = useState([]);
  const [tab,      setTab]      = useState('active');
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form,     setForm]     = useState(EMPTY_FORM);
  const [saving,   setSaving]   = useState(false);
  const [toast,    setToast]    = useState(null);

  const loadGoals = (status) => {
    setLoading(true);
    goalAPI.getAll(status === 'all' ? null : status)
      .then(res => setGoals(res.goals))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadGoals(tab); }, [tab]);

  const handleCreate = async () => {
    if (!form.title.trim() || !form.targetValue) return;
    setSaving(true);
    try {
      const res = await goalAPI.create({
        ...form,
        targetValue: Number(form.targetValue),
        deadline: form.deadline || null,
      });
      setGoals(prev => [res.goal, ...prev]);
      setForm(EMPTY_FORM);
      setShowForm(false);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const bumpProgress = async (goal, amount) => {
    try {
      const res = await goalAPI.updateProgress(goal._id, { increment: amount });
      setGoals(prev => prev.map(g => g._id === goal._id ? res.goal : g));
      if (res.justCompleted) {
        updateUser({ xp: (user.xp || 0) + res.xpEarned });
        setToast(`🎉 Goal completed! +${res.xpEarned} XP`);
        setTimeout(() => setToast(null), 3000);
      }
    } catch (e) { console.error(e); }
  };

  const handleAbandon = async (goal) => {
    try {
      const res = await goalAPI.abandon(goal._id);
      setGoals(prev => prev.map(g => g._id === goal._id ? res.goal : g));
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (goal) => {
    try {
      await goalAPI.delete(goal._id);
      setGoals(prev => prev.filter(g => g._id !== goal._id));
    } catch (e) { console.error(e); }
  };

  return (
    <div className="page" style={{ maxWidth: 900, margin: '0 auto' }}>

      {/* Toast */}
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

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="section-title" style={{ fontSize: 22, marginBottom: 4 }}>Learning Goals</div>
          <div style={{ color: 'var(--text2)', fontSize: 13 }}>Set targets, track progress, earn bonus XP when you hit them 🎯</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ New Goal</button>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {[['active','Active'],['completed','Completed'],['abandoned','Abandoned'],['all','All']].map(([v,l]) => (
          <div key={v} className={`tab ${tab===v?'active':''}`} onClick={() => setTab(v)}>{l}</div>
        ))}
      </div>

      {/* New Goal Form */}
      {showForm && (
        <div className="card" style={{ marginBottom: 20, border: '1px solid var(--violet)' }}>
          <div className="section-title" style={{ marginBottom: 16 }}>Create a New Goal</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <div className="field-label">Goal Title</div>
              <input className="input-field" placeholder="e.g. Solve 100 LeetCode problems"
                value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
            </div>
            <div>
              <div className="field-label">Description (optional)</div>
              <input className="input-field" placeholder="Why this matters to you..."
                value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
              <div>
                <div className="field-label">Category</div>
                <select className="input-field" value={form.category}
                  onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                  {Object.entries(CATEGORY_META).map(([k, v]) => (
                    <option key={k} value={k}>{v.icon} {v.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <div className="field-label">Target</div>
                <input className="input-field" type="number" min="1" value={form.targetValue}
                  onChange={e => setForm(p => ({ ...p, targetValue: e.target.value }))} />
              </div>
              <div>
                <div className="field-label">Unit</div>
                <input className="input-field" placeholder="problems, days..." value={form.unit}
                  onChange={e => setForm(p => ({ ...p, unit: e.target.value }))} />
              </div>
            </div>
            <div>
              <div className="field-label">Deadline (optional)</div>
              <input className="input-field" type="date" value={form.deadline}
                onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
            <button className="btn btn-primary btn-sm" onClick={handleCreate} disabled={saving}>
              {saving ? '⏳ Creating...' : '✓ Create Goal'}
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Goal list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text2)' }}>⏳ Loading goals...</div>
      ) : goals.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 50 }}>
          <div style={{ fontSize: 44, opacity: 0.3, marginBottom: 12 }}>🎯</div>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>No {tab !== 'all' ? tab : ''} goals yet</div>
          <div style={{ color: 'var(--text2)', fontSize: 13 }}>Create your first learning goal to start tracking progress!</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {goals.map(goal => {
            const meta = CATEGORY_META[goal.category] || CATEGORY_META.general;
            const pct  = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
            const isActive = goal.status === 'active';
            return (
              <div key={goal._id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14, marginBottom: 12, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <span className={`tag ${meta.tagClass}`}>{meta.icon} {meta.label}</span>
                      {goal.status === 'completed'  && <span className="badge-pill mentor">✅ Completed</span>}
                      {goal.status === 'abandoned'  && <span className="badge-pill" style={{ background:'rgba(93,96,146,0.15)', color:'var(--text3)', border:'1px solid var(--border)' }}>Abandoned</span>}
                    </div>
                    <div style={{ fontWeight: 800, fontSize: 16 }}>{goal.title}</div>
                    {goal.description && (
                      <div style={{ color: 'var(--text2)', fontSize: 13, marginTop: 4 }}>{goal.description}</div>
                    )}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: 'var(--violet)' }}>
                      {goal.currentValue}/{goal.targetValue}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text3)' }}>{goal.unit}</div>
                  </div>
                </div>

                <div className="progress-bar" style={{ marginBottom: 14 }}>
                  <div className="progress-fill" style={{
                    width: `${pct}%`,
                    background: goal.status === 'completed'
                      ? 'linear-gradient(90deg, var(--green), var(--cyan))'
                      : 'linear-gradient(90deg, var(--violet), var(--cyan))',
                  }} />
                </div>

                {isActive && (
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => bumpProgress(goal, 1)}>+1 {goal.unit}</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => bumpProgress(goal, 5)}>+5 {goal.unit}</button>
                    <button className="btn btn-ghost btn-sm" style={{ color: 'var(--orange)' }} onClick={() => handleAbandon(goal)}>Abandon</button>
                    <div style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text3)', alignSelf: 'center' }}>
                      {goal.deadline ? `Due ${new Date(goal.deadline).toLocaleDateString()}` : 'No deadline'}
                    </div>
                  </div>
                )}
                {!isActive && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button className="btn btn-ghost btn-sm" style={{ color: 'var(--orange)' }} onClick={() => handleDelete(goal)}>Delete</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
