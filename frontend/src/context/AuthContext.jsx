import React, { createContext, useContext, useEffect, useState } from 'react';
import { getToken, clearToken } from '../utils/authHelpers';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Try to hydrate user from localStorage to avoid UI flicker on login
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('user');
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      // If an API envelope was accidentally stored, normalize to inner data
      if (parsed && parsed.success && parsed.data) return parsed.data;
      return parsed;
    } catch (e) {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const token = getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get('/users/profile');
        // API responses use { success: true, data: ... }
        const normalized = res?.data?.data || res?.data || null;
        setUser(normalized);
      } catch (err) {
        // Log backend response body if available for easier debugging
        console.error('Auth init failed', err.response?.data || err.message || err);
        // If unauthorized, clear token and local user to avoid retry loops
        if (err.response && err.response.status === 401) {
          try { clearToken(); localStorage.removeItem('user'); } catch (e) { /* ignore */ }
        }
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const login = (userData) => {
    setUser(userData);
    try {
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (e) {
      // ignore
    }
  };

  const logout = () => {
    try {
      clearToken();
      localStorage.removeItem('user');
    } catch (e) {
      // ignore
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
