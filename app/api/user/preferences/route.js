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
    const [preferences, emailSubscription, resumeSubscription] = await Promise.all([
      prisma.userPreference.findFirst({
        where: { userId: user.id }
      }),
      prisma.emailSubscription.findFirst({
        where: { 
          userId: user.id,
          type: 'job_alerts',
          isActive: true
        }
      }),
      prisma.emailSubscription.findFirst({
        where: { 
          userId: user.id,
          type: 'resume_alerts',
          isActive: true
        }
      })
    ]);

    return NextResponse.json({
      success: true,
      preferences: preferences || {},
      hasJobAlerts: !!emailSubscription,
      resumeAlerts: !!resumeSubscription,
      resumeAlertPreferences: preferences ? {
        resumeAlertFrequency: preferences.resumeAlertFrequency,
        resumeKeywords: preferences.resumeKeywords,
        resumeSkills: preferences.resumeSkills,
        resumeExperienceLevel: preferences.resumeExperienceLevel,
        resumeLocation: preferences.resumeLocation,
        resumeSalaryMin: preferences.resumeSalaryMin,
        resumeSalaryMax: preferences.resumeSalaryMax,
        resumeEducation: preferences.resumeEducation,
        resumeEmailAlerts: preferences.resumeEmailAlerts,
        resumePushAlerts: preferences.resumePushAlerts
      } : {}
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
    const { job_alerts, resumeAlerts, ...preferences } = body;

    // Update or create user preferences
    await prisma.userPreference.upsert({
      where: { userId: user.id },
      update: {
        // Job alert preferences
        jobAlertFrequency: preferences.frequency || 'daily',
        jobKeywords: preferences.job_keywords || [],
        jobLocations: preferences.job_locations || [],
        jobTypes: preferences.job_types || [],
        experienceLevels: preferences.experience_levels || [],
        salaryMin: preferences.salary_min ? parseInt(preferences.salary_min) : null,
        salaryMax: preferences.salary_max ? parseInt(preferences.salary_max) : null,
        remoteWork: preferences.remote_only || false,
        jobCategories: preferences.job_categories || [],
        
        // Resume alert preferences
        resumeAlertFrequency: preferences.resumeAlertFrequency || 'daily',
        resumeKeywords: preferences.resumeKeywords || [],
        resumeSkills: preferences.resumeSkills || [],
        resumeExperienceLevel: preferences.resumeExperienceLevel || null,
        resumeLocation: preferences.resumeLocation || null,
        resumeSalaryMin: preferences.resumeSalaryMin ? parseInt(preferences.resumeSalaryMin) : null,
        resumeSalaryMax: preferences.resumeSalaryMax ? parseInt(preferences.resumeSalaryMax) : null,
        resumeEducation: preferences.resumeEducation || null,
        resumeEmailAlerts: preferences.resumeEmailAlerts !== undefined ? preferences.resumeEmailAlerts : true,
        resumePushAlerts: preferences.resumePushAlerts !== undefined ? preferences.resumePushAlerts : true
      },
      create: {
        userId: user.id,
        // Job alert preferences
        jobAlertFrequency: preferences.frequency || 'daily',
        jobKeywords: preferences.job_keywords || [],
        jobLocations: preferences.job_locations || [],
        jobTypes: preferences.job_types || [],
        experienceLevels: preferences.experience_levels || [],
        salaryMin: preferences.salary_min ? parseInt(preferences.salary_min) : null,
        salaryMax: preferences.salary_max ? parseInt(preferences.salary_max) : null,
        remoteWork: preferences.remote_only || false,
        jobCategories: preferences.job_categories || [],
        
        // Resume alert preferences
        resumeAlertFrequency: preferences.resumeAlertFrequency || 'daily',
        resumeKeywords: preferences.resumeKeywords || [],
        resumeSkills: preferences.resumeSkills || [],
        resumeExperienceLevel: preferences.resumeExperienceLevel || null,
        resumeLocation: preferences.resumeLocation || null,
        resumeSalaryMin: preferences.resumeSalaryMin ? parseInt(preferences.resumeSalaryMin) : null,
        resumeSalaryMax: preferences.resumeSalaryMax ? parseInt(preferences.resumeSalaryMax) : null,
        resumeEducation: preferences.resumeEducation || null,
        resumeEmailAlerts: preferences.resumeEmailAlerts !== undefined ? preferences.resumeEmailAlerts : true,
        resumePushAlerts: preferences.resumePushAlerts !== undefined ? preferences.resumePushAlerts : true
      }
    });

    // Handle resume alerts subscription
    if (resumeAlerts) {
      await prisma.emailSubscription.upsert({
        where: {
          userId_type: {
            userId: user.id,
            type: 'resume_alerts'
          }
        },
        update: {
          isActive: true,
          frequency: preferences.resumeAlertFrequency || 'daily'
        },
        create: {
          userId: user.id,
          email: user.email,
          type: 'resume_alerts',
          isActive: true,
          frequency: preferences.resumeAlertFrequency || 'daily'
        }
      });
    } else {
      // Deactivate resume alerts if resumeAlerts is false
      await prisma.emailSubscription.updateMany({
        where: {
          userId: user.id,
          type: 'resume_alerts'
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
