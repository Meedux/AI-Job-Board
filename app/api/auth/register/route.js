import { NextResponse } from 'next/server';
import { db } from '../../../../utils/db';
import { hashPassword, generateToken, generateUID, isValidEmail, isValidPassword, calculateAge, sanitizeInput } from '../../../../utils/auth';
import { sendVerificationEmail } from '../../../../utils/externalEmailService';
import { logUserAction, logSystemEvent, logAPIRequest, logEmailNotification, logError, getRequestInfo } from '../../../../utils/dataLogger';
import { notifyUserRegistration } from '../../../../utils/notificationService';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

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
    const existingUser = await db.users.findByEmail(email);
    if (existingUser) {
      console.log('❌ User already exists');
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    console.log('✅ User does not exist, proceeding with registration');
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

    console.log('🎫 Generating email verification token...');
    // Generate email verification token
    const verificationToken = jwt.sign(
      { email, timestamp: Date.now() },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    console.log('✅ Verification token generated');

    console.log('🧹 Sanitizing inputs...');
    // Sanitize inputs and prepare user data
    const userData = {
      uid: uid, // Keep for backward compatibility
      fullName: sanitizeInput(fullName),
      nickname: sanitizeInput(nickname || ''),
      email: sanitizeInput(email),
      password: hashedPassword,
      age: age,
      dateOfBirth: new Date(dateOfBirth),
      fullAddress: sanitizeInput(fullAddress || ''),
      role: 'user',
      isActive: false, // User must verify email first
      accountStatus: 'pending_verification',
      emailVerificationToken: verificationToken
    };
    console.log('✅ User data prepared:', { ...userData, password: '[HIDDEN]', emailVerificationToken: '[HIDDEN]' });

    console.log('� Creating user in database...');
    // Create user in database
    const newUser = await db.users.create(userData);
    console.log('✅ User created successfully:', { ...newUser, password: '[HIDDEN]' });

    // Log successful user registration
    await logUserAction(
      newUser.uid || newUser.id,
      newUser.email,
      'USER_REGISTRATION',
      `User registered: ${newUser.fullName}`,
      ipAddress,
      userAgent,
      'success'
    );

    // Log system event
    await logSystemEvent(
      'USER_REGISTRATION',
      'auth/register',
      `New user registered: ${newUser.fullName} (${newUser.email})`,
      'info',
      { uid: newUser.uid, id: newUser.id, age: newUser.age }
    );

    // Store user ID for logging
    userId = newUser.uid || newUser.id;

    console.log('📧 Sending email verification...');
    // Send email verification using external service
    try {
      const emailResult = await sendVerificationEmail(newUser.email, verificationToken, newUser.fullName);
      
      if (emailResult.success) {
        console.log('✅ Verification email sent successfully via external service');
        
        // Log successful email sending
        await logEmailNotification(
          'email_verification',
          newUser.email,
          'Email Verification',
          'sent',
          'sendgrid',
          emailResult.messageId
        );
      } else {
        console.error('❌ Failed to send verification email:', emailResult.message);
        
        // Log failed email sending but don't fail registration
        await logEmailNotification(
          'email_verification',
          newUser.email,
          'Email Verification',
          'failed',
          'sendgrid',
          null,
          emailResult.message
        );
        
        await logError(
          'EMAIL_VERIFICATION_SEND_ERROR',
          'auth/register',
          emailResult.message,
          null,
          userId,
          { email: newUser.email, service: 'sendgrid' },
          'warning'
        );
      }
    } catch (emailError) {
      console.error('❌ Email service error:', emailError);
      
      await logError(
        'EMAIL_SERVICE_ERROR',
        'auth/register',
        emailError.message,
        emailError.stack,
        userId,
        { email: newUser.email, service: 'sendgrid' },
        'error'
      );
    }

    // Create response without token (user needs to verify email first)
    const response = NextResponse.json(
      { 
        message: 'Registration successful! Please check your email to verify your account before logging in.',
        user: {
          id: newUser.id,
          uid: newUser.uid,
          fullName: newUser.fullName,
          nickname: newUser.nickname,
          email: newUser.email,
          age: newUser.age,
          dateOfBirth: newUser.dateOfBirth,
          fullAddress: newUser.fullAddress,
          role: newUser.role,
          isActive: newUser.isActive,
          accountStatus: newUser.accountStatus
        },
        requiresVerification: true
      },
      { status: 201 }
    );

    console.log('✅ Registration completed - user must verify email before login');
    
    // Send registration notification using the new notification service
    try {
      await notifyUserRegistration(newUser.email, newUser.uid || newUser.id, ipAddress);
      console.log('📱 Registration notification sent');
    } catch (error) {
      console.error('Failed to send registration notification:', error);
      // Log the error but don't fail the registration
      await logError(
        'REGISTRATION_NOTIFICATION_ERROR',
        'auth/register',
        error.message,
        error.stack,
        newUser.uid || newUser.id,
        { email: newUser.email },
        'error'
      );
    }
    
    // Send email notification to admins (async, don't wait)
    emailService.notifyNewUserRegistration(newUser)
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
