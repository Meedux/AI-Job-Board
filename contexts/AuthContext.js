'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);  const checkAuth = async () => {
    console.log('🔍 Checking authentication status...');
    console.log('🌐 Current location:', window.location.href);
    try {
      const sessionUrl = '/api/auth/session';
      console.log('📡 Fetching from:', sessionUrl);
      
      const response = await fetch(sessionUrl);
      console.log('📡 Session check response status:', response.status);
      console.log('📡 Session check response headers:', Object.fromEntries(response.headers.entries()));
      
      const responseText = await response.text();
      console.log('📄 Raw response text (first 200 chars):', responseText.substring(0, 200));
      
      if (response.ok) {
        try {
          const data = JSON.parse(responseText);
          console.log('✅ Session data:', data);
          if (data.authenticated) {
            setUser(data.user);
            console.log('👤 User authenticated:', data.user);
          } else {
            console.log('❌ User not authenticated');
          }
        } catch (parseError) {
          console.error('❌ Failed to parse JSON response:', parseError);
          console.log('📄 Response was HTML instead of JSON, likely redirected to login page');
        }
      } else {
        console.log('⚠️ Session check failed with status:', response.status);
      }
    } catch (error) {
      console.error('❌ Auth check failed:', error);
    } finally {
      setLoading(false);
      console.log('✅ Auth check completed, loading set to false');
    }
  };
  const login = async (email, password) => {
    console.log('🔑 Starting login process for:', email);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('📡 Login response status:', response.status);
      const data = await response.json();
      console.log('📄 Login response data:', data);

      if (response.ok) {
        setUser(data.user);
        console.log('✅ Login successful, user set:', data.user);
        return { success: true };
      } else {
        console.log('❌ Login failed:', data.error);
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('❌ Login network error:', error);
      return { success: false, error: 'Network error' };
    }
  };
  const register = async (userData) => {
    console.log('📝 Starting registration process for:', userData.email);
    console.log('📋 Registration data:', { ...userData, password: '[HIDDEN]' });
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      console.log('📡 Registration response status:', response.status);
      const data = await response.json();
      console.log('📄 Registration response data:', data);

      if (response.ok) {
        setUser(data.user);
        console.log('✅ Registration successful, user set:', data.user);
        return { success: true };
      } else {
        console.log('❌ Registration failed:', data.error);
        return { success: false, error: data.error };
      }
    } catch (error) {
        console.error('❌ Registration network error:', error);
      return { success: false, error: 'Network error' };
    }
  };
  const logout = async () => {
    console.log('🚪 Starting logout process...');
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      setUser(null);
      console.log('✅ Logout successful, user cleared');
    } catch (error) {
      console.error('❌ Logout failed:', error);
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
