import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getUserFromRequest } from '@/utils/auth';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    console.log('📊 Admin Applications API - GET request received');

    const user = getUserFromRequest(request);
    
    if (!user || !['employer_admin', 'super_admin'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
    }

    console.log('📊 Admin Applications API - User authenticated, ID:', user.id);

    // Get query parameters
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const jobId = url.searchParams.get('jobId');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    console.log('📊 Admin Applications API - Query params:', { status, jobId, page, limit });

    // Build where clause based on user role and filters
    let where = {};

    if (user.role === 'employer_admin') {
      // For employer admin, only show applications for jobs they posted or their parent posted
      const baseUserId = user.parentUserId || user.id;
      where.job = {
        OR: [
          { postedById: user.id },
          { postedById: baseUserId }
        ]
      };
    }
    // For super_admin, no additional where clause needed (see all applications)

    // Add status filter if provided
    if (status && status !== 'all') {
      where.status = status;
    }

    // Add job filter if provided
    if (jobId) {
      where.jobId = jobId;
    }

    console.log('📊 Admin Applications API - Where clause:', where);

    // Fetch applications with related data
    const [applications, totalCount] = await Promise.all([
      prisma.jobApplication.findMany({
        where,
        include: {
          job: {
            select: {
              id: true,
              title: true,
              company: {
                select: {
                  name: true
                }
              }
            }
          },
          applicant: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
              location: true,
              profilePicture: true,
              resumeUrl: true,
              skills: true,
              createdAt: true
            }
          }
        },
        orderBy: {
          appliedAt: 'desc'
        },
        skip: offset,
        take: limit
      }),
      prisma.jobApplication.count({ where })
    ]);

    console.log('📊 Admin Applications API - Found applications:', applications.length);

    // Transform applications for the frontend
    const transformedApplications = applications.map(app => {
      const applicationData = app.applicationData ? JSON.parse(app.applicationData) : {};
      
      return {
        id: app.id,
        status: app.status,
        appliedAt: app.appliedAt,
        createdAt: app.appliedAt, // For compatibility
        notes: app.notes,
        rating: app.rating,
        
        // Job information
        job: {
          id: app.job.id,
          title: app.job.title,
          company: app.job.company?.name || 'Unknown Company'
        },
        
        // Applicant information
        user: {
          id: app.applicant?.id,
          fullName: app.applicant?.fullName,
          email: app.applicant?.email
        },
        
        // Extract candidate info from application data as fallback
        candidateName: app.applicant?.fullName || applicationData.full_name || applicationData.name || 'Anonymous',
        candidateEmail: app.applicant?.email || applicationData.email || '',
        
        // Application details
        applicationData: applicationData,
        fileData: app.fileData ? JSON.parse(app.fileData) : {}
      };
    });

    const response = {
      success: true,
      applications: transformedApplications,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: totalCount > page * limit
      }
    };

    console.log('📊 Admin Applications API - Returning response with', transformedApplications.length, 'applications');
    
    return NextResponse.json(response);

  } catch (error) {
    console.error('📊 Admin Applications API - Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch applications',
      details: error.message 
    }, { status: 500 });
  }
}
