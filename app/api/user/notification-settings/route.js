// API Route for Notification Settings
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
        emailNotifications: true,
        jobAlerts: true,
        resumeAlerts: true,
        marketingEmails: true,
        notificationSettings: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const settings = user.notificationSettings || {};
    
    return NextResponse.json({
      emailNotifications: user.emailNotifications,
      jobAlerts: user.jobAlerts,
      resumeAlerts: user.resumeAlerts,
      marketingEmails: user.marketingEmails,
      emailJobAlerts: settings.emailJobAlerts || true,
      emailResumeAlerts: settings.emailResumeAlerts || true,
      emailApplications: settings.emailApplications || true,
      emailMessages: settings.emailMessages || true,
      emailAnnouncements: settings.emailAnnouncements || true,
      emailMarketing: settings.emailMarketing || false,
      pushJobAlerts: settings.pushJobAlerts || true,
      pushApplications: settings.pushApplications || true,
      pushMessages: settings.pushMessages || true
    });
  } catch (error) {
    console.error('Error fetching notification settings:', error);
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
    
    // Update user's basic notification settings
    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        emailNotifications: body.emailNotifications,
        jobAlerts: body.jobAlerts,
        resumeAlerts: body.resumeAlerts,
        marketingEmails: body.marketingEmails
      }
    });

    // Update detailed notification settings
    await prisma.notificationSetting.upsert({
      where: { userId: user.id },
      update: {
        emailJobAlerts: body.emailJobAlerts,
        emailResumeAlerts: body.emailResumeAlerts,
        emailApplications: body.emailApplications,
        emailMessages: body.emailMessages,
        emailAnnouncements: body.emailAnnouncements,
        emailMarketing: body.emailMarketing,
        pushJobAlerts: body.pushJobAlerts,
        pushApplications: body.pushApplications,
        pushMessages: body.pushMessages
      },
      create: {
        userId: user.id,
        emailJobAlerts: body.emailJobAlerts || true,
        emailResumeAlerts: body.emailResumeAlerts || true,
        emailApplications: body.emailApplications || true,
        emailMessages: body.emailMessages || true,
        emailAnnouncements: body.emailAnnouncements || true,
        emailMarketing: body.emailMarketing || false,
        pushJobAlerts: body.pushJobAlerts || true,
        pushApplications: body.pushApplications || true,
        pushMessages: body.pushMessages || true
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating notification settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
