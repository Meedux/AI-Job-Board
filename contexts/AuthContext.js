'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

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

  // Admin email list (in production, this would be in a database)
  const adminEmails = useMemo(() => [
    'admin@getgethired.com',
    'support@getgethired.com',
    // Add more admin emails as needed
  ], []);

  // Admin domain list
  const adminDomains = useMemo(() => [
    'getgethired.com'
  ], []);

  // Check if user is admin
  const isAdmin = useCallback((userEmail) => {
    if (!userEmail) return false;
    const email = userEmail.toLowerCase();
    const domain = email.split('@')[1];
    return adminEmails.includes(email) || adminDomains.includes(domain);
  }, [adminEmails, adminDomains]);

  // Get redirect URL based on user role
  const getRedirectUrl = useCallback((userEmail, defaultUrl = '/') => {
    return isAdmin(userEmail) ? '/admin' : defaultUrl;
  }, [isAdmin]);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
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
              const userWithAdminRole = {
                ...data.user,
                isAdmin: isAdmin(data.user.email)
              };
              setUser(userWithAdminRole);
              console.log('👤 User authenticated:', userWithAdminRole);
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

    checkAuth();
  }, [isAdmin]);


  const login = async (emailOrUser, passwordOrToken) => {
    // Handle two call patterns:
    // 1. login(email, password) - traditional login
    // 2. login(userData, token) - after successful API response
    
    if (typeof emailOrUser === 'object' && emailOrUser.email) {
      // Pattern 2: Already have user data and token, just set the user
      const userWithAdminRole = {
        ...emailOrUser,
        isAdmin: isAdmin(emailOrUser.email)
      };
      setUser(userWithAdminRole);
      console.log('✅ User authenticated with token:', userWithAdminRole);
      return { success: true, user: userWithAdminRole };
    } else {
      // Pattern 1: Traditional email/password login
      const email = emailOrUser;
      const password = passwordOrToken;
      
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
          const userWithAdminRole = {
            ...data.user,
            isAdmin: isAdmin(data.user.email)
          };
          setUser(userWithAdminRole);
          console.log('✅ Login successful, user set:', userWithAdminRole);
          
          const redirectUrl = getRedirectUrl(data.user.email);
          return { success: true, redirectUrl };
        } else {
          console.log('❌ Login failed:', data.error);
          return { success: false, error: data.error };
        }
      } catch (error) {
        console.error('❌ Login network error:', error);
        return { success: false, error: 'Network error' };
      }
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
        const userWithAdminRole = {
          ...data.user,
          isAdmin: isAdmin(data.user.email)
        };
        setUser(userWithAdminRole);
        console.log('✅ Registration successful, user set:', userWithAdminRole);
        
        const redirectUrl = getRedirectUrl(data.user.email);
        return { success: true, redirectUrl };
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
    isAdmin,
    getRedirectUrl,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
