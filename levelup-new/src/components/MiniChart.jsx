import React from 'react';

export default function MiniChart({ data, labels }) {
  const max = Math.max(...data);
  return (
    <div>
      <div className="mini-chart">
        {data.map((v, i) => (
          <div
            key={i}
            className="bar"
            data-val={`+${v} XP`}
            style={{
              height: `${(v / max) * 100}%`,
              background:
                i === data.length - 1
                  ? 'linear-gradient(180deg, var(--violet), var(--cyan))'
                  : 'linear-gradient(180deg, var(--border2), var(--card2))',
            }}
          />
        ))}
      </div>
      <div style={{ display: 'flex', gap: 7, marginTop: 8 }}>
        {labels.map((l, i) => (
          <div
            key={i}
            style={{
              flex: 1, textAlign: 'center', fontSize: 10, fontWeight: 700,
              color: i === labels.length - 1 ? 'var(--violet)' : 'var(--text3)',
            }}
          >
            {l}
          </div>
        ))}
      </div>
    </div>
  );
}
