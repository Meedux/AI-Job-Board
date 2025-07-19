import { NextResponse } from 'next/server';
import { prisma } from '../../../../utils/db';
import { getUserFromRequest } from '../../../../utils/auth';

export async function GET(request) {
  try {
    const user = getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user preferences and email subscription
    const [preferences, emailSubscription] = await Promise.all([
      prisma.userPreference.findFirst({
        where: { userId: user.id }
      }),
      prisma.emailSubscription.findFirst({
        where: { 
          userId: user.id,
          type: 'job_alerts',
          isActive: true
        }
      })
    ]);

    return NextResponse.json({
      success: true,
      preferences: preferences || {},
      hasJobAlerts: !!emailSubscription
    });
  } catch (error) {
    console.error('Error getting user preferences:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { job_alerts, ...preferences } = body;

    // Update or create user preferences
    await prisma.userPreference.upsert({
      where: { userId: user.id },
      update: {
        keywords: preferences.keywords || null,
        location: preferences.location || null,
        salaryMin: preferences.salary_min ? parseInt(preferences.salary_min) : null,
        salaryMax: preferences.salary_max ? parseInt(preferences.salary_max) : null,
        jobType: preferences.job_type || null,
        experienceLevel: preferences.experience_level || null,
        remoteOnly: preferences.remote_only || false,
        frequency: preferences.frequency || 'daily'
      },
      create: {
        userId: user.id,
        keywords: preferences.keywords || null,
        location: preferences.location || null,
        salaryMin: preferences.salary_min ? parseInt(preferences.salary_min) : null,
        salaryMax: preferences.salary_max ? parseInt(preferences.salary_max) : null,
        jobType: preferences.job_type || null,
        experienceLevel: preferences.experience_level || null,
        remoteOnly: preferences.remote_only || false,
        frequency: preferences.frequency || 'daily'
      }
    });

    // Handle job alerts subscription
    if (job_alerts) {
      await prisma.emailSubscription.upsert({
        where: {
          userId_type: {
            userId: user.id,
            type: 'job_alerts'
          }
        },
        update: {
          isActive: true,
          frequency: preferences.frequency || 'daily'
        },
        create: {
          userId: user.id,
          type: 'job_alerts',
          isActive: true,
          frequency: preferences.frequency || 'daily'
        }
      });
    } else {
      // Deactivate job alerts if job_alerts is false
      await prisma.emailSubscription.updateMany({
        where: {
          userId: user.id,
          type: 'job_alerts'
        },
        data: {
          isActive: false
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating user preferences:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
