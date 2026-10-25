import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('vpa_token');
    const storedUser = localStorage.getItem('vpa_user');
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('vpa_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login(email, password);
    const { access_token, refresh_token, user: userData } = res.data;
    localStorage.setItem('vpa_token', access_token);
    if (refresh_token) {
      localStorage.setItem('vpa_refresh_token', refresh_token);
    }
    localStorage.setItem('vpa_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const signup = async (name, email, password, confirmPassword) => {
    const res = await authAPI.signup(name, email, password, confirmPassword);
    const { access_token, refresh_token, user: userData } = res.data;
    localStorage.setItem('vpa_token', access_token);
    if (refresh_token) {
      localStorage.setItem('vpa_refresh_token', refresh_token);
    }
    localStorage.setItem('vpa_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (e) {
      // Safe fallback if token already expired
    } finally {
      localStorage.removeItem('vpa_token');
      localStorage.removeItem('vpa_refresh_token');
      localStorage.removeItem('vpa_user');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
