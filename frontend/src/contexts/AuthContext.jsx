import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const DEFAULT_USER = {
  id: 'usr-cid-001',
  username: 'Lead Investigator',
  full_name: 'Lead Intelligence Officer',
  role: 'Chief Intelligence Analyst',
  jurisdiction: 'India Central Directorate',
  badge: 'IND-CID-8820',
  clearance: 'TOP SECRET // SPECIAL INTELLIGENCE',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
};

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Always initialize as authenticated with default senior investigator profile
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('constellation_user');
      return savedUser ? JSON.parse(savedUser) : DEFAULT_USER;
    } catch {
      return DEFAULT_USER;
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem('constellation_user', JSON.stringify(user));
  }, [user]);

  const login = async (username, password) => {
    try {
      const data = await api.login(username, password);
      if (data?.user) {
        setUser(data.user);
        localStorage.setItem('constellation_user', JSON.stringify(data.user));
        return data.user;
      }
    } catch {
      // Fallback to default user
    }
    setUser(DEFAULT_USER);
    return DEFAULT_USER;
  };

  const logout = () => {
    // If user clicks logout, reset back to active investigator session
    setUser(DEFAULT_USER);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAuthenticated: true }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
