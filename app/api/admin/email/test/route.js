import { NextResponse } from 'next/server';
import { verifyToken } from '../../../../../utils/auth';
import emailItService from '../../../../../utils/emailItService';

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

    const body = await request.json();
    const { testType, testEmail } = body;

    let result;

    switch (testType) {
      case 'connection':
        // Test EmailIt connection by sending a simple test
        result = await emailItService.sendEmail(
          'test@example.com',
          'Connection Test',
          '<p>EmailIt connection test</p>',
          'connection_test'
        );
        break;

      case 'test_email':
        if (!testEmail) {
          return NextResponse.json(
            { error: 'Test email address is required' },
            { status: 400 }
          );
        }
        result = await emailItService.sendEmail(
          testEmail,
          'Test Email from GetGetHired',
          '<h1>Test Email</h1><p>This is a test email sent from the admin panel using EmailIt service.</p>',
          'test_email'
        );
        break;

      case 'admin_notification':
        result = await emailItService.sendEmail(
          user.email,
          'Admin Notification Test',
          `<h1>Email Test</h1><p>This is a test notification from the admin panel</p><p>Tested by: ${user.email}</p><p>Timestamp: ${new Date().toISOString()}</p>`,
          'admin_notification'
        );
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid test type' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      result
    }, { status: 200 });

  } catch (error) {
    console.error('Error testing email service:', error);
    return NextResponse.json(
      { error: 'Failed to test email service' },
      { status: 500 }
    );
  }
}
