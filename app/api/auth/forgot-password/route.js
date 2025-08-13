import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import emailItService from '@/utils/emailItService';
import { logUserAction, getRequestInfo } from '@/utils/dataLogger';

const prisma = new PrismaClient();

export async function POST(request) {
  const { userAgent, ipAddress } = getRequestInfo(request);
  
  try {
    const { email } = await request.json();

    console.log('🔑 Password reset requested for:', email);

    // Validate email
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        fullName: true,
        isActive: true,
        accountStatus: true
      }
    });

    // Always return success message for security (don't reveal if email exists)
    const successMessage = 'If an account with this email exists, you will receive a password reset link.';

    if (!user) {
      await logUserAction(
        null,
        email,
        'PASSWORD_RESET_REQUESTED',
        'Password reset requested for non-existent user',
        ipAddress,
        userAgent,
        'info'
      );

      return NextResponse.json({
        success: true,
        message: successMessage
      });
    }

    if (!user.isActive || user.accountStatus === 'suspended') {
      await logUserAction(
        user.id,
        email,
        'PASSWORD_RESET_BLOCKED',
        'Password reset requested for inactive account',
        ipAddress,
        userAgent,
        'blocked'
      );

      return NextResponse.json({
        success: true,
        message: successMessage
      });
    }

    // Generate password reset token
    const resetToken = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        timestamp: Date.now()
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' } // Token expires in 1 hour
    );

    // Store reset token in database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
        updatedAt: new Date()
      }
    });

    // Send password reset email
    try {
      await emailItService.sendPasswordResetEmail(user.email, resetToken, user.fullName);
      console.log('📧 Password reset email sent to:', user.email);
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      // Don't fail the request if email fails, but log it
      await logUserAction(
        user.id,
        email,
        'PASSWORD_RESET_EMAIL_FAILED',
        'Failed to send reset email',
        ipAddress,
        userAgent,
        'error'
      );
    }

    await logUserAction(
      user.id,
      email,
      'PASSWORD_RESET_REQUESTED',
      'Password reset token generated and sent',
      ipAddress,
      userAgent,
      'success'
    );

    return NextResponse.json({
      success: true,
      message: successMessage
    });

  } catch (error) {
    console.error('Password reset error:', error);
    
    await logUserAction(
      null,
      'unknown',
      'PASSWORD_RESET_ERROR',
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

export async function PUT(request) {
  const { userAgent, ipAddress } = getRequestInfo(request);
  
  try {
    const { token, newPassword } = await request.json();

    console.log('🔑 Password reset confirmation received');

    // Validate input
    if (!token || !newPassword) {
      return NextResponse.json(
        { error: 'Reset token and new password are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // Find user and check if token is still valid
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        passwordResetToken: true,
        passwordResetExpires: true,
        isActive: true,
        accountStatus: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid reset token' },
        { status: 400 }
      );
    }

    if (user.passwordResetToken !== token) {
      await logUserAction(
        user.id,
        user.email,
        'PASSWORD_RESET_FAILED',
        'Token mismatch',
        ipAddress,
        userAgent,
        'failed'
      );

      return NextResponse.json(
        { error: 'Invalid reset token' },
        { status: 400 }
      );
    }

    if (user.passwordResetExpires < new Date()) {
      await logUserAction(
        user.id,
        user.email,
        'PASSWORD_RESET_FAILED',
        'Token expired',
        ipAddress,
        userAgent,
        'failed'
      );

      return NextResponse.json(
        { error: 'Reset token has expired' },
        { status: 400 }
      );
    }

    // Hash new password
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
        updatedAt: new Date()
      }
    });

    await logUserAction(
      user.id,
      user.email,
      'PASSWORD_RESET_SUCCESS',
      'Password successfully reset',
      ipAddress,
      userAgent,
      'success'
    );

    console.log('✅ Password reset successful for:', user.email);

    return NextResponse.json({
      success: true,
      message: 'Password reset successful. You can now log in with your new password.'
    });

  } catch (error) {
    console.error('Password reset confirmation error:', error);
    
    await logUserAction(
      null,
      'unknown',
      'PASSWORD_RESET_ERROR',
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
