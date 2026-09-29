import React, { createContext, useState, useEffect, useCallback } from 'react';
import * as authApi from '../api/authApi';

export const AuthContext = createContext(null);

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize authentication on component mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const res = await authApi.getMe();
          const userData = res?.data || res;
          setUser(userData);
          setToken(storedToken);
        } catch (error) {
          console.error('Session expired or invalid token:', error);
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      } else {
        setToken(null);
        setUser(null);
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Login handler accepting (email, password) or credentials object
  const login = useCallback(async (emailOrData, password) => {
    const payload =
      typeof emailOrData === 'object' && emailOrData !== null
        ? emailOrData
        : { email: emailOrData, password };

    const res = await authApi.login(payload);
    const authData = res?.data || res;

    if (authData && authData.token) {
      localStorage.setItem('token', authData.token);
      setToken(authData.token);
      setUser({
        id: authData.id,
        email: authData.email,
        fullName: authData.fullName,
        role: authData.role,
        companyId: authData.companyId,
        companyName: authData.companyName,
      });
    }

    return res;
  }, []);

  // Register handler accepting registration form data
  const register = useCallback(async (data) => {
    const res = await authApi.register(data);
    const authData = res?.data || res;

    if (authData && authData.token) {
      localStorage.setItem('token', authData.token);
      setToken(authData.token);
      setUser({
        id: authData.id,
        email: authData.email,
        fullName: authData.fullName,
        role: authData.role,
        companyId: authData.companyId,
        companyName: authData.companyName,
      });
    }

    return res;
  }, []);

  // Logout handler to clear token and state
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }, []);

  const isAuthenticated = Boolean(token && user);

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
