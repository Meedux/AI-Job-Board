// Centralized Notification Service with Data Logging
import { logSystemEvent, logUserAction, logError } from './dataLogger';
import { emailService } from './emailService';

// Notification types
export const NOTIFICATION_TYPES = {
  // System notifications (admin-only)
  SYSTEM_MAINTENANCE: 'system_maintenance',
  SYSTEM_ERROR: 'system_error',
  SYSTEM_UPDATE: 'system_update',
  
  // User-related notifications (both admins and users)
  USER_REGISTRATION: 'user_registration',
  USER_LOGIN: 'user_login',
  USER_PROFILE_UPDATE: 'user_profile_update',
  
  // Job-related notifications
  JOB_POSTED: 'job_posted',
  JOB_APPLICATION: 'job_application',
  JOB_EXPIRED: 'job_expired',
  
  // Email notifications
  EMAIL_SENT: 'email_sent',
  EMAIL_FAILED: 'email_failed',
  
  // Admin activities
  ADMIN_LOGIN: 'admin_login',
  ADMIN_ACTION: 'admin_action',
  DATA_EXPORT: 'data_export',
  
  // General alerts
  SECURITY_ALERT: 'security_alert',
  PAYMENT_RECEIVED: 'payment_received',
  SUBSCRIPTION_UPDATED: 'subscription_updated'
};

// Notification priorities
export const PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

// Notification categories
export const CATEGORIES = {
  SYSTEM: 'system',
  USER: 'user', 
  JOB: 'job',
  EMAIL: 'email',
  ADMIN: 'admin',
  SECURITY: 'security',
  PAYMENT: 'payment'
};

// Admin configuration (should match AuthContext)
const adminEmails = [
  'admin@getgethired.com',
  'support@getgethired.com',
];

const adminDomains = [
  'getgethired.com'
];

const isAdmin = (email) => {
  if (!email) return false;
  const emailLower = email.toLowerCase();
  const domain = emailLower.split('@')[1];
  return adminEmails.includes(emailLower) || adminDomains.includes(domain);
};

// In-memory notification storage (in production, use database)
let notifications = [
  {
    id: 1,
    type: NOTIFICATION_TYPES.USER_REGISTRATION,
    title: 'New User Registration',
    message: 'A new user has registered: john@example.com',
    category: CATEGORIES.USER,
    priority: PRIORITY.MEDIUM,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    read: false,
    adminOnly: true,
    userId: null,
    userEmail: 'john@example.com',
    metadata: { registrationSource: 'website' }
  },
  {
    id: 2,
    type: NOTIFICATION_TYPES.JOB_POSTED,
    title: 'New Job Posted',
    message: 'Frontend Developer position posted by TechCorp',
    category: CATEGORIES.JOB,
    priority: PRIORITY.MEDIUM,
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    read: false,
    adminOnly: true,
    userId: 'sample-user-id',
    userEmail: 'hr@techcorp.com',
    metadata: { jobTitle: 'Frontend Developer', companyName: 'TechCorp' }
  },
  {
    id: 3,
    type: NOTIFICATION_TYPES.SYSTEM_UPDATE,
    title: 'System Update',
    message: 'Website maintenance completed successfully',
    category: CATEGORIES.SYSTEM,
    priority: PRIORITY.LOW,
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    read: true,
    adminOnly: true,
    userId: null,
    userEmail: null,
    metadata: { updateType: 'maintenance' }
  }
];

let notificationIdCounter = 4;

// Notification routing rules
const getNotificationRouting = (type, category) => {
  const routing = {
    adminOnly: false,
    userNotification: false,
    emailToAdmins: false,
    emailToUser: false,
    logAsSystemEvent: false,
    logAsUserAction: false
  };

  switch (category) {
    case CATEGORIES.SYSTEM:
      routing.adminOnly = true;
      routing.emailToAdmins = true;
      routing.logAsSystemEvent = true;
      break;
      
    case CATEGORIES.ADMIN:
      routing.adminOnly = true;
      routing.logAsSystemEvent = true;
      break;
      
    case CATEGORIES.SECURITY:
      routing.adminOnly = true;
      routing.emailToAdmins = true;
      routing.logAsSystemEvent = true;
      break;
      
    case CATEGORIES.USER:
      routing.userNotification = true;
      routing.logAsUserAction = true;
      // Also notify admins for important user events
      if ([NOTIFICATION_TYPES.USER_REGISTRATION].includes(type)) {
        routing.adminOnly = true;
        routing.emailToAdmins = true;
      }
      break;
      
    case CATEGORIES.JOB:
      routing.userNotification = true;
      routing.adminOnly = true; // Admins also get job notifications
      routing.logAsSystemEvent = true;
      break;
      
    case CATEGORIES.EMAIL:
      routing.adminOnly = true;
      routing.logAsSystemEvent = true;
      break;
      
    case CATEGORIES.PAYMENT:
      routing.adminOnly = true;
      routing.emailToAdmins = true;
      routing.logAsSystemEvent = true;
      break;
      
    default:
      routing.userNotification = true;
      routing.logAsUserAction = true;
  }

  return routing;
};

// Main notification creation function
export const createNotification = async (config) => {
  const {
    type,
    title,
    message,
    category = CATEGORIES.USER,
    priority = PRIORITY.MEDIUM,
    userId = null,
    userEmail = null,
    metadata = {},
    ipAddress = null
  } = config;

  try {
    // Get routing rules
    const routing = getNotificationRouting(type, category);
    
    // Create base notification object
    const notification = {
      id: notificationIdCounter++,
      type,
      title,
      message,
      category,
      priority,
      timestamp: new Date(),
      read: false,
      userId,
      userEmail,
      metadata,
      adminOnly: routing.adminOnly
    };

    // Store notification in memory
    notifications.unshift(notification);

    // Log to appropriate data logger
    if (routing.logAsSystemEvent) {
      await logSystemEvent(
        type,
        'notification_system',
        `${title}: ${message}`,
        metadata,
        ipAddress
      );
    }

    if (routing.logAsUserAction && userId) {
      await logUserAction(
        userId,
        type,
        'notification_system',
        `${title}: ${message}`,
        metadata,
        ipAddress
      );
    }

    // Send email notifications to admins if required
    if (routing.emailToAdmins) {
      for (const adminEmail of adminEmails) {
        try {
          await emailService.sendEmail({
            to: adminEmail,
            subject: `[Admin Alert] ${title}`,
            text: `${message}\n\nCategory: ${category}\nPriority: ${priority}\nTime: ${notification.timestamp.toISOString()}\n\nMetadata: ${JSON.stringify(metadata, null, 2)}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #dc2626;">Admin Alert</h2>
                <h3>${title}</h3>
                <p>${message}</p>
                <div style="background: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
                  <strong>Details:</strong><br>
                  Category: ${category}<br>
                  Priority: ${priority}<br>
                  Time: ${notification.timestamp.toLocaleString()}<br>
                  ${userId ? `User ID: ${userId}<br>` : ''}
                  ${userEmail ? `User Email: ${userEmail}<br>` : ''}
                </div>
                ${Object.keys(metadata).length > 0 ? `
                <div style="background: #f9fafb; padding: 15px; border-radius: 5px;">
                  <strong>Additional Data:</strong><br>
                  <pre style="background: #ffffff; padding: 10px; border-radius: 3px; overflow-x: auto; font-size: 12px;">${JSON.stringify(metadata, null, 2)}</pre>
                </div>
                ` : ''}
              </div>
            `
          });
        } catch (emailError) {
          console.error(`Failed to send admin email to ${adminEmail}:`, emailError);
          await logError(
            'EMAIL_NOTIFICATION_FAILED',
            'notification_service',
            `Failed to send admin notification email to ${adminEmail}: ${emailError.message}`,
            emailError.stack,
            userId,
            metadata,
            'error'
          );
        }
      }
    }

    // Send email to user if required and email is provided
    if (routing.emailToUser && userEmail) {
      try {
        await emailService.sendEmail({
          to: userEmail,
          subject: title,
          text: message,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #059669;">Notification</h2>
              <h3>${title}</h3>
              <p>${message}</p>
              <div style="background: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <strong>Time:</strong> ${notification.timestamp.toLocaleString()}
              </div>
            </div>
          `
        });
      } catch (emailError) {
        console.error(`Failed to send user email to ${userEmail}:`, emailError);
        await logError(
          'EMAIL_NOTIFICATION_FAILED',
          'notification_service',
          `Failed to send user notification email to ${userEmail}: ${emailError.message}`,
          emailError.stack,
          userId,
          metadata,
          'error'
        );
      }
    }

    console.log(`📢 Notification created: ${title} (${type})`);
    return notification;

  } catch (error) {
    console.error('Error creating notification:', error);
    await logError(
      'NOTIFICATION_CREATION_ERROR',
      'notification_service',
      `Failed to create notification: ${error.message}`,
      error.stack,
      userId,
      { originalConfig: config },
      'error'
    );
    throw error;
  }
};

// Convenience functions for common notification types
export const notifyUserRegistration = async (userEmail, userId, ipAddress) => {
  return createNotification({
    type: NOTIFICATION_TYPES.USER_REGISTRATION,
    title: 'New User Registration',
    message: `A new user has registered: ${userEmail}`,
    category: CATEGORIES.USER,
    priority: PRIORITY.MEDIUM,
    userId,
    userEmail,
    metadata: { registrationSource: 'website' },
    ipAddress
  });
};

export const notifyUserLogin = async (userEmail, userId, ipAddress) => {
  return createNotification({
    type: NOTIFICATION_TYPES.USER_LOGIN,
    title: 'User Login',
    message: `User logged in: ${userEmail}`,
    category: CATEGORIES.USER,
    priority: PRIORITY.LOW,
    userId,
    userEmail,
    metadata: { loginSource: 'website' },
    ipAddress
  });
};

export const notifyJobPosted = async (jobTitle, companyName, userId, userEmail, ipAddress) => {
  return createNotification({
    type: NOTIFICATION_TYPES.JOB_POSTED,
    title: 'New Job Posted',
    message: `${jobTitle} position posted by ${companyName}`,
    category: CATEGORIES.JOB,
    priority: PRIORITY.MEDIUM,
    userId,
    userEmail,
    metadata: { jobTitle, companyName },
    ipAddress
  });
};

export const notifySystemError = async (errorMessage, context, ipAddress) => {
  return createNotification({
    type: NOTIFICATION_TYPES.SYSTEM_ERROR,
    title: 'System Error',
    message: errorMessage,
    category: CATEGORIES.SYSTEM,
    priority: PRIORITY.HIGH,
    metadata: { context },
    ipAddress
  });
};

export const notifyAdminLogin = async (adminEmail, ipAddress) => {
  return createNotification({
    type: NOTIFICATION_TYPES.ADMIN_LOGIN,
    title: 'Admin Login',
    message: `Admin user logged in: ${adminEmail}`,
    category: CATEGORIES.ADMIN,
    priority: PRIORITY.MEDIUM,
    userEmail: adminEmail,
    metadata: { loginType: 'admin' },
    ipAddress
  });
};

export const notifySecurityAlert = async (alertMessage, userId, userEmail, ipAddress) => {
  return createNotification({
    type: NOTIFICATION_TYPES.SECURITY_ALERT,
    title: 'Security Alert',
    message: alertMessage,
    category: CATEGORIES.SECURITY,
    priority: PRIORITY.CRITICAL,
    userId,
    userEmail,
    metadata: { alertType: 'security' },
    ipAddress
  });
};

// Functions to get notifications
export const getNotifications = (forAdmin = false, userId = null) => {
  if (forAdmin) {
    return notifications
      .filter(n => n.adminOnly)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  } else {
    return notifications
      .filter(n => !n.adminOnly && (n.userId === userId || !n.userId))
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }
};

export const markNotificationAsRead = (id) => {
  const notification = notifications.find(n => n.id === id);
  if (notification) {
    notification.read = true;
    return true;
  }
  return false;
};

export const deleteNotification = (id) => {
  const index = notifications.findIndex(n => n.id === id);
  if (index > -1) {
    notifications.splice(index, 1);
    return true;
  }
  return false;
};

export const clearAllNotifications = (forAdmin = false, userId = null) => {
  if (forAdmin) {
    notifications = notifications.filter(n => !n.adminOnly);
  } else {
    notifications = notifications.filter(n => n.adminOnly || (n.userId !== userId && n.userId !== null));
  }
};

// Export notifications array for external access
export { notifications };
