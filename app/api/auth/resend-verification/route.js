import { NextResponse } from 'next/server';
import { db } from '../../../../utils/db';
import { sendVerificationEmail } from '../../../../utils/externalEmailService';
import { logUserAction, logAPIRequest, logEmailNotification, logError, getRequestInfo } from '../../../../utils/dataLogger';
import { isValidEmail } from '../../../../utils/auth';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request) {
  console.log('📧 Resend verification API called');
  const startTime = Date.now();
  let userId = null;
  const { userAgent, ipAddress } = getRequestInfo(request);
  
  try {
    // Log API request
    await logAPIRequest('POST', '/api/auth/resend-verification', null, ipAddress);
    
    const body = await request.json();
    console.log('📋 Resend verification request for email:', body.email);
    
    const { email } = body;

    // Validate required fields
    if (!email) {
      console.log('❌ Missing email');
      return NextResponse.json(
        { error: 'Email is required' },
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
      // For security, don't reveal that the user doesn't exist
      return NextResponse.json(
        { message: 'If an account with this email exists and requires verification, a new verification email has been sent.' },
        { status: 200 }
      );
    }

    userId = user.uid || user.id;
    console.log('👤 User found:', { id: userId, email: user.email, isActive: user.isActive, accountStatus: user.accountStatus });
    
    // Check if user is already verified
    if (user.isActive && user.accountStatus !== 'pending_verification') {
      console.log('✅ User account is already verified');
      await logUserAction(
        userId,
        email,
        'RESEND_VERIFICATION_ATTEMPTED',
        'Account already verified',
        ipAddress,
        userAgent,
        'info'
      );
      return NextResponse.json(
        { message: 'Your account is already verified. You can log in normally.' },
        { status: 200 }
      );
    }
    
    // Check if user requires verification
    if (user.accountStatus !== 'pending_verification') {
      console.log('❌ User account does not require email verification');
      await logUserAction(
        userId,
        email,
        'RESEND_VERIFICATION_FAILED',
        'Account does not require verification',
        ipAddress,
        userAgent,
        'failed'
      );
      return NextResponse.json(
        { error: 'Account does not require email verification. Please contact support if you cannot log in.' },
        { status: 400 }
      );
    }

    console.log('🎫 Generating new verification token...');
    // Generate new email verification token
    const verificationToken = jwt.sign(
      { email, timestamp: Date.now() },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('💾 Updating user with new verification token...');
    // Update user with new verification token
    await db.users.updateByEmail(email, {
      emailVerificationToken: verificationToken,
      updatedAt: new Date()
    });

    console.log('📧 Sending new verification email...');
    // Send verification email using external service
    try {
      const emailResult = await sendVerificationEmail(user.email, verificationToken, user.fullName);
      
      if (emailResult.success) {
        console.log('✅ Verification email sent successfully via external service:', emailResult.messageId);
        
        // Log successful email sending
        await logEmailNotification(
          'email_verification_resend',
          user.email,
          'Email Verification Resend',
          'sent',
          'mailgun',
          emailResult.messageId
        );
        
        // Log successful action
        await logUserAction(
          userId,
          email,
          'RESEND_VERIFICATION_SUCCESS',
          'New verification email sent',
          ipAddress,
          userAgent,
          'success'
        );
      } else {
        console.error('❌ Failed to send verification email:', emailResult.message);
        
        // Log failed email sending
        await logEmailNotification(
          'email_verification_resend',
          user.email,
          'Email Verification Resend',
          'failed',
          'mailgun',
          null,
          emailResult.message
        );
        
        await logError(
          'EMAIL_VERIFICATION_RESEND_ERROR',
          'auth/resend-verification',
          emailResult.message,
          null,
          userId,
          { email: user.email, service: 'mailgun' },
          'error'
        );
        
        return NextResponse.json(
          { error: 'Failed to send verification email. Please try again later.' },
          { status: 500 }
        );
      }
    } catch (emailError) {
      console.error('❌ Email service error:', emailError);
      
      await logError(
        'EMAIL_SERVICE_ERROR',
        'auth/resend-verification',
        emailError.message,
        emailError.stack,
        userId,
        { email: user.email, service: 'mailgun' },
        'error'
      );
      
      return NextResponse.json(
        { error: 'Failed to send verification email. Please try again later.' },
        { status: 500 }
      );
    }

    // Log final API response
    const responseTime = Date.now() - startTime;
    await logAPIRequest(
      'POST',
      '/api/auth/resend-verification',
      userId,
      ipAddress,
      200,
      responseTime
    );

    return NextResponse.json(
      { message: 'A new verification email has been sent to your email address. Please check your inbox and spam folder.' },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('❌ Resend verification error:', error);
    console.error('❌ Error stack:', error.stack);
    
    // Log error
    await logError(
      'RESEND_VERIFICATION_ERROR',
      'auth/resend-verification',
      error.message,
      error.stack,
      userId,
      { email: body?.email },
      'error'
    );
    
    // Log failed API response
    const responseTime = Date.now() - startTime;
    await logAPIRequest(
      'POST',
      '/api/auth/resend-verification',
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
