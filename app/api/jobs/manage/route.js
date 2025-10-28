import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// GET - Fetch jobs for the current user
export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Decode JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      console.error('Invalid token in /api/jobs/manage GET:', err.message);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get user from decoded token (prefer id, then uid or email)
    const userId = decoded.id || decoded.uid || null;
    const userEmail = decoded.email || null;

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          userId ? { id: userId } : undefined,
          userEmail ? { email: userEmail } : undefined
        ].filter(Boolean)
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Determine which jobs to fetch based on user role
    let whereClause = {};
    
    if (user.role === 'employer_admin') {
      // Main employer can see all jobs posted by them and their sub-users
      const subUserIds = await prisma.user.findMany({
        where: { parentUserId: user.id },
        select: { id: true }
      });
      
      const allUserIds = [user.id, ...subUserIds.map(su => su.id)];
      whereClause.postedById = { in: allUserIds };
    } else if (user.role === 'sub_user' && user.parentUserId) {
      // Sub-user can only see jobs they posted
      whereClause.postedById = user.id;
    } else {
      // Regular users can only see jobs they posted
      whereClause.postedById = user.id;
    }

    const jobs = await prisma.job.findMany({
      where: whereClause,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logoUrl: true
          }
        },
        postedBy: {
          select: {
            id: true,
            fullName: true,
            companyName: true
          }
        },
        _count: {
          select: {
            applications: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Format response data
    const formattedJobs = jobs.map(job => ({
      id: job.id,
      title: job.title,
      slug: job.slug,
      companyId: job.company?.id || null,
      company: job.company || null,
      companyName: job.company?.name || job.postedBy?.companyName || 'No Company',
      location: job.location,
      jobType: job.jobType,
      workMode: job.workMode,
      status: job.status,
      description: job.description,
      requirements: job.requirements,
      benefits: job.benefits,
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
      salaryCurrency: job.salaryCurrency,
      experienceLevel: job.experienceLevel,
      applicationDeadline: job.applicationDeadline,
      skillsRequired: job.skillsRequired,
      category: job.category,
      viewsCount: job.viewsCount || 0,
      applicationsCount: job._count.applications,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      postedBy: job.postedBy
    }));

    return NextResponse.json({ 
      success: true,
      jobs: formattedJobs,
      total: formattedJobs.length
    });

  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch jobs' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST - Create a new job (duplicate functionality)
export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Decode JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      console.error('Invalid token in /api/jobs/manage POST:', err.message);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = decoded.id || decoded.uid || null;
    const userEmail = decoded.email || null;

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          userId ? { id: userId } : undefined,
          userEmail ? { email: userEmail } : undefined
        ].filter(Boolean)
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const jobData = await request.json();

    // Validate required fields
    if (!jobData.title || !jobData.description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
    }

    // Generate slug
    const baseSlug = jobData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    let slug = baseSlug;
    let counter = 1;
    
    // Ensure unique slug
    while (await prisma.job.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Create the job
    const newJob = await prisma.job.create({
      data: {
        title: jobData.title,
        slug,
        description: jobData.description,
        requirements: jobData.requirements || '',
        benefits: jobData.benefits || '',
        location: jobData.location || '',
        jobType: jobData.jobType || 'full-time',
        workMode: jobData.workMode || 'on-site',
        experienceLevel: jobData.experienceLevel || 'mid-level',
        salaryMin: jobData.salaryMin || null,
        salaryMax: jobData.salaryMax || null,
        salaryCurrency: jobData.salaryCurrency || 'PHP',
        applicationDeadline: jobData.applicationDeadline ? new Date(jobData.applicationDeadline) : null,
        skillsRequired: jobData.skillsRequired || [],
        category: jobData.category || 'Technology',
        status: jobData.status || 'draft',
        companyId: jobData.companyId || null,
        postedById: user.id,
        // Resume scanning settings
        enableAIScanning: jobData.enableAIScanning !== false,
        skillsWeight: jobData.skillsWeight || 30,
        experienceWeight: jobData.experienceWeight || 25,
        educationWeight: jobData.educationWeight || 20,
        keywordWeight: jobData.keywordWeight || 15,
        locationWeight: jobData.locationWeight || 10,
        minExperienceYears: jobData.minExperienceYears || null,
        requiredEducation: jobData.requiredEducation || null,
        dealBreakers: jobData.dealBreakers || []
      },
      include: {
        company: true,
        postedBy: {
          select: {
            id: true,
            fullName: true,
            companyName: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      job: newJob,
      message: 'Job created successfully'
    });

  } catch (error) {
    console.error('Error creating job:', error);
    return NextResponse.json(
      { error: 'Failed to create job' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}