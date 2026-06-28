// src/pages/Community.jsx  –  real API data
import React, { useState, useEffect } from 'react';
import { userAPI } from '../services/api';
import StudentCard from '../components/StudentCard';

const LEVELS = ['All','Explorer','Builder','Hacker','Architect'];

export default function Community({ setPage }) {
  const [students,     setStudents]     = useState([]);
  const [search,       setSearch]       = useState('');
  const [levelFilter,  setLevelFilter]  = useState('All');
  const [loading,      setLoading]      = useState(true);
  const [searchTimer,  setSearchTimer]  = useState(null);

  const loadStudents = async (level, query) => {
    try {
      setLoading(true);
      const params = {};
      if (level && level !== 'All') params.level = level;
      if (query) params.search = query;
      const res = await userAPI.getAll(params);
      setStudents(res.users);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadStudents('All', ''); }, []);

  const handleSearch = (val) => {
    setSearch(val);
    clearTimeout(searchTimer);
    setSearchTimer(setTimeout(() => loadStudents(levelFilter, val), 400));
  };

  const handleLevel = (level) => {
    setLevelFilter(level);
    loadStudents(level, search);
  };

  const normalizeStudent = (u) => ({
    ...u,
    initials: (u.name||'UN').slice(0,2).toUpperCase(),
    followers: u.followers || 0,
    isMentor: u.role === 'mentor',
  });

  return (
    <div className="page">
      {/* Filters */}
      <div style={{ display:'flex', gap:12, marginBottom:24, flexWrap:'wrap', alignItems:'center' }}>
        <input
          style={{ flex:1, minWidth:200, background:'var(--card)', border:'1px solid var(--border)',
            borderRadius:'var(--radius-sm)', padding:'10px 16px', color:'var(--text)',
            fontFamily:'var(--font-body)', fontSize:14, outline:'none' }}
          placeholder="🔍 Search by name or skill..."
          value={search}
          onChange={e => handleSearch(e.target.value)}
        />
        <div className="tabs" style={{ marginBottom:0 }}>
          {LEVELS.map(l => (
            <div key={l} className={`tab ${levelFilter===l?'active':''}`} onClick={() => handleLevel(l)}>{l}</div>
          ))}
        </div>
      </div>

      {/* Stats strip */}
      <div className="card" style={{ marginBottom:24, padding:'16px 24px', display:'flex', gap:32, flexWrap:'wrap' }}>
        {[
          [students.length, 'Students Found'],
          [students.filter(s=>s.role==='mentor').length, 'Mentors'],
          [students.filter(s=>['Hacker','Architect'].includes(s.level)).length, 'Advanced'],
          [students.filter(s=>s.streak>7).length, 'Active Streaks'],
        ].map(([v,l]) => (
          <div key={l}>
            <div style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:22 }}>{v}</div>
            <div style={{ color:'var(--text2)', fontSize:13 }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ textAlign:'center', padding:60, color:'var(--text2)' }}>⏳ Loading students...</div>
      ) : students.length === 0 ? (
        <div style={{ textAlign:'center', padding:60, color:'var(--text2)' }}>
          <div style={{ fontSize:48, opacity:0.3 }}>🔍</div>
          <div style={{ fontFamily:'var(--font-display)', fontSize:18, color:'var(--text)', marginBottom:8, marginTop:16 }}>No students found</div>
          <div>Try a different name, skill, or level</div>
        </div>
      ) : (
        <div className="grid grid-auto">
          {students.map((s,i) => (
            <StudentCard key={s._id||i} student={normalizeStudent(s)} onMessage={() => setPage('messages')} />
          ))}
        </div>
      )}
    </div>
  );
}
