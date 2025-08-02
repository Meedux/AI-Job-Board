import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/utils/auth';
import prisma from '@/utils/db';

// GET - Fetch activity logs for ATS dashboard
export async function GET(request) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user || !['employer_admin', 'sub_user'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Access denied. Only employers can access activity logs.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get('entityType');
    const entityId = searchParams.get('entityId');
    const action = searchParams.get('action');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const days = parseInt(searchParams.get('days') || '30');

    // Build query conditions
    let whereConditions = {
      createdAt: {
        gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      }
    };

    // Filter by company for sub-users
    if (user.role === 'sub_user') {
      // For sub-users, only show logs from their company
      whereConditions.OR = [
        { userId: user.id },
        { 
          user: {
            companyId: user.companyId
          }
        }
      ];
    } else if (user.role === 'employer_admin') {
      // For employer admins, show all logs from their company
      whereConditions.OR = [
        { userId: user.id },
        {
          user: {
            OR: [
              { id: user.id },
              { companyId: user.id }
            ]
          }
        }
      ];
    }

    // Additional filters
    if (entityType) {
      whereConditions.entityType = entityType;
    }

    if (entityId) {
      whereConditions.entityId = parseInt(entityId);
    }

    if (action) {
      whereConditions.action = action;
    }

    // Fetch activity logs
    const activities = await prisma.activityLog.findMany({
      where: whereConditions,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            userType: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: offset
    });

    // Get total count
    const totalCount = await prisma.activityLog.count({
      where: whereConditions
    });

    // Format activities for display
    const formattedActivities = activities.map(activity => ({
      id: activity.id,
      user: activity.user,
      action: activity.action,
      entityType: activity.entityType,
      entityId: activity.entityId,
      details: activity.details,
      timestamp: activity.createdAt,
      description: generateActivityDescription(activity)
    }));

    return NextResponse.json({
      activities: formattedActivities,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + activities.length < totalCount
      }
    });

  } catch (error) {
    console.error('Error fetching activity logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity logs' },
      { status: 500 }
    );
  }
}

// POST - Log a new activity
export async function POST(request) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      action,
      entityType,
      entityId,
      details
    } = body;

    if (!action || !entityType) {
      return NextResponse.json(
        { error: 'Action and entity type are required' },
        { status: 400 }
      );
    }

    // Create activity log
    const activity = await prisma.activityLog.create({
      data: {
        userId: user.id,
        action,
        entityType,
        entityId: entityId ? parseInt(entityId) : null,
        details: details || {}
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            userType: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      activity: {
        id: activity.id,
        user: activity.user,
        action: activity.action,
        entityType: activity.entityType,
        entityId: activity.entityId,
        details: activity.details,
        timestamp: activity.createdAt,
        description: generateActivityDescription(activity)
      }
    });

  } catch (error) {
    console.error('Error logging activity:', error);
    return NextResponse.json(
      { error: 'Failed to log activity' },
      { status: 500 }
    );
  }
}

// Helper function to generate human-readable activity descriptions
function generateActivityDescription(activity) {
  const { action, details, user } = activity;
  const userName = user?.name || 'Someone';

  switch (action) {
    case 'candidate_updated':
      if (details?.updates?.stage) {
        return `${userName} moved ${details.candidateName} to ${details.updates.stage}`;
      } else if (details?.updates?.rating !== undefined) {
        return `${userName} rated ${details.candidateName} ${details.updates.rating} stars`;
      } else if (details?.updates?.notes) {
        return `${userName} added notes to ${details.candidateName}`;
      }
      return `${userName} updated ${details.candidateName}`;

    case 'bulk_move_stage':
      return `${userName} moved ${details.count} candidates to ${details.updateData.stage}`;

    case 'bulk_rate':
      return `${userName} rated ${details.count} candidates ${details.updateData.rating} stars`;

    case 'bulk_tag':
      return `${userName} tagged ${details.count} candidates`;

    case 'interview_scheduled':
      return `${userName} scheduled an interview with ${details.candidateName}`;

    case 'interview_completed':
      return `${userName} completed interview with ${details.candidateName}`;

    case 'offer_sent':
      return `${userName} sent job offer to ${details.candidateName}`;

    case 'candidate_hired':
      return `${userName} hired ${details.candidateName}`;

    case 'candidate_rejected':
      return `${userName} rejected ${details.candidateName}`;

    case 'resume_viewed':
      return `${userName} viewed ${details.candidateName}'s resume`;

    case 'resume_downloaded':
      return `${userName} downloaded ${details.candidateName}'s resume`;

    case 'contact_revealed':
      return `${userName} revealed contact details for ${details.candidateName}`;

    case 'note_added':
      return `${userName} added a note to ${details.candidateName}`;

    case 'tag_added':
      return `${userName} tagged ${details.candidateName} as ${details.tag}`;

    case 'job_created':
      return `${userName} created job posting "${details.jobTitle}"`;

    case 'job_published':
      return `${userName} published job posting "${details.jobTitle}"`;

    case 'job_closed':
      return `${userName} closed job posting "${details.jobTitle}"`;

    case 'application_received':
      return `New application received from ${details.candidateName} for ${details.jobTitle}`;

    case 'database_search':
      return `${userName} searched candidate database with "${details.query}"`;

    case 'bulk_email_sent':
      return `${userName} sent bulk email to ${details.count} candidates`;

    case 'report_generated':
      return `${userName} generated ${details.reportType} report`;

    case 'user_invited':
      return `${userName} invited ${details.invitedEmail} as ${details.role}`;

    case 'settings_updated':
      return `${userName} updated ATS settings`;

    default:
      return `${userName} performed ${action}`;
  }
}
