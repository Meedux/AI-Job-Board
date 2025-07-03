import { NextResponse } from 'next/server';
import { addUserToSheet, getUserByEmail } from '../../../../utils/googleApi';
import { hashPassword, generateToken, generateUID, isValidEmail, isValidPassword, calculateAge, sanitizeInput } from '../../../../utils/auth';
import { emailService } from '../../../../utils/emailService';
import { logUserAction, logSystemEvent, logAPIRequest, logEmailNotification, logError, getRequestInfo } from '../../../../utils/dataLogger';
import { notifyUserRegistration } from '../../../../utils/notificationService';

const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID;

export async function POST(request) {
  console.log('🚀 Registration API called');
  const startTime = Date.now();
  let userId = null;
  const { userAgent, ipAddress } = getRequestInfo(request);
  
  try {
    // Log API request
    await logAPIRequest('POST', '/api/auth/register', null, ipAddress);
    
    const body = await request.json();
    console.log('📋 Received registration data:', { ...body, password: '[HIDDEN]' });
    const { fullName, nickname, email, password, dateOfBirth, fullAddress } = body;

    console.log('🔍 Validating required fields...');
    // Validate required fields
    if (!fullName || !email || !password || !dateOfBirth) {
      console.log('❌ Missing required fields');
      await logUserAction(
        null,
        email || 'unknown',
        'REGISTRATION_FAILED',
        'Missing required fields',
        ipAddress,
        userAgent,
        'failed'
      );
      return NextResponse.json(
        { error: 'Full name, email, password, and date of birth are required' },
        { status: 400 }
      );
    }

    console.log('✅ Required fields present');
    console.log('🔍 Validating email format...');
    // Validate email format
    if (!isValidEmail(email)) {
      console.log('❌ Invalid email format');
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    console.log('✅ Email format valid');
    console.log('🔍 Validating password strength...');
    // Validate password strength
    if (!isValidPassword(password)) {
      console.log('❌ Password does not meet requirements');
      return NextResponse.json(
        { error: 'Password must be at least 8 characters with uppercase, lowercase, and number' },
        { status: 400 }
      );
    }

    console.log('✅ Password meets requirements');
    console.log('🔍 Validating date of birth...');
    // Validate date of birth
    const birthDate = new Date(dateOfBirth);
    if (isNaN(birthDate.getTime())) {
      console.log('❌ Invalid date of birth format');
      return NextResponse.json(
        { error: 'Invalid date of birth format' },
        { status: 400 }
      );
    }

    console.log('✅ Date of birth valid');
    console.log('🔍 Checking if user already exists...');
    // Check if user already exists
    const existingUser = await getUserByEmail(SPREADSHEET_ID, email);
    if (existingUser) {
      console.log('❌ User already exists');
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }    console.log('✅ User does not exist, proceeding with registration');
    console.log('🔢 Calculating age...');
    // Calculate age
    const age = calculateAge(dateOfBirth);
    console.log('✅ Age calculated:', age);

    console.log('🆔 Generating unique ID...');
    // Generate unique ID
    const uid = generateUID();
    console.log('✅ UID generated:', uid);

    console.log('🔐 Hashing password...');
    // Hash password (we'll store this separately or use a different approach)
    const hashedPassword = await hashPassword(password);
    console.log('✅ Password hashed successfully');

    console.log('🧹 Sanitizing inputs...');
    // Sanitize inputs
    const userData = {
      uid,
      fullName: sanitizeInput(fullName),
      nickname: sanitizeInput(nickname || ''),
      email: sanitizeInput(email),
      age: age.toString(),
      dateOfBirth: dateOfBirth,
      fullAddress: sanitizeInput(fullAddress || ''),
      password: hashedPassword // Note: We need to store this somewhere secure
    };
    console.log('✅ User data prepared:', { ...userData, hashedPassword: '[HIDDEN]' });

    console.log('📊 Adding user to Google Sheets...');
    // Add user to sheet (excluding password for now)
    await addUserToSheet(SPREADSHEET_ID, userData);
    console.log('✅ User added to sheet successfully');

    // Log successful user registration
    await logUserAction(
      userData.uid,
      userData.email,
      'USER_REGISTRATION',
      `User registered: ${userData.fullName}`,
      ipAddress,
      userAgent,
      'success'
    );

    // Log system event
    await logSystemEvent(
      'USER_REGISTRATION',
      'auth/register',
      `New user registered: ${userData.fullName} (${userData.email})`,
      'info',
      { uid: userData.uid, age: userData.age }
    );

    console.log('🎫 Generating JWT token...');
    // Generate JWT token
    const token = generateToken(userData);
    console.log('✅ Token generated successfully');

    // Store user ID for logging
    userId = userData.uid;

    // Create response with token
    const response = NextResponse.json(
      { 
        message: 'User registered successfully',
        user: {
          uid: userData.uid,
          fullName: userData.fullName,
          nickname: userData.nickname,
          email: userData.email,
          age: userData.age
        }
      },
      { status: 201 }
    );

    console.log('🍪 Setting authentication cookie...');
    // Set HTTP-only cookie with token
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    console.log('✅ Registration completed successfully');
    
    // Send registration notification using the new notification service
    try {
      await notifyUserRegistration(userData.email, userData.uid, ipAddress);
      console.log('📱 Registration notification sent');
    } catch (error) {
      console.error('Failed to send registration notification:', error);
      // Log the error but don't fail the registration
      await logError(
        'REGISTRATION_NOTIFICATION_ERROR',
        'auth/register',
        error.message,
        error.stack,
        userData.uid,
        { email: userData.email },
        'error'
      );
    }
    
    // Send email notification to admins (async, don't wait)
    emailService.notifyNewUserRegistration(userData)
      .then(() => {
        // Log successful email notification
        logEmailNotification(
          'user_registration',
          'admin@getgethired.com',
          'New User Registration',
          'success',
          'nodemailer'
        ).catch(console.error);
      })
      .catch(error => {
        console.error('Failed to send admin notification email:', error);
        // Log failed email notification
        logEmailNotification(
          'user_registration',
          'admin@getgethired.com',
          'New User Registration',
          'failed',
          'nodemailer',
          null,
          error.message
        ).catch(console.error);
      });
    
    // Log final API response
    const responseTime = Date.now() - startTime;
    await logAPIRequest(
      'POST',
      '/api/auth/register',
      userId,
      ipAddress,
      201,
      responseTime
    );
    
    return response;
  } catch (error) {
    console.error('❌ Registration error:', error);
    console.error('❌ Error stack:', error.stack);
    
    // Log error
    await logError(
      'REGISTRATION_ERROR',
      'auth/register',
      error.message,
      error.stack,
      userId,
      { email, fullName },
      'error'
    );
    
    // Log failed API response
    const responseTime = Date.now() - startTime;
    await logAPIRequest(
      'POST',
      '/api/auth/register',
      userId,
      ipAddress,
      500,
      responseTime
    );
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
