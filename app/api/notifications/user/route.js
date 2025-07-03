import { NextResponse } from 'next/server';
import { verifyToken } from '../../../../utils/auth';
import { logAPIRequest, logError, getRequestInfo } from '../../../../utils/dataLogger';
import { 
  createNotification,
  getNotifications,
  NOTIFICATION_TYPES,
  CATEGORIES,
  PRIORITY
} from '../../../../utils/notificationService';

export async function GET(request) {
  const startTime = Date.now();
  const { userAgent, ipAddress } = getRequestInfo(request);
  let userId = null;
  
  try {
    // Log API request
    await logAPIRequest('GET', '/api/notifications/user', null, ipAddress);
    
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

    userId = user.uid;

    // Get user notifications (non-admin only)
    const userNotifications = getNotifications(false, user.uid);

    // Log successful API response
    const responseTime = Date.now() - startTime;
    await logAPIRequest(
      'GET',
      '/api/notifications/user',
      userId,
      ipAddress,
      200,
      responseTime
    );

    return NextResponse.json({
      notifications: userNotifications
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching user notifications:', error);
    
    // Log error
    await logError(
      'USER_NOTIFICATIONS_ERROR',
      'notifications/user',
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
      '/api/notifications/user',
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
    await logAPIRequest('POST', '/api/notifications/user', null, ipAddress);

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

    userId = user.uid;

    const body = await request.json();
    const { 
      type, 
      title, 
      message, 
      category = CATEGORIES.USER,
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
      userId: user.uid,
      userEmail: user.email,
      metadata,
      ipAddress
    });

    // Log successful API response
    const responseTime = Date.now() - startTime;
    await logAPIRequest(
      'POST',
      '/api/notifications/user',
      userId,
      ipAddress,
      201,
      responseTime
    );

    return NextResponse.json({
      notification: newNotification
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating user notification:', error);
    
    // Log error
    await logError(
      'USER_CREATE_NOTIFICATION_ERROR',
      'notifications/user',
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
      '/api/notifications/user',
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
