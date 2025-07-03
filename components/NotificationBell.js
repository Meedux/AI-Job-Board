'use client';

import { useState } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { colors, typography, components } from '../utils/designSystem';

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    notifications, 
    getUnreadCount, 
    markAsRead, 
    markAllAsRead, 
    removeNotification,
    clearAllNotifications 
  } = useNotifications();

  const unreadCount = getUnreadCount();

  const formatTime = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'user_registration': return '👤';
      case 'job_posted': return '💼';
      case 'application_submitted': return '📄';
      case 'system': return '⚙️';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return 'ℹ️';
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-lg ${colors.neutral.surfaceHover} transition-colors`}
      >
        <svg 
          className={`w-6 h-6 ${colors.neutral.textSecondary}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
          />
        </svg>
        
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className={`absolute -top-1 -right-1 ${colors.error.background} text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium`}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Panel */}
          <div className={`absolute right-0 top-full mt-2 w-80 ${colors.neutral.backgroundSecondary} ${colors.neutral.border} border rounded-lg shadow-lg z-50 max-h-96 overflow-hidden`}>
            {/* Header */}
            <div className={`p-4 border-b ${colors.neutral.borderLight}`}>
              <div className="flex items-center justify-between">
                <h3 className={`${typography.h6} ${colors.neutral.textPrimary}`}>
                  Notifications
                </h3>
                {notifications.length > 0 && (
                  <div className="flex gap-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className={`${typography.bodySmall} ${colors.primary.text} hover:underline`}
                      >
                        Mark all read
                      </button>
                    )}
                    <button
                      onClick={clearAllNotifications}
                      className={`${typography.bodySmall} ${colors.error.text} hover:underline`}
                    >
                      Clear all
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-64 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <div className={`text-3xl mb-2`}>🔔</div>
                  <p className={`${typography.bodyBase} ${colors.neutral.textMuted}`}>
                    No notifications yet
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-700">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:${colors.neutral.surfaceHover} transition-colors ${
                        !notification.read ? colors.neutral.backgroundTertiary : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-lg flex-shrink-0">
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className={`${typography.bodyBase} ${colors.neutral.textPrimary} ${!notification.read ? 'font-medium' : ''}`}>
                              {notification.title}
                            </p>
                            <button
                              onClick={() => removeNotification(notification.id)}
                              className={`${colors.neutral.textMuted} hover:${colors.neutral.textSecondary} ml-2`}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                          
                          {notification.message && (
                            <p className={`${typography.bodySmall} ${colors.neutral.textSecondary} mt-1`}>
                              {notification.message}
                            </p>
                          )}
                          
                          <div className="flex items-center justify-between mt-2">
                            <span className={`${typography.bodySmall} ${colors.neutral.textMuted}`}>
                              {formatTime(notification.timestamp)}
                            </span>
                            
                            {!notification.read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className={`${typography.bodySmall} ${colors.primary.text} hover:underline`}
                              >
                                Mark as read
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 5 && (
              <div className={`p-3 border-t ${colors.neutral.borderLight} text-center`}>
                <button className={`${typography.bodySmall} ${colors.primary.text} hover:underline`}>
                  View all notifications
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;
