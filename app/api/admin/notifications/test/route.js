import { NextResponse } from 'next/server';
import { verifyToken } from '../../../../../utils/auth';
import { addAdminNotification } from '../route';

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

    // Create test notifications
    const testNotifications = [
      {
        type: 'user_registration',
        title: 'Test: New User Registration',
        message: 'John Doe (john@example.com) has registered'
      },
      {
        type: 'job_posted',
        title: 'Test: New Job Posted',
        message: 'Senior Developer position posted by TechCorp'
      },
      {
        type: 'system',
        title: 'Test: System Update',
        message: 'Database backup completed successfully'
      },
      {
        type: 'warning',
        title: 'Test: Warning',
        message: 'High server load detected - monitoring'
      },
      {
        type: 'error',
        title: 'Test: Error',
        message: 'Email service temporarily unavailable'
      }
    ];

    const createdNotifications = [];
    for (const notification of testNotifications) {
      const created = addAdminNotification(
        notification.type,
        notification.title,
        notification.message
      );
      createdNotifications.push(created);
    }

    return NextResponse.json({
      success: true,
      message: 'Test notifications created',
      notifications: createdNotifications
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating test notifications:', error);
    return NextResponse.json(
      { error: 'Failed to create test notifications' },
      { status: 500 }
    );
  }
}
