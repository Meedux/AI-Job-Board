import { NextResponse } from 'next/server';
import { getUserFromRequest } from '../../../../utils/auth';
import { logAdminActivity, logAPIRequest, logError, getRequestInfo } from '../../../../utils/dataLogger';
import { 
  getNotifications, 
  markNotificationAsRead, 
  deleteNotification, 
  clearAllNotifications, 
  createNotification,
  NOTIFICATION_TYPES,
  CATEGORIES,
  PRIORITY
} from '../../../../utils/notificationService';

// Admin email list (should match AuthContext)
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

export async function GET(request) {
  const startTime = Date.now();
  const { userAgent, ipAddress } = getRequestInfo(request);
  let userId = null;
  
  try {
    // Log API request
    await logAPIRequest('GET', '/api/admin/notifications', null, ipAddress);
    
    // Verify user authentication
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    userId = user.id;

    // Check if user is admin
    if (!isAdmin(user.email)) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Log admin activity
    await logAdminActivity(
      user.email,
      'VIEW_NOTIFICATIONS',
      'admin_notifications',
      'Admin viewed notifications list',
      null,
      ipAddress
    );

    // Return notifications for admin using the new service
    const adminNotifications = getNotifications(true);

    // Log successful API response
    const responseTime = Date.now() - startTime;
    await logAPIRequest(
      'GET',
      '/api/admin/notifications',
      userId,
      ipAddress,
      200,
      responseTime
    );

    return NextResponse.json({
      notifications: adminNotifications
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    
    // Log error
    await logError(
      'ADMIN_NOTIFICATIONS_ERROR',
      'admin/notifications',
      error.message,
      error.stack,
      userId,
      null,
      'error'
    );
    
    // Log failed API response
    const responseTime = Date.now() - startTime;
    await logAPIRequest(
      'GET',
      '/api/admin/notifications',
      userId,
      ipAddress,
      500,
      responseTime
    );
    
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const startTime = Date.now();
  const { userAgent, ipAddress } = getRequestInfo(request);
  let userId = null;

  try {
    // Log API request
    await logAPIRequest('POST', '/api/admin/notifications', null, ipAddress);

    // Verify user authentication
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    userId = user.id;

    // Check if user is admin
    if (!isAdmin(user.email)) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { 
      type, 
      title, 
      message, 
      category = CATEGORIES.ADMIN,
      priority = PRIORITY.MEDIUM,
      metadata = {}
    } = body;

    // Validate required fields
    if (!type || !title) {
      return NextResponse.json(
        { error: 'Type and title are required' },
        { status: 400 }
      );
    }

    // Create new notification using the notification service
    const newNotification = await createNotification({
      type,
      title,
      message,
      category,
      priority,
      userEmail: user.email,
      metadata,
      ipAddress
    });

    // Log admin activity
    await logAdminActivity(
      user.email,
      'CREATE_NOTIFICATION',
      'admin_notifications',
      `Admin created notification: ${title}`,
      { notificationId: newNotification.id, type, category },
      ipAddress
    );

    // Log successful API response
    const responseTime = Date.now() - startTime;
    await logAPIRequest(
      'POST',
      '/api/admin/notifications',
      userId,
      ipAddress,
      201,
      responseTime
    );

    return NextResponse.json({
      notification: newNotification
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating notification:', error);
    
    // Log error
    await logError(
      'ADMIN_CREATE_NOTIFICATION_ERROR',
      'admin/notifications',
      error.message,
      error.stack,
      userId,
      null,
      'error'
    );
    
    // Log failed API response
    const responseTime = Date.now() - startTime;
    await logAPIRequest(
      'POST',
      '/api/admin/notifications',
      userId,
      ipAddress,
      500,
      responseTime
    );
    
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  const startTime = Date.now();
  const { userAgent, ipAddress } = getRequestInfo(request);
  let userId = null;

  try {
    // Log API request
    await logAPIRequest('PATCH', '/api/admin/notifications', null, ipAddress);

    // Verify user authentication
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    userId = user.id;

    // Check if user is admin
    if (!isAdmin(user.email)) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action, notificationIds } = body;

    let actionResult = false;

    if (action === 'mark_read' && notificationIds) {
      for (const id of notificationIds) {
        markNotificationAsRead(id);
      }
      actionResult = true;
    } else if (action === 'mark_all_read') {
      // Get all admin notifications and mark them as read
      const adminNotifications = getNotifications(true);
      for (const notification of adminNotifications) {
        markNotificationAsRead(notification.id);
      }
      actionResult = true;
    } else if (action === 'delete' && notificationIds) {
      for (const id of notificationIds) {
        deleteNotification(id);
      }
      actionResult = true;
    } else if (action === 'clear_all') {
      clearAllNotifications(true);
      actionResult = true;
    }

    // Log admin activity
    await logAdminActivity(
      user.email,
      'MODIFY_NOTIFICATIONS',
      'admin_notifications',
      `Admin performed action: ${action}`,
      { action, notificationIds: notificationIds || 'all' },
      ipAddress
    );

    // Log successful API response
    const responseTime = Date.now() - startTime;
    await logAPIRequest(
      'PATCH',
      '/api/admin/notifications',
      userId,
      ipAddress,
      200,
      responseTime
    );

    return NextResponse.json({
      success: actionResult
    }, { status: 200 });

  } catch (error) {
    console.error('Error updating notifications:', error);
    
    // Log error
    await logError(
      'ADMIN_UPDATE_NOTIFICATION_ERROR',
      'admin/notifications',
      error.message,
      error.stack,
      userId,
      null,
      'error'
    );
    
    // Log failed API response
    const responseTime = Date.now() - startTime;
    await logAPIRequest(
      'PATCH',
      '/api/admin/notifications',
      userId,
      ipAddress,
      500,
      responseTime
    );
    
    return NextResponse.json(
      { error: 'Failed to update notifications' },
      { status: 500 }
    );
  }
}

// Function to add a new notification (can be called from other parts of the app)
// This is now a wrapper around the notification service
export const addAdminNotification = async (type, title, message, metadata = {}) => {
  return await createNotification({
    type,
    title,
    message,
    category: CATEGORIES.ADMIN,
    priority: PRIORITY.MEDIUM,
    metadata
  });
};
