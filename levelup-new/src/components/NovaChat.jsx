// src/components/NovaChat.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { novaAPI } from '../services/api';
import Mascot from './Mascot';

export default function NovaChat() {
  const { user } = useAuth();
  const [open,     setOpen]     = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hey! I'm Nova 👋 Ask me for study tips, or anything about your learning journey." },
  ]);
  const [input,    setInput]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [novaMood, setNovaMood] = useState('happy');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const newMessages = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    setNovaMood('thinking');

    try {
      const res = await novaAPI.chat(text, newMessages);
      setMessages(prev => [...prev, { role: 'assistant', content: res.reply }]);
      setNovaMood('happy');
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: err.message || "Sorry, I couldn't respond right now. Try again in a bit! 🙏",
      }]);
      setNovaMood('sad');
      setTimeout(() => setNovaMood('happy'), 2000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating bubble button */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 500,
          width: 60, height: 60, borderRadius: '50%', cursor: 'pointer',
          background: 'linear-gradient(135deg, var(--violet), var(--cyan))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 30px rgba(139,107,255,0.5)',
          transition: 'var(--transition)',
        }}
      >
        {open ? (
          <span style={{ fontSize: 22, color: 'white' }}>✕</span>
        ) : (
          <div style={{ transform: 'scale(0.55)' }}>
            <Mascot size={70} level={user?.level} mood={loading ? 'thinking' : 'happy'} animate={false} />
          </div>
        )}
      </div>

      {/* Chat panel */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 96, right: 24, zIndex: 500,
          width: 340, maxWidth: 'calc(100vw - 48px)', height: 460,
          background: 'var(--card)', border: '1px solid var(--border)',
          borderRadius: 20, boxShadow: 'var(--shadow-glow)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            padding: '14px 18px', borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', gap: 12,
            background: 'var(--card2)',
          }}>
            <div style={{ transform: 'scale(0.5)', marginLeft: -10 }}>
              <Mascot size={60} level={user?.level} mood={novaMood} animate={false} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 14 }}>Nova</div>
              <div style={{ fontSize: 11, color: 'var(--green)' }}>● Your study companion</div>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {messages.map((m, i) => (
              <div key={i} style={{
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
              }}>
                <div style={{
                  padding: '10px 14px', borderRadius: 14, fontSize: 13, lineHeight: 1.5,
                  background: m.role === 'user'
                    ? 'linear-gradient(135deg, var(--violet), var(--violet2))'
                    : 'var(--card2)',
                  color: m.role === 'user' ? 'white' : 'var(--text)',
                  border: m.role === 'user' ? 'none' : '1px solid var(--border)',
                }}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ alignSelf: 'flex-start' }}>
                <div style={{
                  padding: '10px 14px', borderRadius: 14, fontSize: 13,
                  background: 'var(--card2)', border: '1px solid var(--border)', color: 'var(--text3)',
                }}>
                  Nova is thinking...
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: 12, borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
            <input
              className="input-field"
              style={{ fontSize: 13, padding: '10px 14px' }}
              placeholder="Ask Nova anything..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
            />
            <button
              className="send-btn"
              style={{ width: 38, height: 38, fontSize: 15 }}
              onClick={sendMessage}
              disabled={loading}
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}
