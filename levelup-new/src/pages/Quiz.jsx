// src/pages/Quiz.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { quizAPI } from '../services/api';
import Mascot from '../components/Mascot';

const CATEGORY_META = {
  dsa:     { tagClass: 'dsa',     label: 'DSA'    },
  web:     { tagClass: 'web',     label: 'Web'    },
  ml:      { tagClass: 'ml',      label: 'ML'     },
  sys:     { tagClass: 'sys',     label: 'System' },
  general: { tagClass: 'web',     label: 'General'},
};

export default function Quiz() {
  const { user, updateUser } = useAuth();
  const [questions,   setQuestions]   = useState([]);
  const [completed,   setCompleted]   = useState(false);
  const [score,       setScore]       = useState(0);
  const [total,       setTotal]       = useState(5);
  const [loading,     setLoading]     = useState(true);
  const [submitting,  setSubmitting]  = useState(false);
  const [currentIdx,  setCurrentIdx]  = useState(0);
  const [selections,  setSelections]  = useState({}); // { questionId: selectedIndex }
  const [results,     setResults]     = useState(null); // from submit response
  const [error,       setError]       = useState('');

  useEffect(() => {
    quizAPI.getToday()
      .then(res => {
        setQuestions(res.questions);
        setCompleted(res.completed);
        setScore(res.score);
        setTotal(res.total);
        if (res.completed && res.answers) {
          const sel = {};
          res.answers.forEach(a => { sel[a.question] = a.selectedIndex; });
          setSelections(sel);
        }
      })
      .catch(e => setError(e.message || 'No quiz available'))
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = (qId, idx) => {
    if (completed) return;
    setSelections(prev => ({ ...prev, [qId]: idx }));
  };

  const handleSubmit = async () => {
    const answers = questions.map(q => ({ questionId: q._id, selectedIndex: selections[q._id] ?? -1 }));
    setSubmitting(true);
    try {
      const res = await quizAPI.submit(answers);
      setResults(res);
      setCompleted(true);
      setScore(res.score);
      const totalXP = res.xpEarned + (res.streakBonus || 0);
      updateUser({ xp: (user.xp || 0) + totalXP, quizStreak: res.quizStreak });
    } catch (e) {
      setError(e.message || 'Could not submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  const allAnswered = questions.length > 0 && questions.every(q => selections[q._id] !== undefined);
  const currentQuestion = questions[currentIdx];

  if (loading) return (
    <div className="page" style={{ textAlign: 'center', paddingTop: 80 }}>
      <Mascot size={80} mood="sleepy" level={user?.level} />
      <div style={{ color: 'var(--text2)', marginTop: 16 }}>Nova is preparing today's quiz...</div>
    </div>
  );

  if (error && questions.length === 0) return (
    <div className="page" style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center', paddingTop: 60 }}>
      <div style={{ fontSize: 44, opacity: 0.3, marginBottom: 12 }}>❓</div>
      <div style={{ fontWeight: 700, marginBottom: 6 }}>No quiz available yet</div>
      <div style={{ color: 'var(--text2)', fontSize: 13 }}>{error}</div>
    </div>
  );

  // ─────────────────────────────────────────
  // RESULTS VIEW (after submission or if already completed today)
  // ─────────────────────────────────────────
  if (completed) {
    const pct = Math.round((score / total) * 100);
    const perfect = score === total;
    return (
      <div className="page" style={{ maxWidth: 640, margin: '0 auto' }}>
        <div className="level-hero" style={{ textAlign: 'center', marginBottom: 22 }}>
          <Mascot
            size={90}
            level={user?.level}
            mood={perfect ? 'celebrate' : score >= total * 0.6 ? 'excited' : 'sad'}
            reactFor={perfect ? 3000 : 0}
          />
          <div style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 700, letterSpacing: '0.05em', margin: '6px 0 4px' }}>
            NOVA
          </div>
          <div className="level-hero-name" style={{ marginTop: 8 }}>
            {perfect ? '🏆 Perfect Score!' : score >= total * 0.6 ? '🎉 Nice work!' : 'Keep practicing!'}
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 44, fontWeight: 800, color: 'var(--violet)', margin: '10px 0' }}>
            {score}/{total}
          </div>
          <div className="progress-bar" style={{ maxWidth: 300, margin: '0 auto 14px' }}>
            <div className="progress-fill" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, var(--violet), var(--cyan))' }} />
          </div>
          {results && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 16 }}>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: 'var(--green)' }}>+{results.xpEarned}</div>
                <div style={{ fontSize: 11, color: 'var(--text2)' }}>XP Earned</div>
              </div>
              {results.streakBonus > 0 && (
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: 'var(--gold)' }}>+{results.streakBonus}</div>
                  <div style={{ fontSize: 11, color: 'var(--text2)' }}>Streak Bonus</div>
                </div>
              )}
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: 'var(--orange)' }}>🔥 {results.quizStreak || user.quizStreak || 0}</div>
                <div style={{ fontSize: 11, color: 'var(--text2)' }}>Quiz Streak</div>
              </div>
            </div>
          )}
        </div>

        {/* Answer review */}
        <div className="section-title" style={{ marginBottom: 14 }}>Review Your Answers</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {(results?.results || questions).map((q, i) => {
            const userAnswer = results ? results.results[i].userAnswer : selections[q._id];
            const correctIdx = q.correctIndex;
            const isCorrect = userAnswer === correctIdx;
            return (
              <div key={q._id} className="card" style={{ borderColor: isCorrect ? 'rgba(74,222,154,0.35)' : 'rgba(255,138,92,0.35)' }}>
                <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                  <div style={{ fontSize: 18 }}>{isCorrect ? '✅' : '❌'}</div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{q.questionText}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
                  {q.options.map((opt, idx) => {
                    const isUserPick = idx === userAnswer;
                    const isRight = idx === correctIdx;
                    return (
                      <div key={idx} style={{
                        padding: '8px 12px', borderRadius: 10, fontSize: 12.5,
                        background: isRight ? 'rgba(74,222,154,0.1)' : isUserPick ? 'rgba(255,138,92,0.1)' : 'var(--card2)',
                        border: `1px solid ${isRight ? 'rgba(74,222,154,0.4)' : isUserPick ? 'rgba(255,138,92,0.4)' : 'var(--border)'}`,
                        color: isRight ? 'var(--green)' : isUserPick ? 'var(--orange)' : 'var(--text2)',
                      }}>
                        {isRight ? '✓ ' : isUserPick ? '✗ ' : ''}{opt}
                      </div>
                    );
                  })}
                </div>
                {q.explanation && (
                  <div style={{ fontSize: 12, color: 'var(--text3)', fontStyle: 'italic' }}>💡 {q.explanation}</div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ textAlign: 'center', marginTop: 22, color: 'var(--text2)', fontSize: 13 }}>
          ⏰ Come back tomorrow for a new set of questions!
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────
  // QUIZ-TAKING VIEW
  // ─────────────────────────────────────────
  return (
    <div className="page" style={{ maxWidth: 640, margin: '0 auto' }}>

      {/* Progress header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <div>
          <div className="section-title" style={{ fontSize: 20, marginBottom: 2 }}>Daily Quiz Challenge</div>
          <div style={{ color: 'var(--text2)', fontSize: 12.5 }}>Question {currentIdx + 1} of {questions.length}</div>
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: 'var(--orange)' }}>
          🔥 {user?.quizStreak || 0}
        </div>
      </div>

      <div className="progress-bar" style={{ marginBottom: 22 }}>
        <div className="progress-fill" style={{
          width: `${((currentIdx + 1) / questions.length) * 100}%`,
          background: 'linear-gradient(90deg, var(--violet), var(--cyan))',
        }} />
      </div>

      {error && (
        <div style={{ background: 'rgba(255,138,92,0.1)', border: '1px solid rgba(255,138,92,0.3)', borderRadius: 14, padding: '12px 16px', color: 'var(--orange)', fontSize: 13, marginBottom: 16 }}>
          ⚠️ {error}
        </div>
      )}

      {/* Current question card */}
      {currentQuestion && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            <span className={`tag ${(CATEGORY_META[currentQuestion.category] || CATEGORY_META.general).tagClass}`}>
              {(CATEGORY_META[currentQuestion.category] || CATEGORY_META.general).label}
            </span>
            <span style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', alignSelf: 'center' }}>
              {currentQuestion.difficulty}
            </span>
          </div>
          <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 20, lineHeight: 1.5 }}>
            {currentQuestion.questionText}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {currentQuestion.options.map((opt, idx) => {
              const selected = selections[currentQuestion._id] === idx;
              return (
                <div
                  key={idx}
                  onClick={() => handleSelect(currentQuestion._id, idx)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '14px 16px', borderRadius: 14, cursor: 'pointer',
                    background: selected ? 'rgba(139,107,255,0.12)' : 'var(--card2)',
                    border: `1.5px solid ${selected ? 'var(--violet)' : 'var(--border)'}`,
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: `2px solid ${selected ? 'var(--violet)' : 'var(--border2)'}`,
                    background: selected ? 'var(--violet)' : 'transparent',
                  }}>
                    {selected && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'white' }} />}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: selected ? 700 : 500 }}>{opt}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between' }}>
        <button className="btn btn-ghost" onClick={() => setCurrentIdx(i => Math.max(0, i - 1))} disabled={currentIdx === 0}>
          ← Previous
        </button>

        {currentIdx < questions.length - 1 ? (
          <button className="btn btn-primary" onClick={() => setCurrentIdx(i => Math.min(questions.length - 1, i + 1))}
            disabled={selections[currentQuestion?._id] === undefined}>
            Next →
          </button>
        ) : (
          <button className="btn btn-primary" onClick={handleSubmit} disabled={!allAnswered || submitting}>
            {submitting ? '⏳ Submitting...' : '✓ Submit Quiz'}
          </button>
        )}
      </div>

      {/* Question dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 22 }}>
        {questions.map((q, i) => (
          <div
            key={q._id}
            onClick={() => setCurrentIdx(i)}
            style={{
              width: 10, height: 10, borderRadius: '50%', cursor: 'pointer',
              background: i === currentIdx ? 'var(--violet)' : selections[q._id] !== undefined ? 'var(--green)' : 'var(--border2)',
              transition: 'all 0.2s',
            }}
          />
        ))}
      </div>
    </div>
  );
}
