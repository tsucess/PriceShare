import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authLogout, getMe } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(() => localStorage.getItem('ps-token'));
  const [loading, setLoading] = useState(!!localStorage.getItem('ps-token'));

  // On mount (or token change) hydrate user from /users/me
  useEffect(() => {
    if (!token) { setLoading(false); return; }
    getMe()
      .then((res) => setUser(res.data.data ?? res.data))
      .catch(() => {
        // Token is invalid / expired — clear it
        localStorage.removeItem('ps-token');
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const login = useCallback((newToken, userData) => {
    localStorage.setItem('ps-token', newToken);
    // Mark onboarded so splash/slides are skipped after first sign-in
    localStorage.setItem('pw-onboarded', 'true');
    setToken(newToken);
    setUser(userData);
  }, []);

  const logout = useCallback(async () => {
    try { await authLogout(); } catch (_) { /* ignore network errors */ }
    localStorage.removeItem('ps-token');
    setToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((partial) => {
    setUser((prev) => ({ ...prev, ...partial }));
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

