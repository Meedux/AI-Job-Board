import { NextResponse } from 'next/server';
import { getUserFromRequest } from '../../../../../utils/auth';
import { logAPIRequest, getRequestInfo } from '../../../../../utils/dataLogger';
import { 
  createNotification,
  notifyUserRegistration,
  notifyJobPosted,
  notifySystemError,
  notifySecurityAlert,
  NOTIFICATION_TYPES,
  CATEGORIES,
  PRIORITY
} from '../../../../../utils/notificationService';

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
  const { userAgent, ipAddress } = getRequestInfo(request);
  
  try {
    // Log API request
    await logAPIRequest('POST', '/api/admin/notifications/test-system', null, ipAddress);
    
    // Verify user authentication
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
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
    const { testType } = body;

    let notification;

    switch (testType) {
      case 'user_registration':
        notification = await notifyUserRegistration(
          'testuser@example.com',
          'test-user-123',
          ipAddress
        );
        break;

      case 'job_posted':
        notification = await notifyJobPosted(
          'Senior Full Stack Developer',
          'Amazing Tech Corp',
          'test-user-456',
          'hr@amazingtech.com',
          ipAddress
        );
        break;

      case 'system_error':
        notification = await notifySystemError(
          'Database connection timeout occurred',
          'database_connection',
          ipAddress
        );
        break;

      case 'security_alert':
        notification = await notifySecurityAlert(
          'Multiple failed login attempts detected',
          'test-user-789',
          'suspicious@example.com',
          ipAddress
        );
        break;

      case 'custom_admin':
        notification = await createNotification({
          type: NOTIFICATION_TYPES.ADMIN_ACTION,
          title: 'Test Admin Notification',
          message: 'This is a test notification created by an admin',
          category: CATEGORIES.ADMIN,
          priority: PRIORITY.MEDIUM,
          userEmail: user.email,
          metadata: { testType: 'custom_admin', createdBy: user.email },
          ipAddress
        });
        break;

      case 'custom_system':
        notification = await createNotification({
          type: NOTIFICATION_TYPES.SYSTEM_MAINTENANCE,
          title: 'Test System Notification',
          message: 'This is a test system-wide notification',
          category: CATEGORIES.SYSTEM,
          priority: PRIORITY.HIGH,
          metadata: { testType: 'custom_system', scheduled: true },
          ipAddress
        });
        break;

      case 'custom_user':
        notification = await createNotification({
          type: NOTIFICATION_TYPES.USER_PROFILE_UPDATE,
          title: 'Test User Notification',
          message: 'This is a test user notification',
          category: CATEGORIES.USER,
          priority: PRIORITY.LOW,
          userId: 'test-user-999',
          userEmail: 'testuser@example.com',
          metadata: { testType: 'custom_user', updateType: 'profile' },
          ipAddress
        });
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid test type' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: `Test notification created: ${testType}`,
      notification
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating test notification:', error);
    return NextResponse.json(
      { error: 'Failed to create test notification' },
      { status: 500 }
    );
  }
}
