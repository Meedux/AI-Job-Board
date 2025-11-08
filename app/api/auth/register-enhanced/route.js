import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { USER_ROLES } from '@/utils/roleSystem';
import emailItService from '@/utils/emailItService';
import { logUserAction, logEmailNotification, logError, getRequestInfo } from '@/utils/dataLogger';

const prisma = new PrismaClient();

// JWT Secret with fallback with the actual value since i have no clue how JWT works lmao
const JWT_SECRET = process.env.JWT_SECRET || 'dd9e380d50f8d5365a41e90e664b0237';

export async function POST(request) {
  const startTime = Date.now();
  const { userAgent, ipAddress } = getRequestInfo(request);
  
  try {
    const { 
      email, 
      password, 
      fullName, 
      companyName,
      companyType,
      employerCategory,
      role, 
      userType,
      taxId,
      authorizedRepresentatives,
      employerTypeId,
      verificationDocuments,
      enableTwoFactor,
      captchaToken 
    } = await request.json();

    console.log('🚀 Enhanced registration API called for:', userType);

    // Validate required fields
    if (!email || !password) {
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
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Validate user type specific fields
    if (userType === 'jobseeker' && !fullName?.trim()) {
      return NextResponse.json(
        { error: 'Full name is required for job seekers' },
        { status: 400 }
      );
    }

    if (userType === 'hirer' && !companyName?.trim()) {
      return NextResponse.json(
        { error: 'Company name is required for hirers' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // TODO: Verify captcha token in production
    // if (captchaToken && process.env.NODE_ENV === 'production') {
    //   const captchaValid = await verifyCaptcha(captchaToken);
    //   if (!captchaValid) {
    //     return NextResponse.json(
    //       { error: 'Captcha verification failed' },
    //       { status: 400 }
    //     );
    //   }
    // }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      await logUserAction(
        null,
        email,
        'REGISTRATION_FAILED',
        'User already exists',
        ipAddress,
        userAgent,
        'failed'
      );
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate email verification token
    const verificationToken = jwt.sign(
      { email, timestamp: Date.now() },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Determine user role and type
    const userRole = role || (userType === 'hirer' ? USER_ROLES.EMPLOYER_ADMIN : USER_ROLES.JOB_SEEKER);
    
    // Create user data
    const userData = {
      email,
      password: hashedPassword,
      fullName: fullName || companyName,
      role: userRole,
      isActive: false, // User must verify email first
      accountStatus: 'pending_verification', // Require email verification
      emailVerificationToken: verificationToken,
      createdAt: new Date(),
      updatedAt: new Date(),
      // Default permissions based on role
      permissions: userRole === USER_ROLES.EMPLOYER_ADMIN ? [
        'view_jobs', 'post_jobs', 'view_resumes', 'download_resumes', 
        'view_applications', 'manage_applications', 'use_ai_features'
      ] : userRole === USER_ROLES.JOB_SEEKER ? [
        'view_jobs', 'apply_to_jobs', 'use_ai_features'
      ] : []
    };

    // Add hirer-specific fields
    if (userType === 'hirer') {
      userData.companyName = companyName;
      userData.companyType = companyType || null;
      userData.employerCategory = employerCategory || null;
      userData.taxId = taxId || null;
      userData.employerTypeId = employerTypeId || null;
      // Give hirers default credits
      userData.allocatedResumeCredits = 50;
      userData.allocatedAiCredits = 25;
      userData.usedResumeCredits = 0;
      userData.usedAiCredits = 0;
    } else {
      // Job seekers get basic credits
      userData.allocatedResumeCredits = 5;
      userData.allocatedAiCredits = 10;
      userData.usedResumeCredits = 0;
      userData.usedAiCredits = 0;
    }

    // Create user
    const newUser = await prisma.user.create({
      data: userData,
      select: {
        id: true,
        email: true,
        fullName: true,
        companyName: true,
        role: true,
        isActive: true,
        accountStatus: true,
        permissions: true,
        allocatedResumeCredits: true,
        allocatedAiCredits: true,
        createdAt: true
      }
    });

    // If authorized representatives were provided, create records
    if (userType === 'hirer' && Array.isArray(authorizedRepresentatives) && authorizedRepresentatives.length > 0) {
      for (const ar of authorizedRepresentatives) {
        await prisma.authorizedRepresentative.create({
          data: {
            userId: newUser.id,
            name: ar.name,
            email: ar.email,
            designation: ar.designation || null,
            phone: ar.phone || null,
            documentId: ar.documentId || null
          }
        });
      }
    }

    // If verification documents were uploaded, link them to the user
    if (userType === 'hirer' && Array.isArray(verificationDocuments) && verificationDocuments.length > 0) {
      for (const doc of verificationDocuments) {
        await prisma.verificationDocument.update({
          where: { id: doc.id },
          data: {
            userId: newUser.id,
            category: doc.category
          }
        });
      }
    }
    console.log('✅ User created successfully:', newUser.id);

    // Log successful registration
    await logUserAction(
      newUser.id,
      email,
      'REGISTRATION_SUCCESS',
      `User registered as ${userType}`,
      ipAddress,
      userAgent,
      'success'
    );

    // Send verification email using external service
    try {
      const emailResult = await emailItService.sendVerificationEmail(email, verificationToken, fullName || companyName, request);
      
      if (emailResult.success) {
        console.log('📧 Verification email sent via external service:', emailResult.messageId);
        
        // Log successful email sending
        await logEmailNotification(
          'email_verification',
          email,
          'Email Verification',
          'sent',
          'mailgun',
          emailResult.messageId
        );
      } else {
        console.error('❌ Failed to send verification email:', emailResult.message);
        
        // Log failed email sending but don't fail registration
        await logEmailNotification(
          'email_verification',
          email,
          'Email Verification',
          'failed',
          'mailgun',
          null,
          emailResult.message
        );
        
        await logError(
          'EMAIL_VERIFICATION_SEND_ERROR',
          'auth/register-enhanced',
          emailResult.message,
          null,
          newUser.id,
          { email, service: 'mailgun' },
          'warning'
        );
      }
    } catch (emailError) {
      console.error('❌ Email service error:', emailError);
      
      await logError(
        'EMAIL_SERVICE_ERROR',
        'auth/register-enhanced',
        emailError.message,
        emailError.stack,
        newUser.id,
        { email, service: 'mailgun' },
        'error'
      );
    }

    // Create response without login token (user needs to verify email first)
    const response = NextResponse.json({
      success: true,
      message: 'Registration successful! Please check your email to verify your account before logging in.',
      user: {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.fullName,
        companyName: newUser.companyName,
        role: newUser.role,
        isActive: newUser.isActive,
        accountStatus: newUser.accountStatus,
        permissions: newUser.permissions,
        allocatedResumeCredits: newUser.allocatedResumeCredits,
        allocatedAiCredits: newUser.allocatedAiCredits,
        createdAt: newUser.createdAt
      },
      requiresVerification: true
    });

    const endTime = Date.now();
    console.log(`✅ Registration completed in ${endTime - startTime}ms - user must verify email`);

    return response;

  } catch (error) {
    console.error('Registration error:', error);
    
    await logUserAction(
      null,
      'unknown',
      'REGISTRATION_ERROR',
      error.message,
      ipAddress,
      userAgent,
      'error'
    );
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
