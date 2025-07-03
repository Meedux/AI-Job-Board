import { NextResponse } from 'next/server';
import { verifyToken } from '../../../../utils/auth';

// In-memory storage for notifications (in production, use a database)
let notifications = [
  {
    id: 1,
    type: 'user_registration',
    title: 'New User Registration',
    message: 'A new user has registered: john@example.com',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    read: false,
    adminOnly: true
  },
  {
    id: 2,
    type: 'job_posted',
    title: 'New Job Posted',
    message: 'Frontend Developer position posted by TechCorp',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    read: false,
    adminOnly: true
  },
  {
    id: 3,
    type: 'system',
    title: 'System Update',
    message: 'Website maintenance completed successfully',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    read: true,
    adminOnly: true
  }
];

let notificationIdCounter = 4;

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
  try {
    // Get token from cookies
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify token
    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (!isAdmin(user.email)) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Return notifications for admin
    const adminNotifications = notifications
      .filter(notification => notification.adminOnly)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return NextResponse.json({
      notifications: adminNotifications
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    // Get token from cookies
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify token
    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (!isAdmin(user.email)) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { type, title, message, adminOnly = true } = body;

    // Validate required fields
    if (!type || !title) {
      return NextResponse.json(
        { error: 'Type and title are required' },
        { status: 400 }
      );
    }

    // Create new notification
    const newNotification = {
      id: notificationIdCounter++,
      type,
      title,
      message,
      timestamp: new Date(),
      read: false,
      adminOnly
    };

    notifications.unshift(newNotification);

    return NextResponse.json({
      notification: newNotification
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    // Get token from cookies
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify token
    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (!isAdmin(user.email)) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action, notificationIds } = body;

    if (action === 'mark_read') {
      notifications = notifications.map(notification => {
        if (notificationIds.includes(notification.id)) {
          return { ...notification, read: true };
        }
        return notification;
      });
    } else if (action === 'mark_all_read') {
      notifications = notifications.map(notification => ({
        ...notification,
        read: true
      }));
    } else if (action === 'delete') {
      notifications = notifications.filter(notification => 
        !notificationIds.includes(notification.id)
      );
    } else if (action === 'clear_all') {
      notifications = notifications.filter(notification => !notification.adminOnly);
    }

    return NextResponse.json({
      success: true
    }, { status: 200 });

  } catch (error) {
    console.error('Error updating notifications:', error);
    return NextResponse.json(
      { error: 'Failed to update notifications' },
      { status: 500 }
    );
  }
}

// Function to add a new notification (can be called from other parts of the app)
export const addAdminNotification = (type, title, message) => {
  const newNotification = {
    id: notificationIdCounter++,
    type,
    title,
    message,
    timestamp: new Date(),
    read: false,
    adminOnly: true
  };
  
  notifications.unshift(newNotification);
  return newNotification;
};

// Export notifications array for external access
export { notifications };
