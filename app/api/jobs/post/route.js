import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = decoded.id;
    const jobData = await request.json();

    // Validate required fields
    const requiredFields = ['title', 'companyId', 'location', 'jobType', 'workMode', 'experienceLevel', 'description', 'requirements'];
    for (const field of requiredFields) {
      if (!jobData[field]) {
        return NextResponse.json({ error: `${field} is required` }, { status: 400 });
      }
    }

    // Get user info and verify company access
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify that the company exists and user has access to it
    const company = await prisma.company.findUnique({
      where: { id: jobData.companyId }
    });

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // Check if user has permission to post jobs for this company
    // Super admins can post for any company, employers can only post for their own
    if (user.role !== 'super_admin') {
      // For employer admins and sub users, check if they're associated with the company
      // For now, we'll allow any authenticated employer to use any company
      // In a production system, you'd want proper company-user relationships
      if (!['employer_admin', 'sub_user'].includes(user.role)) {
        return NextResponse.json({ error: 'Insufficient permissions to post jobs' }, { status: 403 });
      }
    }

    // Generate slug from title
    const slug = jobData.title.toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '-');

    // Make slug unique
    let counter = 1;
    let uniqueSlug = slug;
    let existingJob = await prisma.job.findFirst({
      where: { slug: uniqueSlug }
    });
    
    while (existingJob) {
      uniqueSlug = `${slug}-${counter}`;
      counter++;
      existingJob = await prisma.job.findFirst({
        where: { slug: uniqueSlug }
      });
    }

    // Create the job posting
    const job = await prisma.job.create({
      data: {
        slug: uniqueSlug,
        title: jobData.title,
        description: jobData.description,
        requirements: jobData.requirements,
        benefits: jobData.benefits || null,
        location: jobData.location,
        remoteType: jobData.workMode === 'remote' ? 'full' : 
                   jobData.workMode === 'hybrid' ? 'hybrid' : 'none',
        jobType: jobData.jobType,
        experienceLevel: jobData.experienceLevel,
        salaryFrom: jobData.salaryMin ? parseInt(jobData.salaryMin) : null,
        salaryTo: jobData.salaryMax ? parseInt(jobData.salaryMax) : null,
        salaryCurrency: 'USD',
        requiredSkills: jobData.skillsRequired || [],
        expiresAt: jobData.applicationDeadline ? new Date(jobData.applicationDeadline) : null,
        status: 'active',
        companyId: company.id, // Use the company ID as a string
        postedById: userId
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Job posted successfully',
      job: {
        id: job.id,
        slug: job.slug,
        title: job.title,
        status: job.status,
        postedAt: job.postedAt
      }
    });

  } catch (error) {
    console.error('Error creating job posting:', error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A job with this title already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create job posting' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = decoded.id;
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('id');

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }

    const jobData = await request.json();

    // Check if user owns this job
    const existingJob = await prisma.job.findFirst({
      where: { 
        id: jobId,
        postedById: userId 
      }
    });

    if (!existingJob) {
      return NextResponse.json({ error: 'Job not found or unauthorized' }, { status: 404 });
    }

    // Update the job
    const updatedJob = await prisma.job.update({
      where: { id: jobId },
      data: {
        title: jobData.title,
        description: jobData.description,
        requirements: jobData.requirements,
        benefits: jobData.benefits || null,
        location: jobData.location,
        remoteType: jobData.workMode === 'remote' ? 'full' : 
                   jobData.workMode === 'hybrid' ? 'hybrid' : 'none',
        jobType: jobData.jobType,
        experienceLevel: jobData.experienceLevel,
        salaryFrom: jobData.salaryMin ? parseInt(jobData.salaryMin) : null,
        salaryTo: jobData.salaryMax ? parseInt(jobData.salaryMax) : null,
        requiredSkills: jobData.skillsRequired || [],
        expiresAt: jobData.applicationDeadline ? new Date(jobData.applicationDeadline) : null,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Job updated successfully',
      job: {
        id: updatedJob.id,
        title: updatedJob.title,
        status: updatedJob.status,
        updatedAt: updatedJob.updatedAt
      }
    });

  } catch (error) {
    console.error('Error updating job:', error);
    return NextResponse.json(
      { error: 'Failed to update job' },
      { status: 500 }
    );
  }
}
