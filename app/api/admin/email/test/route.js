import { NextResponse } from 'next/server';
import { verifyToken } from '../../../../../utils/auth';
import { emailService } from '../../../../../utils/emailService';

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
        result = await emailService.verifyConnection();
        break;

      case 'test_email':
        if (!testEmail) {
          return NextResponse.json(
            { error: 'Test email address is required' },
            { status: 400 }
          );
        }
        result = await emailService.sendTestEmail(testEmail);
        break;

      case 'admin_notification':
        result = await emailService.notifySystemEvent(
          'Email Test', 
          'This is a test notification from the admin panel',
          { 
            testedBy: user.email,
            timestamp: new Date().toISOString()
          }
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
