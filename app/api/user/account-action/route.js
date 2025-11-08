// API Route for Account Actions (Deactivate/Delete)
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

import { logSystemEvent } from '../../../../utils/dataLogger';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;
    
    if (!['deactivate', 'delete'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (action === 'deactivate') {
      // Deactivate account
      await prisma.user.update({
        where: { id: user.id },
        data: { 
          isActive: false,
          updatedAt: new Date()
        }
      });

      // Log the deactivation
      await logSystemEvent(
        'user_account_deactivated',
        `User ${user.email} deactivated their account`,
        { userId: user.id, email: user.email }
      );

      return NextResponse.json({ 
        success: true, 
        message: 'Account deactivated successfully' 
      });
    }

    if (action === 'delete') {
      // Before deleting, we need to handle related data
      // This is a soft delete - we'll mark the user as deleted but keep data for compliance
      await prisma.user.update({
        where: { id: user.id },
        data: { 
          isActive: false,
          email: `deleted_${user.id}@deleted.com`, // Change email to prevent conflicts
          fullName: 'Deleted User',
          fullAddress: null,
          updatedAt: new Date()
        }
      });

      // Update user preferences to hide all information
      await prisma.userPreference.upsert({
        where: { userId: user.id },
        update: {
          hideContactInfo: true,
          hideEmail: true,
          hidePhone: true,
          hideAddress: true,
          accountStatus: 'deleted',
          dataRetention: false,
          marketingOptIn: false
        },
        create: {
          userId: user.id,
          hideContactInfo: true,
          hideEmail: true,
          hidePhone: true,
          hideAddress: true,
          accountStatus: 'deleted',
          dataRetention: false,
          marketingOptIn: false
        }
      });

      // Disable all notifications
      await prisma.notificationSetting.upsert({
        where: { userId: user.id },
        update: {
          emailJobAlerts: false,
          emailResumeAlerts: false,
          emailApplications: false,
          emailMessages: false,
          emailAnnouncements: false,
          emailMarketing: false,
          pushJobAlerts: false,
          pushApplications: false,
          pushMessages: false
        },
        create: {
          userId: user.id,
          emailJobAlerts: false,
          emailResumeAlerts: false,
          emailApplications: false,
          emailMessages: false,
          emailAnnouncements: false,
          emailMarketing: false,
          pushJobAlerts: false,
          pushApplications: false,
          pushMessages: false
        }
      });

      // Cancel any active subscriptions
      await prisma.userSubscription.updateMany({
        where: { 
          userId: user.id,
          status: 'active'
        },
        data: { 
          status: 'canceled',
          canceledAt: new Date()
        }
      });

      // Log the deletion
      await logSystemEvent(
        'user_account_deleted',
        `User ${user.email} deleted their account`,
        { userId: user.id, email: user.email }
      );

      return NextResponse.json({ 
        success: true, 
        message: 'Account deleted successfully' 
      });
    }

  } catch (error) {
    console.error('Error handling account action:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
