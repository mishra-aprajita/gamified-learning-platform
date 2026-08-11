// src/pages/PracticeHub.jsx
// ─────────────────────────────────────────────────────────────────
//  Practice Hub — curated interactive learning resources.
//  Focuses on game-based, interactive, and lesser-known websites.
//  No LeetCode / HackerRank / CodeChef / Codeforces / GeeksforGeeks.
// ─────────────────────────────────────────────────────────────────
import React, { useState, useEffect, useMemo } from 'react';

// ── Category config (each gets its own accent color) ────────────
const CATEGORIES = [
  { id: 'all',    label: 'All',          icon: '🌐', color: '#8B6BFF' },
  { id: 'html',   label: 'HTML & CSS',   icon: '🎨', color: '#FF6B6B' },
  { id: 'js',     label: 'JavaScript',   icon: '⚡', color: '#FFC25C' },
  { id: 'python', label: 'Python',       icon: '🐍', color: '#4ADE9A' },
  { id: 'react',  label: 'React',        icon: '🌀',  color: '#45E0E8' },
  { id: 'sql',    label: 'SQL',          icon: '🗄',  color: '#A78BFA' },
  { id: 'git',    label: 'Git & GitHub', icon: '🌿', color: '#FB923C' },
  { id: 'linux',  label: 'Linux',        icon: '🐧', color: '#94A3B8' },
  { id: 'uiux',   label: 'UI/UX',        icon: '✏️',  color: '#F472B6' },
];

const DIFFICULTIES = ['All', 'Beginner', 'Intermediate', 'Advanced'];

// ── Complete resource dataset ────────────────────────────────────
const RESOURCES = [
  // ── HTML & CSS ──────────────────────────────────
  {
    id: 1, category: 'html', name: 'Flexbox Froggy',
    emoji: '🐸', accent: '#4ADE9A',
    desc: 'Guide a frog to its lily pad by writing CSS Flexbox properties. 24 progressively harder levels — the most fun way to finally "get" flexbox.',
    difficulty: 'Beginner', time: '2–3 hrs',
    tags: ['CSS', 'Flexbox', 'Game-based'],
    url: 'https://flexboxfroggy.com',
  },
  {
    id: 2, category: 'html', name: 'CSSBattle',
    emoji: '🎯', accent: '#FF6B6B',
    desc: 'Replicate target images using the least amount of CSS code possible. Competitive, creative, and shockingly addictive once you start.',
    difficulty: 'Intermediate', time: 'Ongoing',
    tags: ['CSS', 'Code Golf', 'Competitive'],
    url: 'https://cssbattle.dev',
  },
  {
    id: 3, category: 'html', name: 'Grid Garden',
    emoji: '🌱',
accent: '#86EFAC',
    desc: "Water your carrot garden using CSS Grid. 28 levels that cover every grid property you'll ever need in real projects.",
    difficulty: 'Beginner', time: '2–4 hrs',
    tags: ['CSS', 'Grid', 'Game-based'],
    url: 'https://cssgridgarden.com',
  },
  {
    id: 4, category: 'html', name: 'CSS Diner',
    emoji: '🍽️', accent: '#FDE68A',
    desc: 'Select plates and food using CSS selectors. 32 levels covering every selector from basic tags to :nth-child and attribute selectors.',
    difficulty: 'Beginner', time: '1–2 hrs',
    tags: ['CSS', 'Selectors', 'Game-based'],
    url: 'https://flukeout.github.io',
  },
  {
    id: 5, category: 'html', name: 'Codepip',
    emoji: '🎮', accent: '#C4B5FD',
    desc: 'Hub for all coding games — includes Flexbox Froggy, Grid Garden, CSS Diner, and more. Track your progress across all games in one place.',
    difficulty: 'Beginner', time: 'Ongoing',
    tags: ['CSS', 'HTML', 'Multi-game'],
    url: 'https://codepip.com',
  },

  // ── JavaScript ──────────────────────────────────
  {
    id: 6, category: 'js', name: 'CheckiO',
    emoji: '🏝', accent: '#67E8F9',
    desc: 'Solve programming challenges on an island map. Community reviews your code after each mission and suggests more elegant solutions.',
    difficulty: 'Intermediate', time: 'Ongoing',
    tags: ['JavaScript', 'Python', 'Community'],
    url: 'https://js.checkio.org',
  },
  {
    id: 7, category: 'js', name: 'Codédex',
    emoji: '⭐', accent: '#FCD34D',
    desc: 'A retro-RPG learning platform for JavaScript, Python, and more. Earn points, unlock achievements, and level up as you learn to code.',
    difficulty: 'Beginner', time: 'Ongoing',
    tags: ['JavaScript', 'RPG', 'XP System'],
    url: 'https://www.codedex.io',
  },
  {
    id: 8, category: 'js', name: 'JSRobot',
    emoji: '🤖', accent: '#6EE7B7',
    desc: 'Write JavaScript to control a robot and complete obstacle courses. Unique physical-feedback style that makes array/loop concepts click instantly.',
    difficulty: 'Beginner', time: '3–5 hrs',
    tags: ['JavaScript', 'Game-based', 'Loops'],
    url: 'https://lab.reaal.me/jsrobot',
  },
  {
    id: 9, category: 'js', name: 'Screeps',
    emoji: '🕹', accent: '#A3E635',
    desc: 'Program real-time strategy game units with actual JavaScript. Your code runs in a persistent world — the most serious JS game environment available.',
    difficulty: 'Advanced', time: 'Ongoing',
    tags: ['JavaScript', 'Strategy', 'Real-time'],
    url: 'https://screeps.com',
  },

  // ── Python ──────────────────────────────────────
  {
    id: 10, category: 'python', name: 'PracticePython.org',
    emoji: '🐍',
accent: '#4ADE9A',
    desc: '40+ beginner exercises with solutions and difficulty ratings. Great for building Python fundamentals with no account required.',
    difficulty: 'Beginner', time: '5–10 hrs',
    tags: ['Python', 'Exercises', 'Beginner-friendly'],
    url: 'https://www.practicepython.org',
  },
  {
    id: 11, category: 'python', name: 'PyNative Exercises',
    emoji: '🔬', accent: '#34D399',
    desc: 'Structured Python exercises covering basics, OOP, NumPy, and Pandas. Each set comes with detailed hints so you never get completely stuck.',
    difficulty: 'Beginner', time: '6–12 hrs',
    tags: ['Python', 'OOP', 'NumPy', 'Pandas'],
    url: 'https://pynative.com/python-exercises-with-solutions',
  },
  {
    id: 12, category: 'python', name: 'CheckiO Python',
    emoji: '🏝', accent: '#67E8F9',
    desc: "Python missions in a beautiful island-map interface. Each solution gets peer-reviewed — you'll see 10 different ways to write the same function.",
    difficulty: 'Intermediate', time: 'Ongoing',
    tags: ['Python', 'Community', 'Code Review'],
    url: 'https://py.checkio.org',
  },

  // ── React ────────────────────────────────────────
  {
    id: 13, category: 'react', name: 'React.gg',
    emoji: '🌀', accent: '#45E0E8',
    desc: 'Interactive React course built entirely in the browser — no setup, no config. Visualizes component trees, state flows, and re-renders in real time.',
    difficulty: 'Intermediate', time: '10–15 hrs',
    tags: ['React', 'Interactive', 'Visual'],
    url: 'https://react.gg',
  },
  {
    id: 14, category: 'react', name: 'Scrimba — React',
    emoji: '🎬', accent: '#8B6BFF',
    desc: 'Pause any lesson and edit the instructor\'s code directly inside the video. The React path covers hooks, state, routing, and real project builds.',
    difficulty: 'Beginner', time: '20–30 hrs',
    tags: ['React', 'Video', 'Interactive Code'],
    url: 'https://scrimba.com/learn/learnreact',
  },

  // ── SQL ──────────────────────────────────────────
  {
    id: 15, category: 'sql', name: 'SQL Murder Mystery',
    emoji: '🔍', accent: '#A78BFA',
    desc: 'Solve a murder mystery using only SQL queries. You start with a crime report and use real joins, subqueries, and aggregates to find the killer.',
    difficulty: 'Intermediate', time: '2–4 hrs',
    tags: ['SQL', 'Narrative', 'Problem-solving'],
    url: 'https://mystery.knightlab.com',
  },
  {
    id: 16, category: 'sql', name: 'Select Star SQL',
    emoji: '⭐', accent: '#C4B5FD',
    desc: 'Interactive SQL book — you write real queries against a real database of Texas death row inmates. Sobering context makes every query feel meaningful.',
    difficulty: 'Beginner', time: '4–6 hrs',
    tags: ['SQL', 'Interactive Book', 'Real Data'],
    url: 'https://selectstarsql.com',
  },

  // ── Git & GitHub ─────────────────────────────────
  {
    id: 17, category: 'git', name: 'Learn Git Branching',
    emoji: '🌿', accent: '#86EFAC',
    desc: 'Visualizes Git commands as a live branch graph as you type them. Covers branching, rebasing, cherry-pick, and remote operations with beautiful animations.',
    difficulty: 'Beginner', time: '3–6 hrs',
    tags: ['Git', 'Visual', 'Interactive'],
    url: 'https://learngitbranching.js.org',
  },
  {
    id: 18, category: 'git', name: 'Oh My Git!',
    emoji: '🃏', accent: '#FDE68A',
    desc: 'A card game where each card is a Git command — you use them to solve puzzles. Desktop app with a real Git repository built in. Brilliant concept.',
    difficulty: 'Beginner', time: '2–4 hrs',
    tags: ['Git', 'Card Game', 'Desktop App'],
    url: 'https://ohmygit.org',
  },

  // ── Linux / Terminal ─────────────────────────────
  {
    id: 19, category: 'linux', name: 'OverTheWire: Bandit',
    emoji: '🏴', accent: '#94A3B8',
    desc: 'Beginner-friendly wargame that teaches Linux command line through hacking challenges. Each level is a server you SSH into and escape from.',
    difficulty: 'Beginner', time: '5–10 hrs',
    tags: ['Linux', 'Terminal', 'Security'],
    url: 'https://overthewire.org/wargames/bandit',
  },
  {
    id: 20, category: 'linux', name: 'CMD Challenge',
    emoji: '⌨', accent: '#CBD5E1',
    desc: 'Pure terminal challenges in your browser. Tasks start with "print hello world" and escalate to complex piping, grep, and awk operations.',
    difficulty: 'Intermediate', time: '3–8 hrs',
    tags: ['Linux', 'Bash', 'Terminal'],
    url: 'https://cmdchallenge.com',
  },

  // ── UI/UX ────────────────────────────────────────
  {
    id: 21, category: 'uiux', name: 'GoodUI',
    emoji: '💎', accent: '#F472B6',
    desc: 'A/B-tested UI patterns — shows real conversion data comparing two versions of the same UI. Teaches design decisions backed by actual numbers.',
    difficulty: 'Intermediate', time: 'Ongoing',
    tags: ['UI', 'A/B Testing', 'Patterns'],
    url: 'https://goodui.org',
  },
  {
    id: 22, category: 'uiux', name: 'UI Coach',
    emoji: '🎨', accent: '#FB7185',
    desc: 'Gives you a random UI design brief and a timer. Great for building a portfolio quickly — each brief takes 30–60 minutes to design and forces creative constraints.',
    difficulty: 'Beginner', time: '30–60 min/session',
    tags: ['UI Design', 'Brief Generator', 'Portfolio'],
    url: 'https://uicoach.io',
  },
];

// ── Difficulty badge colors ──────────────────────────────────────
const DIFF_COLORS = {
  Beginner:     { bg: 'rgba(74,222,154,0.15)',  color: '#4ADE9A',  border: 'rgba(74,222,154,0.3)'  },
  Intermediate: { bg: 'rgba(252,211,77,0.15)',  color: '#FCD34D',  border: 'rgba(252,211,77,0.3)'  },
  Advanced:     { bg: 'rgba(239,68,68,0.15)',   color: '#F87171',  border: 'rgba(239,68,68,0.3)'   },
};

const STORAGE_KEY_FAV  = 'xpify_hub_favorites';
const STORAGE_KEY_DONE = 'xpify_hub_completed';
const STORAGE_KEY_RECENT = 'xpify_hub_recent';

// ────────────────────────────────────────────────────────────────
export default function PracticeHub() {
  const [search,    setSearch]    = useState('');
  const [category,  setCategory]  = useState('all');
  const [difficulty, setDifficulty] = useState('All');
  const [favorites, setFavorites] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY_FAV) || '[]')); } catch { return new Set(); }
  });
  const [completed, setCompleted] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY_DONE) || '[]')); } catch { return new Set(); }
  });
  const [recent,    setRecent]    = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY_RECENT) || '[]'); } catch { return []; }
  });
  const [showFavOnly, setShowFavOnly] = useState(false);
  const [toast,    setToast]      = useState(null);
  const [todayRec, setTodayRec]   = useState(null);

  // Pick a daily recommendation — same one all day, changes daily
  useEffect(() => {
    const dayIndex = Math.floor(Date.now() / 86400000) % RESOURCES.length;
    setTodayRec(RESOURCES[dayIndex]);
  }, []);

  // Persist favorites + completed to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_FAV, JSON.stringify([...favorites]));
  }, [favorites]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_DONE, JSON.stringify([...completed]));
  }, [completed]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_RECENT, JSON.stringify(recent));
  }, [recent]);

  // ── Filtered list ──────────────────────────────────────────────
  const filtered = useMemo(() => {
    return RESOURCES.filter(r => {
      if (showFavOnly && !favorites.has(r.id)) return false;
      if (category !== 'all' && r.category !== category) return false;
      if (difficulty !== 'All' && r.difficulty !== difficulty) return false;
      if (search) {
        const q = search.toLowerCase();
        return r.name.toLowerCase().includes(q) || r.desc.toLowerCase().includes(q) || r.tags.some(t => t.toLowerCase().includes(q));
      }
      return true;
    });
  }, [search, category, difficulty, showFavOnly, favorites]);

  // ── Actions ────────────────────────────────────────────────────
  function toggleFav(id) {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); showToast('Removed from favorites'); }
      else               { next.add(id);    showToast('⭐ Added to favorites!'); }
      return next;
    });
  }

  function toggleDone(id) {
    setCompleted(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); showToast('Marked as not done'); }
      else               { next.add(id);    showToast('✅ Marked as completed!'); }
      return next;
    });
  }

  function openResource(resource) {
    setRecent(prev => {
      const filtered = prev.filter(id => id !== resource.id);
      return [resource.id, ...filtered].slice(0, 5);
    });
    window.location.href = resource.url;
  }

  function randomPick() {
    const r = RESOURCES[Math.floor(Math.random() * RESOURCES.length)];
    setCategory('all'); setSearch(''); setDifficulty('All'); setShowFavOnly(false);
    openResource(r);
    showToast(`🎲 Opening ${r.name}!`);
  }

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }

  const recentResources = recent.map(id => RESOURCES.find(r => r.id === id)).filter(Boolean);

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)',
      fontFamily: 'var(--font-body)', padding: '28px 28px 60px',
    }}>
      {/* ── Toast ─────────────────────────────────────────────── */}
      {toast && (
        <div style={{
          position: 'fixed', top: 80, right: 28, zIndex: 400,
          background: 'linear-gradient(135deg, var(--violet), var(--violet2))',
          color: '#fff', padding: '12px 20px', borderRadius: 14,
          fontWeight: 700, fontSize: 13, boxShadow: 'var(--shadow-glow)',
          animation: 'fadeIn 0.2s ease',
        }}>
          {toast}
        </div>
      )}

      {/* ── Header ────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
              <div style={{
                width: 46, height: 46, borderRadius: 14,
                background: 'linear-gradient(135deg, var(--violet), var(--cyan))',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
                boxShadow: '0 0 20px rgba(139,107,255,0.4)',
              }}>🧭</div>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, letterSpacing: '-0.01em' }}>
                  Practice Hub
                </div>
                <div style={{ color: 'var(--text2)', fontSize: 13 }}>
                  {RESOURCES.length} curated resources · no LeetCode, no grind culture
                </div>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button onClick={randomPick} style={secondaryBtnStyle}>
              🎲 Random Resource
            </button>
            <button onClick={() => setShowFavOnly(s => !s)} style={{
              ...secondaryBtnStyle,
              background: showFavOnly ? 'rgba(139,107,255,0.2)' : 'var(--card2)',
              borderColor: showFavOnly ? 'var(--violet)' : 'var(--border)',
              color: showFavOnly ? 'var(--violet)' : 'var(--text2)',
            }}>
              ⭐ Favorites ({favorites.size})
            </button>
          </div>
        </div>

        {/* ── Today's recommendation ──────────────────────────── */}
        {todayRec && !showFavOnly && !search && category === 'all' && (
          <div style={{
            background: `linear-gradient(135deg, rgba(139,107,255,0.12), rgba(69,224,232,0.06))`,
            border: '1px solid rgba(139,107,255,0.3)',
            borderRadius: 20, padding: '20px 24px', marginBottom: 24,
            display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap',
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--violet)', letterSpacing: '0.08em', flexBasis: '100%' }}>
              TODAY'S RECOMMENDED PRACTICE
            </div>
            <div style={{ fontSize: 36 }}>{todayRec.emoji}</div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>{todayRec.name}</div>
              <div style={{ color: 'var(--text2)', fontSize: 13 }}>{todayRec.desc.slice(0, 120)}...</div>
            </div>
            <button onClick={() => openResource(todayRec)} style={primaryBtnStyle}>
              Start Today's Practice →
            </button>
          </div>
        )}

        {/* ── Recently visited ────────────────────────────────── */}
        {recentResources.length > 0 && !showFavOnly && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text2)', marginBottom: 10 }}>🕐 Recently Visited</div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {recentResources.map(r => (
                <button key={r.id} onClick={() => openResource(r)} style={{
                  background: 'var(--card2)', border: '1px solid var(--border)',
                  borderRadius: 10, padding: '6px 14px', fontSize: 12, fontWeight: 600,
                  color: 'var(--text)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <span>{r.emoji}</span> {r.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Search ──────────────────────────────────────────── */}
        <div style={{ position: 'relative', marginBottom: 20 }}>
          <div style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)', fontSize: 16 }}>🔍</div>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search resources, tags, or skills..."
            style={{
              width: '100%', background: 'var(--card)', border: '1px solid var(--border)',
              borderRadius: 14, padding: '14px 16px 14px 46px',
              color: 'var(--text)', fontSize: 14, outline: 'none', boxSizing: 'border-box',
              transition: 'border-color 0.2s',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--violet)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
        </div>

        {/* ── Category tabs ───────────────────────────────────── */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
          {CATEGORIES.map(cat => {
            const active = category === cat.id;
            return (
              <button key={cat.id} onClick={() => setCategory(cat.id)} style={{
                padding: '8px 16px', borderRadius: 12, fontSize: 13, fontWeight: 700,
                cursor: 'pointer', border: `1px solid ${active ? cat.color : 'var(--border)'}`,
                background: active ? `${cat.color}22` : 'var(--card2)',
                color: active ? cat.color : 'var(--text2)',
                transition: 'all 0.18s',
              }}>
                {cat.icon} {cat.label}
              </button>
            );
          })}
        </div>

        {/* ── Difficulty tabs ─────────────────────────────────── */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 26, flexWrap: 'wrap' }}>
          {DIFFICULTIES.map(d => {
            const active = difficulty === d;
            const dc = d !== 'All' ? DIFF_COLORS[d] : null;
            return (
              <button key={d} onClick={() => setDifficulty(d)} style={{
                padding: '6px 14px', borderRadius: 10, fontSize: 12, fontWeight: 700,
                cursor: 'pointer',
                border: `1px solid ${active ? (dc?.border || 'var(--violet)') : 'var(--border)'}`,
                background: active ? (dc?.bg || 'rgba(139,107,255,0.12)') : 'transparent',
                color: active ? (dc?.color || 'var(--violet)') : 'var(--text3)',
                transition: 'all 0.18s',
              }}>
                {d}
              </button>
            );
          })}
        </div>

        {/* ── Stats bar ───────────────────────────────────────── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ color: 'var(--text2)', fontSize: 13 }}>
            {filtered.length === RESOURCES.length
              ? `All ${RESOURCES.length} resources`
              : `${filtered.length} of ${RESOURCES.length} resources`}
            {completed.size > 0 && <span style={{ marginLeft: 12, color: '#4ADE9A' }}>· {completed.size} completed ✓</span>}
          </div>
          {(search || category !== 'all' || difficulty !== 'All' || showFavOnly) && (
            <button onClick={() => { setSearch(''); setCategory('all'); setDifficulty('All'); setShowFavOnly(false); }} style={{
              background: 'transparent', border: '1px solid var(--border)', borderRadius: 8,
              padding: '5px 12px', fontSize: 12, color: 'var(--text3)', cursor: 'pointer',
            }}>
              Clear filters ✕
            </button>
          )}
        </div>

        {/* ── Resource cards grid ─────────────────────────────── */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text2)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>No resources found</div>
            <div style={{ fontSize: 13 }}>Try a different search term or clear your filters.</div>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
            gap: 18,
          }}>
            {filtered.map(r => (
              <ResourceCard
                key={r.id}
                resource={r}
                isFav={favorites.has(r.id)}
                isDone={completed.has(r.id)}
                onFav={() => toggleFav(r.id)}
                onDone={() => toggleDone(r.id)}
                onOpen={() => openResource(r)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Resource card component ──────────────────────────────────────
function ResourceCard({ resource: r, isFav, isDone, onFav, onDone, onOpen }) {
  const [hovered, setHovered] = useState(false);
  const diff = DIFF_COLORS[r.difficulty];

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--card)', border: `1px solid ${hovered ? r.accent + '55' : 'var(--border)'}`,
        borderRadius: 20, overflow: 'hidden', display: 'flex', flexDirection: 'column',
        transition: 'border-color 0.2s, transform 0.2s, box-shadow 0.2s',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: hovered ? `0 12px 32px ${r.accent}22` : 'none',
        opacity: isDone ? 0.75 : 1,
      }}
    >
      {/* Color accent strip */}
      <div style={{ height: 4, background: `linear-gradient(90deg, ${r.accent}, ${r.accent}88)` }} />

      <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Top row: emoji + name + action buttons */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14, flexShrink: 0,
            background: `${r.accent}18`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
          }}>
            {r.emoji}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 2 }}>{r.name}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6, ...diff }}>
                {r.difficulty}
              </span>
              <span style={{ fontSize: 11, color: 'var(--text3)' }}>· {r.time}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
            {/* Fav button */}
            <button onClick={onFav} title={isFav ? 'Remove from favorites' : 'Save to favorites'} style={{
              width: 30, height: 30, borderRadius: 8, border: `1px solid ${isFav ? '#FCD34D44' : 'var(--border)'}`,
              background: isFav ? 'rgba(252,211,77,0.15)' : 'var(--card2)',
              cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s',
            }}>
              {isFav ? '⭐' : '☆'}
            </button>
            {/* Done button */}
            <button onClick={onDone} title={isDone ? 'Mark as incomplete' : 'Mark as completed'} style={{
              width: 30, height: 30, borderRadius: 8,
              border: `1px solid ${isDone ? 'rgba(74,222,154,0.3)' : 'var(--border)'}`,
              background: isDone ? 'rgba(74,222,154,0.12)' : 'var(--card2)',
              cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s',
            }}>
              {isDone ? '✅' : '○'}
            </button>
          </div>
        </div>

        {/* Description */}
        <div style={{ color: 'var(--text2)', fontSize: 13, lineHeight: 1.6, flex: 1 }}>
          {r.desc}
        </div>

        {/* Tags */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {r.tags.map(tag => (
            <span key={tag} style={{
              padding: '3px 10px', borderRadius: 8, fontSize: 11, fontWeight: 600,
              background: `${r.accent}12`, color: r.accent, border: `1px solid ${r.accent}25`,
            }}>
              {tag}
            </span>
          ))}
        </div>

        {/* Open button */}
        <button onClick={onOpen} style={{
          ...primaryBtnStyle,
          background: hovered ? `linear-gradient(135deg, ${r.accent}, ${r.accent}CC)` : 'var(--card2)',
          color: hovered ? '#fff' : 'var(--text)',
          border: `1px solid ${hovered ? r.accent : 'var(--border)'}`,
          boxShadow: hovered ? `0 4px 14px ${r.accent}44` : 'none',
          padding: '11px 16px',
        }}>
          Start Practice →
        </button>
      </div>
    </div>
  );
}

// ── Shared style objects ─────────────────────────────────────────
const primaryBtnStyle = {
  padding: '12px 20px', borderRadius: 12, fontWeight: 700, fontSize: 13,
  cursor: 'pointer', border: 'none', width: '100%', textAlign: 'center',
  background: 'linear-gradient(135deg, #8B6BFF, #6F4FE0)',
  color: '#fff', boxShadow: '0 4px 14px rgba(139,107,255,0.4)',
  transition: 'all 0.2s',
};

const secondaryBtnStyle = {
  padding: '10px 18px', borderRadius: 12, fontWeight: 700, fontSize: 13,
  cursor: 'pointer', background: 'var(--card2)',
  border: '1px solid var(--border)', color: 'var(--text2)',
  transition: 'all 0.15s',
};