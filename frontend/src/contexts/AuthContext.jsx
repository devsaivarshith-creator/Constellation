import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('constellation_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isAuthenticated = !!user;

  // On mount, verify the saved token is still valid
  useEffect(() => {
    const verifySession = async () => {
      const token = localStorage.getItem('constellation_token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const userData = await api.getMe();
        setUser(userData);
        localStorage.setItem('constellation_user', JSON.stringify(userData));
      } catch {
        // Token invalid/expired — clear
        api.clearToken();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    verifySession();
  }, []);

  const login = useCallback(async (username, password) => {
    setError(null);
    try {
      const data = await api.login(username, password);
      if (data?.user) {
        setUser(data.user);
        localStorage.setItem('constellation_user', JSON.stringify(data.user));
        return data.user;
      }
    } catch (err) {
      const msg = err.detail || err.message || 'Login failed';
      setError(msg);
      throw err;
    }
  }, []);

  const register = useCallback(async (username, password, fullName = '') => {
    setError(null);
    try {
      const data = await api.register(username, password, fullName);
      if (data?.user) {
        setUser(data.user);
        localStorage.setItem('constellation_user', JSON.stringify(data.user));
        return data.user;
      }
    } catch (err) {
      const msg = err.detail || err.message || 'Registration failed';
      setError(msg);
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    api.logout();
    setUser(null);
    setError(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, error, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
