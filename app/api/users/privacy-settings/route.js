import { NextResponse } from 'next/server';
import { verifyToken } from '../../../../utils/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    // Get token from cookies
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token
    const userFromToken = verifyToken(token);
    if (!userFromToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userFromToken.id },
      include: {
        preferences: true,
        notificationSettings: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Merge user data with preferences
    const privacySettings = {
      showSensitiveInfo: user.showSensitiveInfo,
      profileVisibility: user.profileVisibility,
      hideProfile: user.hideProfile,
      hideContactInfo: user.preferences?.hideContactInfo ?? true,
      hideEmail: user.preferences?.hideEmail ?? true,
      hidePhone: user.preferences?.hidePhone ?? true,
      hideAddress: user.preferences?.hideAddress ?? true,
      emailNotifications: user.emailNotifications,
      jobAlerts: user.jobAlerts,
      resumeAlerts: user.resumeAlerts,
      marketingEmails: user.marketingEmails,
      accountStatus: user.preferences?.accountStatus ?? 'active',
    };

    return NextResponse.json(privacySettings);
  } catch (error) {
    console.error('Error fetching privacy settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    // Get token from cookies
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token
    const userFromToken = verifyToken(token);
    if (!userFromToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updates = await request.json();
    const userId = userFromToken.id;

    // Separate user table updates from preferences updates
    const userUpdates = {};
    const preferenceUpdates = {};

    // User table fields
    if ('showSensitiveInfo' in updates) userUpdates.showSensitiveInfo = updates.showSensitiveInfo;
    if ('profileVisibility' in updates) userUpdates.profileVisibility = updates.profileVisibility;
    if ('hideProfile' in updates) userUpdates.hideProfile = updates.hideProfile;
    if ('emailNotifications' in updates) userUpdates.emailNotifications = updates.emailNotifications;
    if ('jobAlerts' in updates) userUpdates.jobAlerts = updates.jobAlerts;
    if ('resumeAlerts' in updates) userUpdates.resumeAlerts = updates.resumeAlerts;
    if ('marketingEmails' in updates) userUpdates.marketingEmails = updates.marketingEmails;

    // Preference table fields
    if ('hideContactInfo' in updates) preferenceUpdates.hideContactInfo = updates.hideContactInfo;
    if ('hideEmail' in updates) preferenceUpdates.hideEmail = updates.hideEmail;
    if ('hidePhone' in updates) preferenceUpdates.hidePhone = updates.hidePhone;
    if ('hideAddress' in updates) preferenceUpdates.hideAddress = updates.hideAddress;
    if ('accountStatus' in updates) preferenceUpdates.accountStatus = updates.accountStatus;

    // Update user table
    if (Object.keys(userUpdates).length > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: userUpdates,
      });
    }

    // Update or create preferences
    if (Object.keys(preferenceUpdates).length > 0) {
      await prisma.userPreference.upsert({
        where: { userId },
        update: preferenceUpdates,
        create: {
          userId,
          ...preferenceUpdates,
        },
      });
    }

    // Log the privacy update
    await prisma.dataProcessingLog.create({
      data: {
        userId,
        action: 'privacy_update',
        details: { updates },
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent'),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating privacy settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
