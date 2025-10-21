import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

export async function GET(request, { params }) {
  try {
    console.log('👤 Admin Jobseeker Profile API - GET request received');

    // Get token from cookies or Authorization header
    const cookieStore = cookies();
    const token = cookieStore.get('auth-token')?.value ||
                  cookieStore.get('token')?.value ||
                  request.headers.get('authorization')?.replace('Bearer ', '');

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

    // Get user details to check role
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, parentUserId: true }
    });

    if (!user || !['employer_admin', 'super_admin'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
    }

    // Get jobseeker ID from URL
    const url = new URL(request.url);
    const jobseekerId = url.searchParams.get('id');

    if (!jobseekerId) {
      return NextResponse.json({ error: 'Jobseeker ID is required' }, { status: 400 });
    }

    // Get jobseeker profile
    const jobseeker = await prisma.user.findUnique({
      where: { id: jobseekerId },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        location: true,
        profilePicture: true,
        resumeUrl: true,
        skills: true,
        role: true,
        profileVisibility: true,
        createdAt: true,
        updatedAt: true,
        // Include job seeker specific fields if they exist
        currentPosition: true,
        yearsOfExperience: true,
        expectedSalary: true,
        availability: true,
        employmentType: true,
        workMode: true
      }
    });

    if (!jobseeker) {
      return NextResponse.json({ error: 'Jobseeker not found' }, { status: 404 });
    }

    if (jobseeker.role !== 'job_seeker') {
      return NextResponse.json({ error: 'User is not a job seeker' }, { status: 400 });
    }

    // Check if employer has access (has received application from this jobseeker)
    if (user.role === 'employer_admin') {
      const baseUserId = user.parentUserId || user.id;

      const hasApplication = await prisma.jobApplication.findFirst({
        where: {
          applicantId: jobseekerId,
          job: {
            OR: [
              { postedById: user.id },
              { postedById: baseUserId }
            ]
          }
        }
      });

      if (!hasApplication) {
        return NextResponse.json({ error: 'Access denied - no applications from this jobseeker' }, { status: 403 });
      }
    }

    // Parse skills if stored as JSON string
    let parsedSkills = [];
    if (jobseeker.skills) {
      try {
        parsedSkills = typeof jobseeker.skills === 'string'
          ? JSON.parse(jobseeker.skills)
          : jobseeker.skills;
      } catch (error) {
        console.error('Error parsing skills:', error);
        parsedSkills = [];
      }
    }

    // Return jobseeker profile
    return NextResponse.json({
      id: jobseeker.id,
      fullName: jobseeker.fullName,
      email: jobseeker.email,
      phone: jobseeker.phone,
      location: jobseeker.location,
      profilePicture: jobseeker.profilePicture,
      resumeUrl: jobseeker.resumeUrl,
      skills: parsedSkills,
      currentPosition: jobseeker.currentPosition,
      yearsOfExperience: jobseeker.yearsOfExperience,
      expectedSalary: jobseeker.expectedSalary,
      availability: jobseeker.availability,
      employmentType: jobseeker.employmentType,
      workMode: jobseeker.workMode,
      profileVisibility: jobseeker.profileVisibility,
      memberSince: jobseeker.createdAt,
      lastUpdated: jobseeker.updatedAt
    });

  } catch (error) {
    console.error('Admin Jobseeker Profile API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}