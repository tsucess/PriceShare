import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authLogout, getMe } from '../services/api';

// Read storage key names from environment so they can be changed without touching code
const TOKEN_KEY  = process.env.REACT_APP_TOKEN_KEY  || 'ps-token';
const ONBOARD_KEY = process.env.REACT_APP_ONBOARD_KEY || 'pw-onboarded';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(() => localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(!!localStorage.getItem(TOKEN_KEY));

  // On mount (or token change) hydrate user from /users/me
  useEffect(() => {
    if (!token) { setLoading(false); return; }
    getMe()
      // /users/me returns { user: {...} } — extract the nested user object
      .then((res) => setUser(res.data.user ?? res.data.data ?? res.data))
      .catch(() => {
        // Token is invalid / expired — clear it
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const login = useCallback((newToken, userData) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    // Mark onboarded so splash/slides are skipped after first sign-in
    localStorage.setItem(ONBOARD_KEY, 'true');
    setToken(newToken);
    setUser(userData);
  }, []);

  const logout = useCallback(async () => {
    try { await authLogout(); } catch (_) { /* ignore network errors */ }
    localStorage.removeItem(TOKEN_KEY);
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

