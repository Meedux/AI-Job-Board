'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const { user } = useAuth();

  // Function to show toast notifications
  const showToast = (message, type = 'default') => {
    switch (type) {
      case 'success':
        toast.success(message, {
          style: {
            background: '#065f46',
            color: '#d1fae5',
            border: '1px solid #047857',
          },
        });
        break;
      case 'error':
        toast.error(message, {
          style: {
            background: '#7f1d1d',
            color: '#fecaca',
            border: '1px solid #dc2626',
          },
        });
        break;
      case 'warning':
        toast(message, {
          icon: '⚠️',
          style: {
            background: '#78350f',
            color: '#fed7aa',
            border: '1px solid #d97706',
          },
        });
        break;
      case 'info':
        toast(message, {
          icon: 'ℹ️',
          style: {
            background: '#1e3a8a',
            color: '#bfdbfe',
            border: '1px solid #2563eb',
          },
        });
        break;
      default:
        toast(message, {
          style: {
            background: '#374151',
            color: '#e5e7eb',
            border: '1px solid #4b5563',
          },
        });
    }
  };

  // Function to fetch admin notifications from API
  const fetchAdminNotifications = useCallback(async () => {
    if (!user?.isAdmin) return;
    
    try {
      const response = await fetch('/api/admin/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error('Error fetching admin notifications:', error);
    }
  }, [user?.isAdmin]);

  // Function to send API requests for admin actions
  const sendAdminAction = useCallback(async (action, notificationIds = []) => {
    if (!user?.isAdmin) return;
    
    try {
      const response = await fetch('/api/admin/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, notificationIds }),
      });
      
      if (response.ok) {
        await fetchAdminNotifications(); // Refresh notifications
      }
    } catch (error) {
      console.error('Error sending admin action:', error);
    }
  }, [user?.isAdmin, fetchAdminNotifications]);

  // Function to add persistent notifications (for in-app notifications)
  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(),
      timestamp: new Date(),
      read: false,
      ...notification
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  // Function to create notifications for current user using the notification service
  const createUserNotification = useCallback(async (config) => {
    if (!user) return;

    try {
      const response = await fetch('/api/notifications/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...config,
          userId: user.uid,
          userEmail: user.email
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Add to local notifications if not admin-only
        if (!data.notification.adminOnly) {
          addNotification(data.notification);
        }
        return data.notification;
      }
    } catch (error) {
      console.error('Error creating user notification:', error);
      // Fallback to local notification
      addNotification(config);
    }
  }, [user]);

  // Function to mark notification as read
  const markAsRead = async (id) => {
    if (user?.isAdmin) {
      await sendAdminAction('mark_read', [id]);
    } else {
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, read: true } : notif
        )
      );
    }
  };

  // Function to mark all notifications as read
  const markAllAsRead = async () => {
    if (user?.isAdmin) {
      await sendAdminAction('mark_all_read');
    } else {
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
    }
  };

  // Function to remove notification
  const removeNotification = async (id) => {
    if (user?.isAdmin) {
      await sendAdminAction('delete', [id]);
    } else {
      setNotifications(prev => prev.filter(notif => notif.id !== id));
    }
  };

  // Function to clear all notifications
  const clearAllNotifications = async () => {
    if (user?.isAdmin) {
      await sendAdminAction('clear_all');
    } else {
      setNotifications([]);
    }
  };

  // Get unread count
  const getUnreadCount = () => {
    return notifications.filter(notif => !notif.read).length;
  };

  // Load notifications from localStorage on mount or fetch from API for admins
  useEffect(() => {
    if (user?.isAdmin) {
      fetchAdminNotifications();
    } else {
      const saved = localStorage.getItem('app_notifications');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setNotifications(parsed);
        } catch (error) {
          console.error('Error loading notifications:', error);
        }
      }
    }
  }, [user, fetchAdminNotifications]);

  // Real-time notification stream (SSE)
  useEffect(() => {
    if (!user) return;
    const es = new EventSource('/api/notifications/stream');
    const handleNotification = (event) => {
      try {
        const payload = JSON.parse(event.data || '{}');
        const currentUserId = user.id || user.uid;
        if (payload.userId && payload.userId !== currentUserId && !user.isAdmin) return;
        if (payload.notification) {
          addNotification(payload.notification);
        }
      } catch (err) {
        console.error('Realtime notification error', err);
      }
    };

    es.addEventListener('notification', handleNotification);
    return () => {
      es.removeEventListener('notification', handleNotification);
      es.close();
    };
  }, [user]);

  // Save notifications to localStorage whenever they change (only for non-admin users)
  useEffect(() => {
    if (!user?.isAdmin) {
      localStorage.setItem('app_notifications', JSON.stringify(notifications));
    }
  }, [notifications, user]);

  const value = {
    notifications,
    showToast,
    addNotification,
    createUserNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    getUnreadCount
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        containerStyle={{
          top: 80,
        }}
        toastOptions={{
          duration: 4000,
          style: {
            maxWidth: '500px',
          },
        }}
      />
    </NotificationContext.Provider>
  );
};
