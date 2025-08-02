import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/utils/auth';
import prisma from '@/utils/db';

// GET - Fetch candidates for a specific job or all jobs
export async function GET(request) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user || !['employer_admin', 'sub_user'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Access denied. Only employers can access ATS data.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    const stage = searchParams.get('stage');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query conditions
    let whereConditions = {};

    // Filter by company for sub-users
    if (user.role === 'sub_user') {
      whereConditions.job = {
        companyId: user.companyId
      };
    } else if (user.role === 'employer_admin') {
      whereConditions.job = {
        companyId: user.id // employer_admin uses their ID as company
      };
    }

    // Filter by specific job if provided
    if (jobId) {
      whereConditions.jobId = parseInt(jobId);
    }

    // Filter by stage if provided
    if (stage) {
      whereConditions.stage = stage;
    }

    // Fetch candidates with related data
    const candidates = await prisma.application.findMany({
      where: whereConditions,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            location: true,
            profilePicture: true,
            resumeUrl: true,
            skills: true,
          }
        },
        job: {
          select: {
            id: true,
            title: true,
            department: true,
            company: {
              select: {
                name: true,
                logo: true
              }
            }
          }
        }
      },
      orderBy: {
        appliedAt: 'desc'
      },
      take: limit,
      skip: offset
    });

    // Transform data for ATS format
    const atsData = candidates.map(application => ({
      id: application.id.toString(),
      userId: application.user.id,
      jobId: application.job.id,
      name: application.user.name,
      email: application.user.email,
      phone: application.user.phone || '',
      position: application.job.title,
      department: application.job.department || '',
      company: application.job.company.name,
      location: application.user.location || '',
      stage: application.stage || 'new',
      status: application.status,
      rating: application.rating || 0,
      skills: application.user.skills || [],
      appliedDate: application.appliedAt,
      notes: application.notes || '',
      tags: application.tags || [],
      hasDocument: !!application.user.resumeUrl,
      isUrgent: application.priority === 'urgent',
      isFavorite: application.isFavorite || false,
      resumeUrl: application.user.resumeUrl,
      profilePicture: application.user.profilePicture,
      coverLetter: application.coverLetter,
      experienceYears: application.experienceYears || 0,
      salaryExpectation: application.salaryExpectation,
      availability: application.availability,
      contactVisible: application.contactVisible !== false, // Default to true
      lastActivity: application.updatedAt,
      source: application.source || 'direct'
    }));

    // Get summary stats
    const totalCount = await prisma.application.count({
      where: whereConditions
    });

    // Get stage counts
    const stageCounts = await prisma.application.groupBy({
      by: ['stage'],
      where: whereConditions,
      _count: {
        id: true
      }
    });

    const stageStats = stageCounts.reduce((acc, item) => {
      acc[item.stage || 'new'] = item._count.id;
      return acc;
    }, {});

    return NextResponse.json({
      candidates: atsData,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + candidates.length < totalCount
      },
      stats: {
        total: totalCount,
        byStage: stageStats
      }
    });

  } catch (error) {
    console.error('Error fetching ATS candidates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch candidates' },
      { status: 500 }
    );
  }
}

// PUT - Update candidate stage, rating, notes, etc.
export async function PUT(request) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user || !['employer_admin', 'sub_user'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Access denied. Only employers can update ATS data.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { 
      candidateId, 
      updates 
    } = body;

    if (!candidateId) {
      return NextResponse.json(
        { error: 'Candidate ID is required' },
        { status: 400 }
      );
    }

    // Verify candidate exists and user has access
    const application = await prisma.application.findFirst({
      where: {
        id: parseInt(candidateId),
        job: {
          companyId: user.role === 'employer_admin' ? user.id : user.companyId
        }
      }
    });

    if (!application) {
      return NextResponse.json(
        { error: 'Candidate not found or access denied' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData = {};
    
    if (updates.stage !== undefined) {
      updateData.stage = updates.stage;
    }
    
    if (updates.rating !== undefined) {
      updateData.rating = updates.rating;
    }
    
    if (updates.notes !== undefined) {
      updateData.notes = updates.notes;
    }
    
    if (updates.tags !== undefined) {
      updateData.tags = updates.tags;
    }
    
    if (updates.isFavorite !== undefined) {
      updateData.isFavorite = updates.isFavorite;
    }
    
    if (updates.contactVisible !== undefined) {
      updateData.contactVisible = updates.contactVisible;
    }
    
    if (updates.priority !== undefined) {
      updateData.priority = updates.priority;
    }

    // Update the application
    const updatedApplication = await prisma.application.update({
      where: { id: parseInt(candidateId) },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            location: true,
            resumeUrl: true,
            skills: true,
          }
        },
        job: {
          select: {
            id: true,
            title: true,
            department: true
          }
        }
      }
    });

    // Log the activity
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'candidate_updated',
        entityType: 'application',
        entityId: parseInt(candidateId),
        details: {
          updates,
          candidateName: updatedApplication.user.name,
          jobTitle: updatedApplication.job.title
        }
      }
    });

    return NextResponse.json({
      success: true,
      candidate: {
        id: updatedApplication.id.toString(),
        ...updates
      }
    });

  } catch (error) {
    console.error('Error updating ATS candidate:', error);
    return NextResponse.json(
      { error: 'Failed to update candidate' },
      { status: 500 }
    );
  }
}

// POST - Bulk update candidates (move multiple candidates to different stages)
export async function POST(request) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user || !['employer_admin', 'sub_user'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Access denied. Only employers can bulk update ATS data.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { 
      candidateIds, 
      action,
      stage,
      rating,
      tags,
      notes
    } = body;

    if (!candidateIds || !Array.isArray(candidateIds) || candidateIds.length === 0) {
      return NextResponse.json(
        { error: 'Candidate IDs array is required' },
        { status: 400 }
      );
    }

    // Verify all candidates exist and user has access
    const applications = await prisma.application.findMany({
      where: {
        id: { in: candidateIds.map(id => parseInt(id)) },
        job: {
          companyId: user.role === 'employer_admin' ? user.id : user.companyId
        }
      }
    });

    if (applications.length !== candidateIds.length) {
      return NextResponse.json(
        { error: 'Some candidates not found or access denied' },
        { status: 404 }
      );
    }

    // Prepare bulk update data
    const updateData = {};
    
    if (action === 'move_stage' && stage) {
      updateData.stage = stage;
    } else if (action === 'rate' && rating !== undefined) {
      updateData.rating = rating;
    } else if (action === 'tag' && tags) {
      updateData.tags = tags;
    } else if (action === 'note' && notes) {
      updateData.notes = notes;
    }

    // Perform bulk update
    const updateResult = await prisma.application.updateMany({
      where: {
        id: { in: candidateIds.map(id => parseInt(id)) }
      },
      data: updateData
    });

    // Log the bulk activity
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: `bulk_${action}`,
        entityType: 'application',
        entityId: null,
        details: {
          candidateIds,
          action,
          updateData,
          count: updateResult.count
        }
      }
    });

    return NextResponse.json({
      success: true,
      updatedCount: updateResult.count,
      action,
      updateData
    });

  } catch (error) {
    console.error('Error bulk updating ATS candidates:', error);
    return NextResponse.json(
      { error: 'Failed to bulk update candidates' },
      { status: 500 }
    );
  }
}
