import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { logUserAction, getRequestInfo } from '@/utils/dataLogger';

const prisma = new PrismaClient();

export async function GET(request) {
  const { userAgent, ipAddress } = getRequestInfo(request);
  
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    console.log('📧 Email verification requested');

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: decoded.email },
      select: {
        id: true,
        email: true,
        emailVerificationToken: true,
        isActive: true,
        accountStatus: true,
        fullName: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.emailVerificationToken !== token) {
      await logUserAction(
        user.id,
        user.email,
        'EMAIL_VERIFICATION_FAILED',
        'Token mismatch',
        ipAddress,
        userAgent,
        'failed'
      );

      return NextResponse.json(
        { error: 'Invalid verification token' },
        { status: 400 }
      );
    }

    if (user.accountStatus === 'active') {
      return NextResponse.json({
        success: true,
        message: 'Email already verified',
        alreadyVerified: true
      });
    }

    // Update user as verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isActive: true,
        accountStatus: 'active',
        emailVerificationToken: null,
        emailVerifiedAt: new Date(),
        updatedAt: new Date()
      }
    });

    await logUserAction(
      user.id,
      user.email,
      'EMAIL_VERIFICATION_SUCCESS',
      'Email successfully verified',
      ipAddress,
      userAgent,
      'success'
    );

    console.log('✅ Email verified for:', user.email);

    // Return HTML response for better UX
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Email Verified - JobSite</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background-color: #111827;
              color: #f9fafb;
              margin: 0;
              padding: 20px;
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .container {
              max-width: 400px;
              background-color: #1f2937;
              border-radius: 8px;
              padding: 32px;
              text-align: center;
              border: 1px solid #374151;
            }
            .success-icon {
              font-size: 48px;
              margin-bottom: 16px;
            }
            .title {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 16px;
              color: #10b981;
            }
            .message {
              margin-bottom: 24px;
              color: #d1d5db;
              line-height: 1.5;
            }
            .button {
              display: inline-block;
              background-color: #4f46e5;
              color: white;
              padding: 12px 24px;
              border-radius: 6px;
              text-decoration: none;
              font-weight: 500;
              transition: background-color 0.2s;
            }
            .button:hover {
              background-color: #4338ca;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="success-icon">✅</div>
            <h1 class="title">Email Verified!</h1>
            <p class="message">
              Your email has been successfully verified. 
              You can now access all features of your JobSite account.
            </p>
            <a href="/dashboard" class="button">Go to Dashboard</a>
          </div>
        </body>
      </html>
    `;

    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html' }
    });

  } catch (error) {
    console.error('Email verification error:', error);
    
    await logUserAction(
      null,
      'unknown',
      'EMAIL_VERIFICATION_ERROR',
      error.message,
      ipAddress,
      userAgent,
      'error'
    );

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Verification Failed - JobSite</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background-color: #111827;
              color: #f9fafb;
              margin: 0;
              padding: 20px;
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .container {
              max-width: 400px;
              background-color: #1f2937;
              border-radius: 8px;
              padding: 32px;
              text-align: center;
              border: 1px solid #374151;
            }
            .error-icon {
              font-size: 48px;
              margin-bottom: 16px;
            }
            .title {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 16px;
              color: #ef4444;
            }
            .message {
              margin-bottom: 24px;
              color: #d1d5db;
              line-height: 1.5;
            }
            .button {
              display: inline-block;
              background-color: #4f46e5;
              color: white;
              padding: 12px 24px;
              border-radius: 6px;
              text-decoration: none;
              font-weight: 500;
              transition: background-color 0.2s;
            }
            .button:hover {
              background-color: #4338ca;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="error-icon">❌</div>
            <h1 class="title">Verification Failed</h1>
            <p class="message">
              The verification link is invalid or has expired. 
              Please try requesting a new verification email.
            </p>
            <a href="/login" class="button">Back to Login</a>
          </div>
        </body>
      </html>
    `;

    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html' },
      status: 400
    });
  }
}

// New: verify via 6-digit code (POST)
export async function POST(request) {
  const { userAgent, ipAddress } = getRequestInfo(request);

  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json({ error: 'Email and code are required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        role: true,
        userType: true,
        accountStatus: true,
        emailVerificationToken: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.emailVerificationToken) {
      return NextResponse.json({ error: 'No verification code found for this account' }, { status: 400 });
    }

    const [storedCode, expiresAtRaw] = user.emailVerificationToken.split(':');
    const expiresAt = parseInt(expiresAtRaw || '0', 10);

    if (expiresAt && Date.now() > expiresAt) {
      return NextResponse.json({ error: 'Verification code has expired' }, { status: 400 });
    }

    if (storedCode !== code) {
      return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isActive: true,
        accountStatus: 'active',
        emailVerificationToken: null,
        emailVerifiedAt: new Date(),
        updatedAt: new Date()
      }
    });

    await logUserAction(
      user.id,
      user.email,
      'EMAIL_VERIFICATION_SUCCESS',
      'Email verified via 6-digit code',
      ipAddress,
      userAgent,
      'success'
    );

    const isEmployer = user.role === 'employer_admin' || user.role === 'employer_staff';
    const next = isEmployer ? '/onboarding/employer?next=/' : '/';

    return NextResponse.json({ success: true, next, role: user.role, userType: user.userType });
  } catch (error) {
    console.error('Email verification (code) error:', error);
    await logUserAction(
      null,
      'unknown',
      'EMAIL_VERIFICATION_ERROR',
      error.message,
      ipAddress,
      userAgent,
      'error'
    );
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
