// src/components/StreakCalendar.jsx
import React from 'react';

// Only marks the real active-streak days as green.
// No random/simulated activity before the streak.
function buildHistory(streakCount, totalCells = 91) {
  const cells = [];
  for (let i = 0; i < totalCells; i++) {
    const fromEnd = totalCells - i;
    if (fromEnd <= streakCount) {
      // Within active streak -> always active, intensity varies
      const intensity = (i % 5 === 0) ? 3 : (i % 3 === 0) ? 2 : 1;
      cells.push(intensity);
    } else {
      // No streak here -> no fake activity
      cells.push(0);
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