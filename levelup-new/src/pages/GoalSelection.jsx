// src/pages/GoalSelection.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import Mascot from '../components/Mascot';

const GOAL_CARDS = [
  { category: 'dsa',           label: 'DSA',                  sub: 'Data Structures & Algorithms', icon: '🧩', color: 'var(--violet)' },
  { category: 'coding',        label: 'Coding',                sub: 'Web, Java, Python',           icon: '💻', color: 'var(--cyan)'   },
  { category: 'aptitude',      label: 'Aptitude',              sub: 'Quantitative, Logical, Verbal', icon: '🧠', color: 'var(--gold)'   },
  { category: 'placement',     label: 'Placement Prep',        sub: 'Mock interviews, resume, HR rounds', icon: '🎯', color: 'var(--orange)' },
  { category: 'communication', label: 'Communication Skills',  sub: 'Spoken English, presentation', icon: '🗣️', color: 'var(--green)'  },
];

const DEFAULT_TARGET = 40;

export default function GoalSelection({ onContinue }) {
  const { updateUser } = useAuth();
  const [selected, setSelected] = useState({}); // { dsa: 40, coding: 60, ... }
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState('');

  const toggleCard = (category) => {
    setSelected(prev => {
      const next = { ...prev };
      if (next[category] !== undefined) {
        delete next[category];
      } else {
        next[category] = DEFAULT_TARGET;
      }
      return next;
    });
  };

  const updateTarget = (category, value) => {
    setSelected(prev => ({ ...prev, [category]: Number(value) }));
  };

  const handleContinue = async () => {
    const chosen = Object.keys(selected);
    if (chosen.length === 0) {
      setError('Pick at least one goal to continue');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const focusAreas = chosen.map(category => ({
        category,
        weeklyTargetPct: selected[category],
      }));
      const res = await authAPI.setFocusAreas(focusAreas);
      updateUser({ focusAreas: res.focusAreas, onboardingComplete: res.onboardingComplete });
      onContinue();
    } catch (err) {
      setError(err.message || 'Could not save your goals');
    } finally {
      setSaving(false);
    }
  };

  const selectedCount = Object.keys(selected).length;

  return (
    <div className="page" style={{ maxWidth: 720, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <Mascot size={90} />
        <div style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 700, letterSpacing: '0.05em', margin: '8px 0 16px' }}>
          NOVA
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 8 }}>
          Set Your Goals
        </div>
        <div style={{ color: 'var(--text2)', fontSize: 14 }}>
          Get personalized goal cards. Select what you want to focus on this week.
        </div>
      </div>

      {error && (
        <div style={{
          background: 'rgba(255,138,92,0.1)', border: '1px solid rgba(255,138,92,0.3)',
          borderRadius: 14, padding: '12px 16px', color: 'var(--orange)', fontSize: 13, marginBottom: 18, textAlign: 'center',
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Goal cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 28 }}>
        {GOAL_CARDS.map(card => {
          const isSelected = selected[card.category] !== undefined;
          const target = selected[card.category] ?? DEFAULT_TARGET;

          return (
            <div
              key={card.category}
              className="card"
              onClick={() => toggleCard(card.category)}
              style={{
                cursor: 'pointer',
                borderColor: isSelected ? card.color : 'var(--border)',
                boxShadow: isSelected ? `0 0 0 1px ${card.color}, 0 8px 24px ${card.color}22` : 'none',
                transition: 'var(--transition)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
                  background: `${card.color}1A`,
                }}>
                  {card.icon}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 15 }}>{card.label}</div>
                  <div style={{ color: 'var(--text2)', fontSize: 12.5 }}>{card.sub}</div>
                </div>

                {/* Selection checkbox */}
                <div style={{
                  width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: `2px solid ${isSelected ? card.color : 'var(--border2)'}`,
                  background: isSelected ? card.color : 'transparent',
                  fontSize: 13, fontWeight: 800, color: 'white',
                }}>
                  {isSelected && '✓'}
                </div>
              </div>

              {/* Weekly target slider — only shown once selected */}
              {isSelected && (
                <div
                  style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}
                  onClick={e => e.stopPropagation()} // don't toggle card off when adjusting slider
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 12.5, color: 'var(--text2)', fontWeight: 600 }}>Estimated weekly target</span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: card.color }}>{target}%</span>
                  </div>
                  <input
                    type="range"
                    min="10" max="100" step="5"
                    value={target}
                    onChange={e => updateTarget(card.category, e.target.value)}
                    style={{ width: '100%', accentColor: card.color, cursor: 'pointer' }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 16 }}>
          {selectedCount === 0
            ? 'Select at least one goal to continue'
            : `${selectedCount} goal${selectedCount > 1 ? 's' : ''} selected`}
        </div>
        <button
          className="btn btn-primary"
          style={{ padding: '14px 36px', fontSize: 15 }}
          onClick={handleContinue}
          disabled={saving || selectedCount === 0}
        >
          {saving ? '⏳ Saving...' : 'Continue → Dashboard'}
        </button>
      </div>
    </div>
  );
}
