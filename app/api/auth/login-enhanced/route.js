import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { logUserAction, getRequestInfo } from '@/utils/dataLogger';

const prisma = new PrismaClient();

// Track failed login attempts
const failedAttempts = new Map();

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

export async function POST(request) {
  const { userAgent, ipAddress } = getRequestInfo(request);
  
  try {
    const { email, password, captchaToken } = await request.json();

    console.log('🔐 Enhanced login attempt for:', email);

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Check for account lockout
    const attemptKey = `${email}_${ipAddress}`;
    const attempts = failedAttempts.get(attemptKey);
    
    if (attempts && attempts.count >= MAX_FAILED_ATTEMPTS) {
      const timeRemaining = LOCKOUT_DURATION - (Date.now() - attempts.lastAttempt);
      if (timeRemaining > 0) {
        await logUserAction(
          null,
          email,
          'LOGIN_BLOCKED',
          'Account temporarily locked due to failed attempts',
          ipAddress,
          userAgent,
          'blocked'
        );
        
        return NextResponse.json(
          { 
            error: `Account temporarily locked. Try again in ${Math.ceil(timeRemaining / 60000)} minutes.`,
            lockoutRemaining: timeRemaining 
          },
          { status: 429 }
        );
      } else {
        // Lockout expired, reset attempts
        failedAttempts.delete(attemptKey);
      }
    }

    // TODO: Verify captcha if provided
    // if (captchaToken && process.env.NODE_ENV === 'production') {
    //   const captchaValid = await verifyCaptcha(captchaToken);
    //   if (!captchaValid) {
    //     return NextResponse.json(
    //       { error: 'Captcha verification failed' },
    //       { status: 400 }
    //     );
    //   }
    // }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        parentUser: {
          select: {
            id: true,
            fullName: true,
            companyName: true
          }
        },
        subUsers: {
          select: {
            id: true,
            fullName: true,
            email: true,
            userType: true
          }
        }
      }
    });

    if (!user) {
      // Record failed attempt
      const currentAttempts = failedAttempts.get(attemptKey) || { count: 0, lastAttempt: 0 };
      failedAttempts.set(attemptKey, {
        count: currentAttempts.count + 1,
        lastAttempt: Date.now()
      });

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

    // Check if account is active
    if (!user.isActive || user.accountStatus === 'suspended') {
      await logUserAction(
        user.id,
        email,
        'LOGIN_BLOCKED',
        'Account inactive or suspended',
        ipAddress,
        userAgent,
        'blocked'
      );

      return NextResponse.json(
        { 
          error: 'Account is inactive or suspended. Please contact support.',
          accountStatus: user.accountStatus 
        },
        { status: 403 }
      );
    }

    // Verify password
    const passwordValid = await bcrypt.compare(password, user.password);
    
    if (!passwordValid) {
      // Record failed attempt
      const currentAttempts = failedAttempts.get(attemptKey) || { count: 0, lastAttempt: 0 };
      failedAttempts.set(attemptKey, {
        count: currentAttempts.count + 1,
        lastAttempt: Date.now()
      });

      await logUserAction(
        user.id,
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

    // Clear failed attempts on successful login
    failedAttempts.delete(attemptKey);

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        lastLoginAt: new Date(),
        updatedAt: new Date()
      }
    });

    // Log successful login
    await logUserAction(
      user.id,
      email,
      'LOGIN_SUCCESS',
      'User logged in successfully',
      ipAddress,
      userAgent,
      'success'
    );

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        role: user.role,
        userType: user.userType
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Prepare user data for response (exclude sensitive fields)
    const userData = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      companyName: user.companyName,
      role: user.role,
      userType: user.userType,
      employerType: user.employerType,
      isActive: user.isActive,
      accountStatus: user.accountStatus,
      permissions: user.permissions,
      allocatedResumeCredits: user.allocatedResumeCredits,
      allocatedAiCredits: user.allocatedAiCredits,
      usedResumeCredits: user.usedResumeCredits,
      usedAiCredits: user.usedAiCredits,
      lastLoginAt: user.lastLoginAt,
      parentUser: user.parentUser,
      subUsers: user.subUsers,
      createdAt: user.createdAt
    };

    // Set HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: userData,
      token
    });

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    console.log('✅ Login successful for:', email);

    return response;

  } catch (error) {
    console.error('Login error:', error);
    
    await logUserAction(
      null,
      'unknown',
      'LOGIN_ERROR',
      error.message,
      ipAddress,
      userAgent,
      'error'
    );

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
