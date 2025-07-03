import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getUserByEmail } from '../../../../utils/googleApi';
import { generateToken, isValidEmail } from '../../../../utils/auth';
import { logUserAction, logAPIRequest, logError, getRequestInfo } from '../../../../utils/dataLogger';
import { notifyUserLogin, notifyAdminLogin } from '../../../../utils/notificationService';

const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID;

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

    console.log('🔍 Looking up user in Google Sheets...');
    // Get user from sheet
    const user = await getUserByEmail(SPREADSHEET_ID, email);
    if (!user) {
      console.log('❌ User not found in sheets');
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
    
    // Verify password against hashed password from column H
    console.log('🔐 Verifying password against hash from column H...');
    if (!user.password) {
      console.log('❌ No password hash found in sheet');
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) {
      console.log('❌ Password verification failed');
      await logUserAction(
        user?.uid || null,
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
    userId = user.uid;
    
    // Log successful login
    await logUserAction(
      user.uid,
      user.email,
      'USER_LOGIN',
      `User logged in: ${user.fullName}`,
      ipAddress,
      userAgent,
      'success'
    );

    // Send notifications based on user type
    const adminDomains = ['getgethired.com'];
    const adminEmails = ['admin@getgethired.com', 'support@getgethired.com'];
    const emailLower = user.email.toLowerCase();
    const domain = emailLower.split('@')[1];
    const isAdmin = adminEmails.includes(emailLower) || adminDomains.includes(domain);

    if (isAdmin) {
      await notifyAdminLogin(user.email, ipAddress);
    } else {
      await notifyUserLogin(user.email, user.uid, ipAddress);
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
          uid: user.uid,
          fullName: user.fullName,
          nickname: user.nickname,
          email: user.email,
          age: user.age,
          dateOfBirth: user.dateOfBirth,
          fullAddress: user.fullAddress
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
