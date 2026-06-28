// src/pages/Auth.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import Mascot from '../components/Mascot';

// Your Google OAuth Client ID (from console.cloud.google.com/apis/credentials)
// Safe to expose in frontend code — this is a public identifier, not a secret.
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';

export default function Auth({ initialMode = 'login', onBack = null }) {
  const { login, register, googleLogin } = useAuth();
  const [mode,    setMode]    = useState(initialMode === 'register' ? 'register' : 'login');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [form,    setForm]    = useState({ name: '', email: '', password: '', skills: '' });
  const googleBtnRef = useRef(null);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      if (mode === 'login') {
        await login({ email: form.email, password: form.password });
      } else {
        await register({
          name: form.name,
          email: form.email,
          password: form.password,
          skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Handle the credential Google sends back ──
  const handleGoogleResponse = async (response) => {
    setError('');
    setLoading(true);
    try {
      await googleLogin(response.credential);
    } catch (err) {
      setError(err.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  // ── Load Google's script and render the button ──
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return; // Google button simply won't render if not configured

    const renderButton = () => {
      if (!window.google || !googleBtnRef.current) return;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
      });
      googleBtnRef.current.innerHTML = ''; // clear before re-render (e.g. on mode switch)
      window.google.accounts.id.renderButton(googleBtnRef.current, {
        type: 'standard',
        theme: 'filled_black',
        size: 'large',
        text: mode === 'login' ? 'signin_with' : 'signup_with',
        shape: 'pill',
        width: 320,
      });
    };

    if (window.google) {
      renderButton();
    } else {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = renderButton;
      document.body.appendChild(script);
    }
  }, [mode]);

  return (
    <div className="auth-screen">
      <div className="auth-card" style={{ position: 'relative' }}>
        {onBack && (
          <button
            className="btn btn-ghost btn-sm"
            style={{ position: 'absolute', top: 20, left: 20, padding: '6px 14px' }}
            onClick={onBack}
          >
            ← Back
          </button>
        )}

        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <Mascot size={110} />
          <div style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 700, letterSpacing: '0.05em', marginTop: 8 }}>
            NOVA
          </div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: 6 }}>
          <span style={{
            fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800,
            letterSpacing: '-0.02em',
            background: 'linear-gradient(135deg, var(--violet), var(--cyan))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            XPify
          </span>
        </div>

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800,
            letterSpacing: '-0.02em', marginBottom: 6,
          }}>
            {mode === 'login' ? 'Welcome back!' : 'Start your journey'}
          </div>
          <div style={{ color: 'var(--text2)', fontSize: 14 }}>
            {mode === 'login'
              ? "I'm getting closer to my goal every day."
              : 'Turn your learning into momentum, one streak at a time.'}
          </div>
        </div>

        <div className="tabs" style={{ margin: '0 auto 28px', justifyContent: 'center' }}>
          <div className={`tab ${mode === 'login' ? 'active' : ''}`} onClick={() => setMode('login')}>Login</div>
          <div className={`tab ${mode === 'register' ? 'active' : ''}`} onClick={() => setMode('register')}>Register</div>
        </div>

        {error && (
          <div style={{
            background: 'rgba(255,138,92,0.1)', border: '1px solid rgba(255,138,92,0.3)',
            borderRadius: 14, padding: '12px 16px',
            color: 'var(--orange)', fontSize: 13, marginBottom: 20,
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* ── Google Sign-In button ── */}
        {GOOGLE_CLIENT_ID && (
          <>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
              <div ref={googleBtnRef} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              <div style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 600 }}>OR</div>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            </div>
          </>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {mode === 'register' && (
            <div>
              <div className="field-label">Full Name</div>
              <input className="input-field" name="name" value={form.name} onChange={handleChange} placeholder="Arjun Sharma" />
            </div>
          )}
          <div>
            <div className="field-label">Email</div>
            <input className="input-field" type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@email.com" />
          </div>
          <div>
            <div className="field-label">Password</div>
            <input className="input-field" type="password" name="password" value={form.password} onChange={handleChange} placeholder="Min 6 characters" />
          </div>
          {mode === 'register' && (
            <div>
              <div className="field-label">Skills (comma-separated)</div>
              <input className="input-field" name="skills" value={form.skills} onChange={handleChange} placeholder="React, DSA, Python" />
            </div>
          )}
        </div>

        <button
          className="btn btn-primary"
          style={{ width: '100%', marginTop: 26, padding: '14px 20px', fontSize: 15 }}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Please wait...' : mode === 'login' ? '🚀 Login & Continue' : '⚡ Create Account'}
        </button>

        <div style={{ textAlign: 'center', marginTop: 22, fontSize: 13, color: 'var(--text2)' }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <span
            style={{ color: 'var(--violet)', cursor: 'pointer', fontWeight: 700 }}
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
          >
            {mode === 'login' ? 'Register' : 'Login'}
          </span>
        </div>
      </div>
    </div>
  );
}
