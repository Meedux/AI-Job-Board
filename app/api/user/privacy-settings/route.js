// API Route for Privacy Settings
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        showSensitiveInfo: true,
        profileVisibility: true,
        hideProfile: true,
        emailNotifications: true,
        jobAlerts: true,
        resumeAlerts: true,
        marketingEmails: true,
        preferences: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching privacy settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate the request body
    const allowedFields = [
      'showSensitiveInfo',
      'profileVisibility',
      'hideProfile',
      'hideContactInfo',
      'hideEmail',
      'hidePhone',
      'hideAddress',
      'dataRetention',
      'marketingOptIn'
    ];

    const updateData = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: updateData
    });

    // Also update or create user preferences
    if (body.preferences) {
      await prisma.userPreference.upsert({
        where: { userId: user.id },
        update: {
          hideContactInfo: body.hideContactInfo,
          hideEmail: body.hideEmail,
          hidePhone: body.hidePhone,
          hideAddress: body.hideAddress,
          dataRetention: body.dataRetention,
          marketingOptIn: body.marketingOptIn
        },
        create: {
          userId: user.id,
          hideContactInfo: body.hideContactInfo || true,
          hideEmail: body.hideEmail || true,
          hidePhone: body.hidePhone || true,
          hideAddress: body.hideAddress || true,
          dataRetention: body.dataRetention || true,
          marketingOptIn: body.marketingOptIn || false
        }
      });
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Error updating privacy settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
