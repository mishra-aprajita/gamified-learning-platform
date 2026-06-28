// src/context/AuthContext.js
// ─────────────────────────────────────────────
//  Global auth state. Wrap <App /> with <AuthProvider>.
//  Any component can call useAuth() to get user & helpers.
// ─────────────────────────────────────────────
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true); // true while checking saved token

  // ── On mount: restore session from localStorage ──
  useEffect(() => {
    const token = localStorage.getItem('levelup_token');
    if (token) {
      authAPI.getMe()
        .then(data => setUser(data.user))
        .catch(()  => { localStorage.removeItem('levelup_token'); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // ── Register ─────────────────────────────────
  const register = async (formData) => {
    const data = await authAPI.register(formData);
    localStorage.setItem('levelup_token', data.token);
    setUser(data.user);
    return data;
  };

  // ── Login ────────────────────────────────────
  const login = async (formData) => {
    const data = await authAPI.login(formData);
    localStorage.setItem('levelup_token', data.token);
    setUser(data.user);
    return data;
  };

  // ── Google Login ─────────────────────────────
  const googleLogin = async (credential) => {
    const data = await authAPI.googleLogin(credential);
    localStorage.setItem('levelup_token', data.token);
    setUser(data.user);
    return data;
  };

  // ── Logout ───────────────────────────────────
  const logout = () => {
    localStorage.removeItem('levelup_token');
    setUser(null);
  };

  // ── Update user in context (after profile edit, XP gain, etc.) ──
  const updateUser = (updates) => {
    setUser(prev => ({ ...prev, ...updates }));
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, googleLogin, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// ── Hook ─────────────────────────────────────
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
