import React from 'react';
import Avatar from './Avatar';
import LevelBadge from './LevelBadge';

export default function StudentCard({ student, onMessage }) {
  return (
    <div className="student-card">
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 14 }}>
        <Avatar initials={student.initials} size="md" />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>{student.name}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <LevelBadge level={student.level} />
            {student.isMentor && <span className="badge-pill mentor">🎓 Mentor</span>}
          </div>
        </div>
      </div>

      <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5, marginBottom: 14 }}>
        {student.bio}
      </div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
        {student.skills.map(sk => (
          <span key={sk} className="tag web" style={{ fontSize: 11 }}>{sk}</span>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
        {[
          ['📝', student.posts, 'Posts'],
          ['👥', student.followers, 'Followers'],
          ['🔥', student.streak, 'Streak'],
        ].map(([icon, val, lbl]) => (
          <div key={lbl} style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 17 }}>
              {icon} {val}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{lbl}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={onMessage}>
          💬 Message
        </button>
        <button className="btn btn-ghost btn-sm">Follow</button>
      </div>
    </div>
  );
}
