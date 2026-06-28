// src/pages/Roadmap.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { roadmapAPI } from '../services/api';
import Mascot from '../components/Mascot';

const CATEGORY_META = {
  dsa:     { tagClass: 'dsa',     color: 'var(--violet)' },
  web:     { tagClass: 'web',     color: 'var(--cyan)'   },
  ml:      { tagClass: 'ml',      color: 'var(--green)'  },
  sys:     { tagClass: 'sys',     color: 'var(--gold)'   },
  general: { tagClass: 'web',     color: 'var(--cyan)'   },
};

export default function Roadmap() {
  const { user, updateUser } = useAuth();
  const [roadmaps,    setRoadmaps]    = useState([]);
  const [myRoadmaps,  setMyRoadmaps]  = useState([]);
  const [activeId,    setActiveId]    = useState(null); // roadmap currently viewed in detail
  const [loading,      setLoading]     = useState(true);
  const [starting,     setStarting]    = useState(null);
  const [toast,        setToast]       = useState(null);

  const loadAll = () => {
    setLoading(true);
    Promise.all([roadmapAPI.getAll(), roadmapAPI.getMine()])
      .then(([allRes, mineRes]) => {
        setRoadmaps(allRes.roadmaps);
        setMyRoadmaps(mineRes.userRoadmaps);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadAll(); }, []);

  const myProgressFor = (roadmapId) => myRoadmaps.find(ur => ur.roadmap?._id === roadmapId);

  const handleStart = async (roadmap) => {
    setStarting(roadmap._id);
    try {
      await roadmapAPI.start(roadmap._id);
      await loadAll();
      setActiveId(roadmap._id);
    } catch (e) { console.error(e); }
    finally { setStarting(null); }
  };

  const handleToggleStep = async (roadmapId, stepId) => {
    try {
      const res = await roadmapAPI.toggleStep(roadmapId, stepId);
      setMyRoadmaps(prev => prev.map(ur =>
        ur.roadmap?._id === roadmapId
          ? { ...ur, completedSteps: res.userRoadmap.completedSteps, status: res.userRoadmap.status,
              doneSteps: res.userRoadmap.completedSteps.length,
              percent: Math.round((res.userRoadmap.completedSteps.length / ur.totalSteps) * 100) }
          : ur
      ));

      const totalXP = res.xpEarned + (res.bonusXP || 0);
      if (totalXP !== 0) {
        updateUser({ xp: Math.max(0, (user.xp || 0) + totalXP) });
      }
      if (res.roadmapCompleted) {
        setToast(`🏆 Roadmap completed! +${res.xpEarned} XP + ${res.bonusXP} bonus XP`);
        setTimeout(() => setToast(null), 3500);
      } else if (res.xpEarned > 0) {
        setToast(`✅ +${res.xpEarned} XP earned!`);
        setTimeout(() => setToast(null), 2000);
      }
    } catch (e) { console.error(e); }
  };

  const handleLeave = async (roadmapId) => {
    try {
      await roadmapAPI.leave(roadmapId);
      setMyRoadmaps(prev => prev.filter(ur => ur.roadmap?._id !== roadmapId));
      setActiveId(null);
    } catch (e) { console.error(e); }
  };

  if (loading) return (
    <div className="page" style={{ textAlign: 'center', paddingTop: 80 }}>
      <Mascot size={80} mood="sleepy" level={user?.level} />
      <div style={{ color: 'var(--text2)', marginTop: 16 }}>Nova is mapping out your roadmaps...</div>
    </div>
  );

  const activeRoadmap = roadmaps.find(r => r._id === activeId);
  const activeProgress = activeId ? myProgressFor(activeId) : null;

  // ─────────────────────────────────────────
  // DETAIL VIEW — step tree for one roadmap
  // ─────────────────────────────────────────
  if (activeRoadmap) {
    const meta = CATEGORY_META[activeRoadmap.category] || CATEGORY_META.general;
    const completedIds = new Set((activeProgress?.completedSteps || []).map(String));
    const totalSteps = activeRoadmap.steps.length;
    const doneSteps  = completedIds.size;
    const pct = totalSteps ? Math.round((doneSteps / totalSteps) * 100) : 0;

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

        <button className="btn btn-ghost btn-sm" style={{ marginBottom: 16 }} onClick={() => setActiveId(null)}>
          ← Back to Roadmaps
        </button>

        {/* Header */}
        <div className="level-hero" style={{ marginBottom: 24 }}>
          <div className="level-pill" style={{ color: meta.color, background: `${meta.color}22`, borderColor: `${meta.color}55` }}>
            {activeRoadmap.icon} {activeRoadmap.category.toUpperCase()}
          </div>
          <div className="level-hero-name">{activeRoadmap.title}</div>
          <div className="level-hero-sub">{activeRoadmap.description}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 6 }}>
            <div style={{ flex: 1 }}>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, var(--violet), var(--cyan))' }} />
              </div>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--violet)', whiteSpace: 'nowrap' }}>
              {doneSteps}/{totalSteps} steps
            </div>
          </div>
          {pct === 100 && (
            <div style={{ marginTop: 14, color: 'var(--green)', fontWeight: 700, fontSize: 13 }}>
              🏆 Roadmap completed — great work!
            </div>
          )}
        </div>

        {/* Step tree (vertical, connected) */}
        <div style={{ position: 'relative', paddingLeft: 8 }}>
          {/* connecting line */}
          <div style={{
            position: 'absolute', left: 27, top: 22, bottom: 22, width: 2,
            background: 'linear-gradient(180deg, var(--violet), var(--border))',
            opacity: 0.4,
          }} />

          {activeRoadmap.steps.sort((a,b) => a.order - b.order).map((step, idx) => {
            const done = completedIds.has(step._id);
            const isNext = !done && idx === activeRoadmap.steps.findIndex(s => !completedIds.has(s._id));
            return (
              <div key={step._id} style={{ display: 'flex', gap: 16, marginBottom: 18, position: 'relative' }}>
                <div
                  onClick={() => handleToggleStep(activeRoadmap._id, step._id)}
                  style={{
                    width: 40, height: 40, borderRadius: '50%', flexShrink: 0, zIndex: 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: 14, cursor: 'pointer',
                    background: done
                      ? 'linear-gradient(135deg, var(--green), var(--cyan))'
                      : isNext ? 'linear-gradient(135deg, var(--violet), var(--violet2))' : 'var(--card2)',
                    border: done || isNext ? 'none' : '2px solid var(--border2)',
                    color: done || isNext ? 'white' : 'var(--text3)',
                    boxShadow: isNext ? '0 0 16px rgba(139,107,255,0.5)' : 'none',
                  }}
                >
                  {done ? '✓' : step.order}
                </div>
                <div className="card" style={{
                  flex: 1, padding: 16,
                  borderColor: isNext ? 'var(--violet)' : 'var(--border)',
                  opacity: done ? 0.75 : 1,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 14.5, textDecoration: done ? 'line-through' : 'none' }}>
                        {step.title}
                      </div>
                      <div style={{ color: 'var(--text2)', fontSize: 12.5, marginTop: 4 }}>{step.description}</div>
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 12,
                      color: done ? 'var(--green)' : 'var(--violet)', whiteSpace: 'nowrap',
                    }}>
                      +{step.xpReward} XP
                    </div>
                  </div>
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ marginTop: 10, fontSize: 12 }}
                    onClick={() => handleToggleStep(activeRoadmap._id, step._id)}
                  >
                    {done ? '↺ Mark Incomplete' : '✓ Mark Complete'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <button className="btn btn-ghost" style={{ marginTop: 10, color: 'var(--orange)' }} onClick={() => handleLeave(activeRoadmap._id)}>
          Leave this roadmap
        </button>
      </div>
    );
  }

  // ─────────────────────────────────────────
  // BROWSE VIEW — grid of roadmap cards
  // ─────────────────────────────────────────
  return (
    <div className="page">
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

      <div style={{ marginBottom: 22 }}>
        <div className="section-title" style={{ fontSize: 22, marginBottom: 4 }}>Learning Roadmaps</div>
        <div style={{ color: 'var(--text2)', fontSize: 13 }}>Pick a structured path and earn XP as you complete each step 🗺️</div>
      </div>

      {/* My active roadmaps strip */}
      {myRoadmaps.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <div className="section-title" style={{ fontSize: 15, marginBottom: 14 }}>Continue Learning</div>
          <div className="grid grid-auto" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
            {myRoadmaps.map(ur => {
              const meta = CATEGORY_META[ur.roadmap?.category] || CATEGORY_META.general;
              return (
                <div key={ur._id} className="card" style={{ cursor: 'pointer' }} onClick={() => setActiveId(ur.roadmap._id)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <div style={{ fontSize: 28 }}>{ur.roadmap?.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: 14.5 }}>{ur.roadmap?.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--text2)' }}>{ur.doneSteps}/{ur.totalSteps} steps done</div>
                    </div>
                    {ur.status === 'completed' && <span style={{ fontSize: 20 }}>🏆</span>}
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${ur.percent}%`, background: `linear-gradient(90deg, ${meta.color}, var(--cyan))` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* All roadmaps grid */}
      <div className="section-title" style={{ fontSize: 15, marginBottom: 14 }}>Browse All Roadmaps</div>
      <div className="grid grid-auto" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
        {roadmaps.map(r => {
          const meta = CATEGORY_META[r.category] || CATEGORY_META.general;
          const progress = myProgressFor(r._id);
          return (
            <div key={r._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14, fontSize: 24,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: `${meta.color}1A`,
                }}>
                  {r.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15 }}>{r.title}</div>
                  <span className={`tag ${meta.tagClass}`} style={{ fontSize: 10 }}>{r.steps.length} steps</span>
                </div>
              </div>
              <div style={{ color: 'var(--text2)', fontSize: 12.5, lineHeight: 1.5, minHeight: 36 }}>{r.description}</div>

              {progress ? (
                <>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${progress.percent}%`, background: `linear-gradient(90deg, ${meta.color}, var(--cyan))` }} />
                  </div>
                  <button className="btn btn-primary btn-sm" onClick={() => setActiveId(r._id)}>
                    {progress.status === 'completed' ? '🏆 View Completed' : `Continue (${progress.percent}%)`}
                  </button>
                </>
              ) : (
                <button className="btn btn-primary btn-sm" onClick={() => handleStart(r)} disabled={starting === r._id}>
                  {starting === r._id ? '⏳ Starting...' : '🚀 Start Roadmap'}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
