import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '../../../../utils/db';
import { generateToken, isValidEmail } from '../../../../utils/auth';
import { logUserAction, logAPIRequest, logError, getRequestInfo } from '../../../../utils/dataLogger';
import { notifyUserLogin, notifyAdminLogin } from '../../../../utils/notificationService';

export async function POST(request) {
  console.log('🔑 Login API called');
  const startTime = Date.now();
  let userId = null;
  const { userAgent, ipAddress } = getRequestInfo(request);
  
  try {
    // Log API request
    await logAPIRequest('POST', '/api/auth/login', null, ipAddress);
    
    const body = await request.json();
    console.log('📋 Login request for email:', body.email);
    
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      console.log('❌ Missing email or password');
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Validate email format
    if (!isValidEmail(email)) {
      console.log('❌ Invalid email format');
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    console.log('🔍 Looking up user in database...');
    // Get user from database
    const user = await db.users.findByEmail(email);
    if (!user) {
      console.log('❌ User not found in database');
      await logUserAction(
        null,
        email,
        'LOGIN_FAILED',
        'User not found',
        ipAddress,
        userAgent,
        'failed'
      );
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    console.log('👤 User found:', { ...user, password: '[HIDDEN]' });
    
    // Check if user is active
    if (!user.isActive) {
      console.log('❌ User account is inactive');
      await logUserAction(
        user.uid || user.id,
        email,
        'LOGIN_FAILED',
        'User account is inactive',
        ipAddress,
        userAgent,
        'failed'
      );
      return NextResponse.json(
        { error: 'Account is inactive. Please contact support.' },
        { status: 401 }
      );
    }
    
    // Verify password
    console.log('🔐 Verifying password...');
    if (!user.password) {
      console.log('❌ No password hash found for user');
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) {
      console.log('❌ Password verification failed');
      await logUserAction(
        user.uid || user.id,
        email,
        'LOGIN_FAILED',
        'Invalid password',
        ipAddress,
        userAgent,
        'failed'
      );
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    console.log('✅ Password verified successfully');

    // Store user ID for logging
    userId = user.uid || user.id;
    
    // Log successful login
    await logUserAction(
      user.uid || user.id,
      user.email,
      'USER_LOGIN',
      `User logged in: ${user.fullName || user.firstName + ' ' + user.lastName}`,
      ipAddress,
      userAgent,
      'success'
    );

    // Send notifications based on user type
    const adminDomains = ['getgethired.com'];
    const adminEmails = ['admin@getgethired.com', 'support@getgethired.com'];
    const emailLower = user.email.toLowerCase();
    const domain = emailLower.split('@')[1];
    const isAdmin = adminEmails.includes(emailLower) || adminDomains.includes(domain) || user.role === 'admin';

    if (isAdmin) {
      await notifyAdminLogin(user.email, ipAddress);
    } else {
      await notifyUserLogin(user.email, user.uid || user.id, ipAddress);
    }

    // Generate JWT token
    console.log('🎫 Creating JWT token...');
    const token = generateToken(user);

    // Create response
    console.log('📤 Sending successful login response');
    const response = NextResponse.json(
      { 
        success: true,
        message: 'Login successful',
        user: {
          id: user.id,
          uid: user.uid,
          fullName: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          nickname: user.nickname,
          email: user.email,
          age: user.age,
          dateOfBirth: user.dateOfBirth,
          fullAddress: user.fullAddress,
          role: user.role
        }
      },
      { status: 200 }
    );

    // Set HTTP-only cookie with token
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    // Log successful API response
    const responseTime = Date.now() - startTime;
    await logAPIRequest(
      'POST',
      '/api/auth/login',
      userId,
      ipAddress,
      200,
      responseTime
    );

    return response;
  } catch (error) {
    console.error('❌ Login error:', error);
    
    // Log error
    await logError(
      'LOGIN_ERROR',
      'auth/login',
      error.message,
      error.stack,
      userId,
      { email },
      'error'
    );
    
    // Log failed API response
    const responseTime = Date.now() - startTime;
    await logAPIRequest(
      'POST',
      '/api/auth/login',
      userId,
      ipAddress,
      500,
      responseTime
    );
    
    return NextResponse.json(
      { error: 'Login failed. Please try again.' },
      { status: 500 }
    );
  }
}
