// src/pages/Leaderboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import Avatar from '../components/Avatar';
import LevelBadge from '../components/LevelBadge';

const medals = ['🥇','🥈','🥉'];
const medalColors = ['#FFC25C','#C9D2E0','#C97A4A'];

export default function Leaderboard({ setPage }) {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [filter,      setFilter]      = useState('xp');
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    userAPI.getLeaderboard()
      .then(res => setLeaderboard(res.leaderboard))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const sorted = [...leaderboard].sort((a,b) => filter==='xp' ? b.xp-a.xp : b.streak-a.streak)
    .map((s,i) => ({ ...s, displayRank: i+1 }));

  const top3 = sorted.slice(0,3);
  const myRank = sorted.findIndex(s => s._id === user?._id) + 1;

  if (loading) return (
    <div className="page" style={{ textAlign:'center', paddingTop:80 }}>
      <div style={{ fontSize:40 }}>🏆</div>
      <div style={{ color:'var(--text2)', marginTop:12 }}>Loading leaderboard...</div>
    </div>
  );

  return (
    <div className="page">
      {top3.length >= 3 && (
        <div className="grid grid-3" style={{ marginBottom:24 }}>
          {top3.map((s,i) => (
            <div key={s._id} className="card" style={{ textAlign:'center', padding:30,
              borderColor: i===0?'rgba(255,194,92,0.35)':'var(--border)',
              boxShadow:   i===0?'0 0 36px rgba(255,194,92,0.15)':'none' }}>
              <div style={{ fontSize:38, marginBottom:14 }}>{medals[i]}</div>
              <Avatar initials={s.name?.slice(0,2).toUpperCase()} size="lg" />
              <div style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:17, marginTop:14 }}>{s.name}</div>
              <div style={{ color:'var(--text2)', fontSize:13, marginBottom:14 }}>🔥 {s.streak} day streak</div>
              <LevelBadge level={s.level} size="lg" />
              <div style={{ fontFamily:'var(--font-display)', fontSize:25, fontWeight:800, color:medalColors[i], marginTop:14 }}>
                {s.xp.toLocaleString()} XP
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="card">
        <div className="section-header">
          <div className="section-title">Full Rankings</div>
          <div className="tabs" style={{ marginBottom:0 }}>
            <div className={`tab ${filter==='xp'?'active':''}`}     onClick={() => setFilter('xp')}>By XP</div>
            <div className={`tab ${filter==='streak'?'active':''}`} onClick={() => setFilter('streak')}>By Streak</div>
          </div>
        </div>

        {sorted.map(s => (
          <div key={s._id} className={`leaderboard-row ${s._id===user?._id?'me':''}`}>
            <div className={`rank ${s.displayRank===1?'gold':s.displayRank===2?'silver':s.displayRank===3?'bronze':'normal'}`}>
              {s.displayRank<=3 ? medals[s.displayRank-1] : s.displayRank}
            </div>
            <Avatar initials={s.name?.slice(0,2).toUpperCase()} size="sm" />
            <div className="lb-info">
              <div className="lb-name">{s.name}{s._id===user?._id?' (You)':''}</div>
              <div className="lb-sub">🔥 {s.streak} day streak · 📝 {s.totalPosts} posts</div>
            </div>
            <LevelBadge level={s.level} />
            <div className="lb-xp">
              {(filter==='xp' ? s.xp : s.streak).toLocaleString()}{filter==='streak'?' days':''}
            </div>
            {s._id !== user?._id && (
              <button className="btn btn-ghost btn-sm" onClick={() => setPage('messages')}>Message</button>
            )}
          </div>
        ))}

        {myRank > 1 && (
          <div className="leaderboard-row me" style={{ marginTop:10, borderStyle:'dashed' }}>
            <div style={{ flex:1, textAlign:'center', color:'var(--text2)', fontSize:13 }}>
              You are Rank #{myRank} — keep posting to climb! 🎯
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
