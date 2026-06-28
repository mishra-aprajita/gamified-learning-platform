// src/components/StreakCalendar.jsx
import React from 'react';

// Generates a deterministic pseudo-history so the grid looks alive
// even though we only track the current streak count from the backend.
function buildHistory(streakCount, totalCells = 91) {
  const cells = [];
  for (let i = 0; i < totalCells; i++) {
    const fromEnd = totalCells - i;
    if (fromEnd <= streakCount) {
      // Within active streak -> always active, intensity varies
      const intensity = (i % 5 === 0) ? 3 : (i % 3 === 0) ? 2 : 1;
      cells.push(intensity);
    } else {
      // Random sparse activity before the streak started
      const r = (i * 7919) % 10; // deterministic pseudo-random
      cells.push(r > 7 ? (r > 8 ? 2 : 1) : 0);
    }
  }
  return cells;
}

export default function StreakCalendar({ streak = 0, cells = 91 }) {
  const history = buildHistory(streak, cells);
  return (
    <div className="streak-grid">
      {history.map((level, i) => (
        <div key={i} className={`streak-cell ${level > 0 ? `lv${level}` : ''}`} />
      ))}
    </div>
  );
}
