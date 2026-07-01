import React, { useState, useMemo, useRef, useEffect } from "react";
import { Check, X, Sparkles, Trophy, ChevronRight, RotateCcw, Lightbulb } from "lucide-react";

/* ============================================================
   CSS QUEST — an XPify mini-game
   Flexbox-Froggy-style CSS learning quest starring Nova,
   the evolving crystal mascot.
   ============================================================ */

/* ---------- helpers: parsing + highlighting user CSS ---------- */

function parseCSS(code) {
  const styles = {};
  const propRegex = /([a-zA-Z-]+)\s*:\s*([^;\n]+);?/g;
  let match;
  while ((match = propRegex.exec(code)) !== null) {
    const prop = match[1].trim();
    const value = match[2].trim().replace(/;$/, "").trim();
    if (!prop || prop.length > 40) continue;
    const camel = prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    styles[camel] = value;
  }
  return styles;
}

function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function highlightCSS(code) {
  let html = escapeHtml(code);
  html = html.replace(
    /\/\*[\s\S]*?\*\//g,
    (m) => `<span class="tok-comment">${m}</span>`
  );
  html = html.replace(
    /([.#]?[a-zA-Z][\w-]*)(\s*)(\{)/g,
    (_, sel, ws, brace) =>
      `<span class="tok-selector">${sel}</span>${ws}<span class="tok-punct">${brace}</span>`
  );
  html = html.replace(
    /^(\s*)(\})/gm,
    (_, ws, brace) => `${ws}<span class="tok-punct">${brace}</span>`
  );
  html = html.replace(
    /([a-zA-Z-]+)(\s*)(:)(\s*)([^;\n<]+)(;?)/g,
    (m, prop, ws1, colon, ws2, val, semi) => {
      if (prop.includes("span")) return m;
      return `<span class="tok-prop">${prop}</span>${ws1}<span class="tok-punct">${colon}</span>${ws2}<span class="tok-value">${val}</span><span class="tok-punct">${semi}</span>`;
    }
  );
  return html;
}

function valuesMatch(a, b) {
  if (a === undefined || a === null) return false;
  const norm = (s) => s.toLowerCase().trim().replace(/\s+/g, " ");
  return norm(a) === norm(b);
}

/* ---------------------------- levels ---------------------------- */

const LEVELS = [
  {
    concept: "justify-content",
    title: "Center of the Chamber",
    story:
      "Nova drifted off-course during the jump through the nebula. Pull it back to the exact center of the crystal chamber along the main axis.",
    starter: `.quest-frame {\n  display: flex;\n  justify-content: flex-start;\n}`,
    required: { display: "flex", justifyContent: "center" },
    hint: "justify-content: center; lines items up along the middle of the main axis.",
    items: 3,
    frameStyle: { height: 220 },
  },
  {
    concept: "justify-content",
    title: "Far Wall Landing",
    story:
      "The exit portal is on the far edge of the chamber. Send Nova and its shards all the way to the end of the main axis.",
    starter: `.quest-frame {\n  display: flex;\n  justify-content: center;\n}`,
    required: { display: "flex", justifyContent: "flex-end" },
    hint: "flex-end pushes every item to the end of the main axis.",
    items: 3,
    frameStyle: { height: 220 },
  },
  {
    concept: "justify-content",
    title: "Even Ground",
    story:
      "Three shards, one chamber, zero favoritism. Spread Nova and its shards so the first and last touch the walls, evenly spaced between.",
    starter: `.quest-frame {\n  display: flex;\n  justify-content: flex-start;\n}`,
    required: { display: "flex", justifyContent: "space-between" },
    hint: "space-between puts equal gaps between items, but none at the outer edges.",
    items: 3,
    frameStyle: { height: 220 },
  },
  {
    concept: "justify-content",
    title: "Equal Breathing Room",
    story:
      "Now give every shard equal space on both sides — including the walls this time.",
    starter: `.quest-frame {\n  display: flex;\n  justify-content: space-between;\n}`,
    required: { display: "flex", justifyContent: "space-around" },
    hint: "space-around gives each item equal space on both of its sides.",
    items: 3,
    frameStyle: { height: 220 },
  },
  {
    concept: "align-items",
    title: "Vertical Anchor",
    story:
      "The chamber is tall today. Float Nova and its shards to the vertical middle — the cross axis this time, not the main one.",
    starter: `.quest-frame {\n  display: flex;\n  align-items: flex-start;\n}`,
    required: { display: "flex", alignItems: "center" },
    hint: "align-items controls the cross axis. center balances items top-to-bottom in a row.",
    items: 3,
    frameStyle: { height: 260 },
  },
  {
    concept: "align-items",
    title: "Touch the Floor",
    story:
      "Gravity crystals are acting up. Ground every shard at the bottom of the chamber.",
    starter: `.quest-frame {\n  display: flex;\n  align-items: center;\n}`,
    required: { display: "flex", alignItems: "flex-end" },
    hint: "flex-end on align-items sends items to the end of the cross axis — the bottom, in a row layout.",
    items: 3,
    frameStyle: { height: 260 },
  },
  {
    concept: "flex-direction",
    title: "Rotate the Flow",
    story:
      "Nova wants to climb, not drift sideways. Rotate the main axis so shards stack from top to bottom.",
    starter: `.quest-frame {\n  display: flex;\n  flex-direction: row;\n}`,
    required: { display: "flex", flexDirection: "column" },
    hint: "flex-direction: column; turns the main axis vertical.",
    items: 3,
    frameStyle: { height: 300 },
  },
  {
    concept: "flex-direction",
    title: "Reverse the Convoy",
    story:
      "Same chamber, opposite order — flip the convoy without touching a single item's markup.",
    starter: `.quest-frame {\n  display: flex;\n  flex-direction: row;\n}`,
    required: { display: "flex", flexDirection: "row-reverse" },
    hint: "row-reverse keeps the row layout but reverses the visual order of items.",
    items: 3,
    frameStyle: { height: 220 },
  },
  {
    concept: "flex-wrap",
    title: "Too Many Shards",
    story:
      "Six shards just teleported into a narrow chamber. They're overflowing the wall — let them wrap onto a new line instead.",
    starter: `.quest-frame {\n  display: flex;\n  flex-wrap: nowrap;\n}`,
    required: { display: "flex", flexWrap: "wrap" },
    hint: "flex-wrap: wrap; lets overflowing items drop to a new line instead of squeezing or spilling out.",
    items: 6,
    frameStyle: { height: 260, maxWidth: 260 },
  },
  {
    concept: "grid basics",
    title: "The Crystal Grid",
    story:
      "Final trial. Switch the chamber to a grid, and center every shard perfectly within its own cell — both directions at once.",
    starter: `.quest-frame {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n}`,
    required: { display: "grid", placeItems: "center" },
    hint: "place-items: center; is shorthand for centering items on both the row and column axis of a grid cell.",
    items: 4,
    frameStyle: { height: 300 },
    isGrid: true,
  },
];

const TOTAL_XP = LEVELS.length * 20;

/* ------------------------ mascot components ------------------------ */

function NovaCrystal({ mood = "idle", size = 64, shakeKey = 0 }) {
  const anim =
    mood === "happy" ? "cq-celebrate" : mood === "sad" ? "cq-shake" : "cq-float";
  return (
    <div
      key={mood === "sad" ? `shake-${shakeKey}` : "steady"}
      className={`cq-nova-wrap ${anim}`}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 100 100" width={size} height={size} className="cq-nova-glow">
        <defs>
          <linearGradient id="novaBody" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#c9a6ff" />
            <stop offset="55%" stopColor="#9b5cf6" />
            <stop offset="100%" stopColor="#5b21b6" />
          </linearGradient>
          <linearGradient id="novaFacet" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ecdcff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#ecdcff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon
          points="50,4 82,32 70,90 30,90 18,32"
          fill="url(#novaBody)"
          stroke="#e9d5ff"
          strokeWidth="1.5"
        />
        <polygon points="50,4 82,32 50,46" fill="url(#novaFacet)" />
        <polygon points="50,4 18,32 50,46" fill="#ffffff" opacity="0.12" />
        <polygon points="18,32 30,90 50,46" fill="#000000" opacity="0.18" />
        <polygon points="82,32 70,90 50,46" fill="#000000" opacity="0.1" />
        {mood === "sad" ? (
          <>
            <path d="M36 54 Q40 50 44 54" stroke="#2a1454" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M56 54 Q60 50 64 54" stroke="#2a1454" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M40 68 Q50 62 60 68" stroke="#2a1454" strokeWidth="3" fill="none" strokeLinecap="round" />
          </>
        ) : mood === "happy" ? (
          <>
            <path d="M35 53 Q39 48 43 53" stroke="#2a1454" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M57 53 Q61 48 65 53" stroke="#2a1454" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M39 64 Q50 76 61 64" stroke="#2a1454" strokeWidth="3.2" fill="none" strokeLinecap="round" />
          </>
        ) : (
          <>
            <circle cx="39" cy="53" r="3.4" fill="#2a1454" />
            <circle cx="61" cy="53" r="3.4" fill="#2a1454" />
            <path d="M41 66 Q50 71 59 66" stroke="#2a1454" strokeWidth="3" fill="none" strokeLinecap="round" />
          </>
        )}
      </svg>
      {mood === "happy" && (
        <>
          <span className="cq-spark cq-spark-1">✦</span>
          <span className="cq-spark cq-spark-2">✧</span>
          <span className="cq-spark cq-spark-3">✦</span>
        </>
      )}
    </div>
  );
}

function ShardCrystal({ size = 30, delay = 0 }) {
  return (
    <div
      className="cq-shard-wrap cq-float"
      style={{ width: size, height: size, animationDelay: `${delay}s` }}
    >
      <svg viewBox="0 0 60 60" width={size} height={size}>
        <defs>
          <linearGradient id={`shard-${delay}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#a5f3fc" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
        <polygon
          points="30,2 50,20 42,56 18,56 10,20"
          fill={`url(#shard-${delay})`}
          stroke="#cffafe"
          strokeWidth="1.2"
          opacity="0.92"
        />
      </svg>
    </div>
  );
}

/* --------------------------- main component --------------------------- */

export default function CSSQuest() {
  const [levelIndex, setLevelIndex] = useState(0);
  const [codeByLevel, setCodeByLevel] = useState(() =>
    LEVELS.map((l) => l.starter)
  );
  const [solved, setSolved] = useState(() => LEVELS.map(() => false));
  const [status, setStatus] = useState("idle"); // idle | correct | wrong
  const [showHint, setShowHint] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);
  const [finished, setFinished] = useState(false);

  const textareaRef = useRef(null);
  const preRef = useRef(null);

  const level = LEVELS[levelIndex];
  const code = codeByLevel[levelIndex];
  const xp = solved.filter(Boolean).length * 20;

  const parsed = useMemo(() => parseCSS(code), [code]);
  const highlighted = useMemo(() => highlightCSS(code) + "\n", [code]);

  useEffect(() => {
    setStatus(solved[levelIndex] ? "correct" : "idle");
    setShowHint(false);
  }, [levelIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  function updateCode(value) {
    setCodeByLevel((prev) => {
      const next = [...prev];
      next[levelIndex] = value;
      return next;
    });
    if (status !== "idle") setStatus("idle");
  }

  function checkAnswer() {
    const requiredKeys = Object.keys(level.required);
    const ok = requiredKeys.every((key) =>
      valuesMatch(parsed[key], level.required[key])
    );
    if (ok) {
      setStatus("correct");
      setShowHint(false);
      if (!solved[levelIndex]) {
        setSolved((prev) => {
          const next = [...prev];
          next[levelIndex] = true;
          return next;
        });
      }
    } else {
      setStatus("wrong");
      setShowHint(true);
      setShakeKey((k) => k + 1);
    }
  }

  function goNext() {
    if (levelIndex === LEVELS.length - 1) {
      setFinished(true);
      return;
    }
    setLevelIndex((i) => i + 1);
  }

  function resetLevel() {
    updateCode(level.starter);
    setStatus("idle");
    setShowHint(false);
  }

  function syncScroll() {
    if (preRef.current && textareaRef.current) {
      preRef.current.scrollTop = textareaRef.current.scrollTop;
      preRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  }

  const containerStyle = {
    ...level.frameStyle,
    display: "flex",
    ...parsed,
    ...(level.isGrid
      ? { gridTemplateColumns: parsed.gridTemplateColumns || "repeat(3, 1fr)" }
      : {}),
  };

  const mood = status === "correct" ? "happy" : status === "wrong" ? "sad" : "idle";

  return (
    <div className="cq-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600&family=Fira+Code:wght@400;500&display=swap');

        .cq-root {
          --bg-void: #0a0716;
          --bg-panel: #140f28;
          --bg-surface: #1b1438;
          --border-glow: #3d2a6b;
          --accent-1: #a855f7;
          --accent-2: #22d3ee;
          --accent-gold: #fbbf24;
          --text-main: #f1ecff;
          --text-muted: #9d8fc7;
          --success: #34d399;
          --danger: #fb7185;
          font-family: 'Inter', system-ui, sans-serif;
          background: radial-gradient(ellipse at top, #1a1140 0%, #0a0716 60%);
          color: var(--text-main);
          min-height: 100%;
          padding: 20px;
          box-sizing: border-box;
        }
        .cq-root * { box-sizing: border-box; }

        .cq-header {
          max-width: 1180px;
          margin: 0 auto 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }
        .cq-title-block h1 {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 26px;
          margin: 0;
          letter-spacing: 0.3px;
          background: linear-gradient(90deg, #e9d5ff, var(--accent-2));
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .cq-title-block p {
          margin: 4px 0 0;
          font-size: 13px;
          color: var(--text-muted);
        }
        .cq-xp-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          background: var(--bg-surface);
          border: 1px solid var(--border-glow);
          padding: 8px 14px;
          border-radius: 999px;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: 14px;
          color: var(--accent-gold);
        }

        .cq-progress {
          max-width: 1180px;
          margin: 0 auto 22px;
          display: flex;
          gap: 6px;
        }
        .cq-progress-seg {
          flex: 1;
          height: 8px;
          border-radius: 4px;
          background: var(--bg-surface);
          border: 1px solid var(--border-glow);
          overflow: hidden;
          position: relative;
        }
        .cq-progress-seg.filled {
          background: linear-gradient(90deg, var(--accent-1), var(--accent-2));
          border-color: transparent;
        }
        .cq-progress-seg.current::after {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(255,255,255,0.35);
          animation: cq-pulse 1.4s ease-in-out infinite;
        }

        .cq-grid {
          max-width: 1180px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          gap: 20px;
        }
        @media (max-width: 880px) {
          .cq-grid { grid-template-columns: 1fr; }
        }

        .cq-panel {
          background: linear-gradient(160deg, var(--bg-panel), var(--bg-surface));
          border: 1px solid var(--border-glow);
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 0 0 1px rgba(168,85,247,0.05), 0 20px 40px -20px rgba(0,0,0,0.6);
        }

        .cq-eyebrow {
          font-size: 11px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: var(--accent-2);
          font-weight: 600;
          margin-bottom: 6px;
        }
        .cq-level-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 20px;
          margin: 0 0 10px;
        }
        .cq-story {
          font-size: 14px;
          line-height: 1.55;
          color: #d9cfff;
          margin: 0 0 16px;
        }

        .cq-editor-wrap {
          position: relative;
          border-radius: 10px;
          border: 1px solid var(--border-glow);
          background: #0e0a20;
          overflow: hidden;
        }
        .cq-editor-label {
          font-size: 11px;
          color: var(--text-muted);
          padding: 8px 12px;
          border-bottom: 1px solid var(--border-glow);
          background: #100b24;
          font-family: 'Fira Code', monospace;
        }
        .cq-editor-stack {
          position: relative;
          height: 160px;
        }
        .cq-pre, .cq-textarea {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          margin: 0;
          padding: 14px 16px;
          font-family: 'Fira Code', monospace;
          font-size: 13.5px;
          line-height: 1.6;
          white-space: pre;
          overflow: auto;
          tab-size: 2;
        }
        .cq-pre {
          color: var(--text-main);
          pointer-events: none;
        }
        .cq-textarea {
          background: transparent;
          color: transparent;
          caret-color: #fbbf24;
          border: none;
          resize: none;
          outline: none;
          width: 100%;
        }
        .tok-selector { color: #67e8f9; }
        .tok-prop { color: #c4b5fd; }
        .tok-value { color: #fbbf24; }
        .tok-punct { color: #7c6ea8; }
        .tok-comment { color: #574a80; font-style: italic; }

        .cq-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 14px;
          flex-wrap: wrap;
        }
        .cq-btn {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
          font-size: 13.5px;
          border-radius: 9px;
          padding: 10px 18px;
          border: 1px solid transparent;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .cq-btn:hover { transform: translateY(-1px); }
        .cq-btn:active { transform: translateY(0); }
        .cq-btn-primary {
          background: linear-gradient(90deg, var(--accent-1), #7c3aed);
          color: white;
          box-shadow: 0 8px 20px -8px rgba(168,85,247,0.7);
        }
        .cq-btn-next {
          background: linear-gradient(90deg, var(--success), #10b981);
          color: #06251a;
          box-shadow: 0 8px 20px -8px rgba(52,211,153,0.6);
        }
        .cq-btn-ghost {
          background: transparent;
          border: 1px solid var(--border-glow);
          color: var(--text-muted);
        }

        .cq-feedback {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          margin-top: 14px;
          padding: 10px 12px;
          border-radius: 9px;
          font-size: 13px;
          line-height: 1.5;
        }
        .cq-feedback.correct {
          background: rgba(52,211,153,0.1);
          border: 1px solid rgba(52,211,153,0.35);
          color: #a7f3d0;
        }
        .cq-feedback.wrong {
          background: rgba(251,113,133,0.1);
          border: 1px solid rgba(251,113,133,0.35);
          color: #fecdd3;
        }

        .cq-playground {
          display: flex;
          flex-direction: column;
        }
        .cq-stage-label {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        .cq-stage-label span:first-child {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 14px;
          color: var(--text-muted);
        }
        .cq-concept-chip {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          padding: 4px 10px;
          border-radius: 999px;
          background: rgba(168,85,247,0.15);
          border: 1px solid rgba(168,85,247,0.4);
          color: #d8b4fe;
        }

        .cq-stage {
          position: relative;
          border-radius: 14px;
          border: 1px dashed var(--border-glow);
          background:
            radial-gradient(circle at 20% 20%, rgba(168,85,247,0.12), transparent 40%),
            radial-gradient(circle at 80% 70%, rgba(34,211,238,0.1), transparent 45%),
            #0d0920;
          padding: 16px;
          overflow: hidden;
        }
        .cq-star {
          position: absolute;
          width: 3px; height: 3px;
          border-radius: 50%;
          background: white;
          opacity: 0.5;
          animation: cq-twinkle 2.6s ease-in-out infinite;
        }

        .cq-frame {
          position: relative;
          border-radius: 10px;
          border: 1px solid rgba(168,85,247,0.25);
          background: rgba(255,255,255,0.02);
          align-items: stretch;
          margin: 0 auto;
          transition: all 0.35s cubic-bezier(.4,0,.2,1);
          padding: 10px;
          width: 100%;
        }

        .cq-nova-wrap, .cq-shard-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .cq-nova-glow {
          filter: drop-shadow(0 0 10px rgba(168,85,247,0.7));
        }

        @keyframes cq-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
        .cq-float { animation: cq-float 2.8s ease-in-out infinite; }

        @keyframes cq-shake {
          0%, 100% { transform: translateX(0) rotate(0); }
          20% { transform: translateX(-6px) rotate(-6deg); }
          40% { transform: translateX(5px) rotate(5deg); }
          60% { transform: translateX(-4px) rotate(-4deg); }
          80% { transform: translateX(3px) rotate(3deg); }
        }
        .cq-shake { animation: cq-shake 0.5s ease-in-out; }

        @keyframes cq-celebrate {
          0% { transform: scale(1) rotate(0deg); }
          30% { transform: scale(1.18) rotate(-8deg); }
          60% { transform: scale(1.05) rotate(6deg); }
          100% { transform: scale(1.1) rotate(0deg); }
        }
        .cq-celebrate { animation: cq-celebrate 0.6s ease-out; }

        @keyframes cq-pulse {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.55; }
        }
        @keyframes cq-twinkle {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.8; }
        }

        .cq-spark {
          position: absolute;
          color: var(--accent-gold);
          font-size: 14px;
          animation: cq-sparkfly 0.7s ease-out forwards;
        }
        .cq-spark-1 { top: -6px; left: -6px; }
        .cq-spark-2 { top: -10px; right: -4px; animation-delay: 0.08s; }
        .cq-spark-3 { bottom: -6px; left: 40%; animation-delay: 0.16s; }
        @keyframes cq-sparkfly {
          0% { opacity: 1; transform: translateY(0) scale(0.6); }
          100% { opacity: 0; transform: translateY(-18px) scale(1.3); }
        }

        .cq-complete {
          max-width: 620px;
          margin: 60px auto;
          text-align: center;
          background: linear-gradient(160deg, var(--bg-panel), var(--bg-surface));
          border: 1px solid var(--border-glow);
          border-radius: 20px;
          padding: 48px 32px;
        }
        .cq-complete h2 {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 28px;
          margin: 18px 0 8px;
          background: linear-gradient(90deg, #e9d5ff, var(--accent-2));
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .cq-complete p {
          color: var(--text-muted);
          font-size: 14px;
          margin: 0 0 22px;
        }
      `}</style>

      <header className="cq-header">
        <div className="cq-title-block">
          <h1>CSS Quest</h1>
          <p>Guide Nova through the crystal chambers, one CSS rule at a time.</p>
        </div>
        <div className="cq-xp-badge">
          <Sparkles size={16} />
          {xp} / {TOTAL_XP} XP
        </div>
      </header>

      <div className="cq-progress">
        {LEVELS.map((_, i) => (
          <div
            key={i}
            className={`cq-progress-seg ${solved[i] ? "filled" : ""} ${
              i === levelIndex ? "current" : ""
            }`}
          />
        ))}
      </div>

      {!finished ? (
        <div className="cq-grid">
          {/* LEFT: challenge + editor */}
          <div className="cq-panel">
            <div className="cq-eyebrow">
              Level {levelIndex + 1} of {LEVELS.length} — {level.concept}
            </div>
            <h2 className="cq-level-title">{level.title}</h2>
            <p className="cq-story">{level.story}</p>

            <div className="cq-editor-wrap">
              <div className="cq-editor-label">style.css</div>
              <div className="cq-editor-stack">
                <pre
                  ref={preRef}
                  className="cq-pre"
                  dangerouslySetInnerHTML={{ __html: highlighted }}
                />
                <textarea
                  ref={textareaRef}
                  className="cq-textarea"
                  value={code}
                  onChange={(e) => updateCode(e.target.value)}
                  onScroll={syncScroll}
                  spellCheck={false}
                  autoCapitalize="off"
                  autoCorrect="off"
                />
              </div>
            </div>

            <div className="cq-actions">
              <button className="cq-btn cq-btn-primary" onClick={checkAnswer}>
                <Check size={15} /> Check answer
              </button>
              <button className="cq-btn cq-btn-ghost" onClick={resetLevel}>
                <RotateCcw size={14} /> Reset
              </button>
              {status === "correct" && (
                <button className="cq-btn cq-btn-next" onClick={goNext}>
                  {levelIndex === LEVELS.length - 1 ? "Finish quest" : "Next level"}
                  <ChevronRight size={15} />
                </button>
              )}
            </div>

            {status === "correct" && (
              <div className="cq-feedback correct">
                <Check size={16} style={{ marginTop: 1 }} />
                <span>
                  Nova locks into place. +20 XP{solved[levelIndex] ? "" : " earned"}!
                </span>
              </div>
            )}
            {status === "wrong" && (
              <div className="cq-feedback wrong">
                <X size={16} style={{ marginTop: 1 }} />
                <span>
                  Not quite — Nova wobbled off course.
                  {showHint && (
                    <>
                      <br />
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 4 }}>
                        <Lightbulb size={13} /> {level.hint}
                      </span>
                    </>
                  )}
                </span>
              </div>
            )}
          </div>

          {/* RIGHT: playground */}
          <div className="cq-panel cq-playground">
            <div className="cq-stage-label">
              <span>Crystal chamber</span>
              <span className="cq-concept-chip">{level.concept}</span>
            </div>
            <div className="cq-stage">
              {[...Array(10)].map((_, i) => (
                <span
                  key={i}
                  className="cq-star"
                  style={{
                    top: `${(i * 37) % 100}%`,
                    left: `${(i * 53) % 100}%`,
                    animationDelay: `${i * 0.3}s`,
                  }}
                />
              ))}
              <div className="cq-frame" style={containerStyle}>
                <NovaCrystal mood={mood} size={46} shakeKey={shakeKey} />
                {[...Array(level.items - 1)].map((_, i) => (
                  <ShardCrystal key={i} size={26} delay={i * 0.4} />
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="cq-complete">
          <Trophy size={48} color="#fbbf24" />
          <h2>Quest complete!</h2>
          <p>
            Nova made it through every crystal chamber. Final score: {xp} / {TOTAL_XP} XP.
          </p>
          <button
            className="cq-btn cq-btn-primary"
            onClick={() => {
              setFinished(false);
              setLevelIndex(0);
            }}
          >
            <RotateCcw size={15} /> Replay the quest
          </button>
        </div>
      )}
    </div>
  );
}