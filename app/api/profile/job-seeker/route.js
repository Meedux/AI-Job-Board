import { verifyToken, getUserFromRequest } from '@/utils/auth';
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'job_seeker') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get job seeker profile - User table contains all the profile info
    const jobSeekerProfile = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        fullName: true,
        email: true,
        nickname: true,
        firstName: true,
        lastName: true,
        age: true,
        dateOfBirth: true,
        fullAddress: true,
        location: true,
        phone: true,
        profilePicture: true,
        resumeUrl: true,
        skills: true,
        role: true,
        profileVisibility: true,
        hideProfile: true,
        emailNotifications: true,
        jobAlerts: true,
        marketingEmails: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // Get related data separately since the User model might not have all relations
    let applications = [];
    let resumeScans = [];
    
    try {
      // Try to get applications if the table exists
      applications = await prisma.jobApplication?.findMany({
        where: { userId: user.id },
        include: {
          job: {
            select: {
              title: true,
              status: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }) || [];
    } catch (error) {
      console.log('Applications table not found or accessible');
    }

    // Calculate statistics using the separate applications array
    const totalApplications = applications?.length || 0;
    const interviewsScheduled = applications?.filter(
      app => app.status === 'interview_scheduled'
    ).length || 0;

    // Get profile views (you might want to create a separate ProfileView model)
    const profileViews = Math.floor(Math.random() * 50) + 10; // Placeholder

    // Prepare response data using the User model fields
    const profileData = {
      // Basic user info from User table
      fullName: jobSeekerProfile?.fullName || '',
      email: jobSeekerProfile?.email || '',
      memberSince: jobSeekerProfile?.createdAt,
      
      // Job seeker specific data from User table
      phone: jobSeekerProfile?.phone || '',
      location: jobSeekerProfile?.location || '',
      fullAddress: jobSeekerProfile?.fullAddress || '',
      dateOfBirth: jobSeekerProfile?.dateOfBirth || null,
      profilePicture: jobSeekerProfile?.profilePicture || '',
      
      // Skills and other data
      skills: jobSeekerProfile?.skills ? (typeof jobSeekerProfile.skills === 'string' ? JSON.parse(jobSeekerProfile.skills) : jobSeekerProfile.skills) : [],
      resumeUrl: jobSeekerProfile?.resumeUrl || '',
      
      // Privacy settings
      profileVisibility: jobSeekerProfile?.profileVisibility || 'public',
      hideProfile: jobSeekerProfile?.hideProfile ?? false,
      emailNotifications: jobSeekerProfile?.emailNotifications ?? true,
      jobAlerts: jobSeekerProfile?.jobAlerts ?? true,
      marketingEmails: jobSeekerProfile?.marketingEmails ?? false,
      
      // Statistics
      profileViews,
      applicationsSent: totalApplications,
      interviewsScheduled,
      
      // Related data
      applications: applications,
      resumeScans: resumeScans,
      
      // Recent activity
      recentApplications: applications?.slice(0, 5)?.map(app => ({
        jobTitle: app.job?.title || 'Unknown',
        status: app.status,
        appliedAt: app.createdAt
      })) || []
    };

    return NextResponse.json(profileData);

  } catch (error) {
    console.error('Error fetching job seeker profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'job_seeker') {
      return Response.json({ error: 'Access denied' }, { status: 403 });
    }

    const data = await request.json();

    // Update user table if needed
    const userUpdateData = {};
    if (data.fullName) userUpdateData.fullName = data.fullName;
    if (data.email) userUpdateData.email = data.email;

    if (Object.keys(userUpdateData).length > 0) {
      await prisma.user.update({
        where: { id: user.id },
        data: userUpdateData
      });
    }

    // Prepare job seeker data
    const jobSeekerData = {
      phone: data.phone || '',
      address: data.address || '',
      city: data.city || '',
      state: data.state || '',
      country: data.country || 'Philippines',
      postalCode: data.postalCode || '',
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
      profilePicture: data.profilePicture || '',
      
      // Professional information
      currentPosition: data.currentPosition || '',
      yearsOfExperience: parseInt(data.yearsOfExperience) || 0,
      expectedSalary: data.expectedSalary || '',
      salaryPeriod: data.salaryPeriod || 'monthly',
      currency: data.currency || 'PHP',
      availability: data.availability || 'immediate',
      employmentType: data.employmentType || 'full-time',
      workMode: data.workMode || 'office',
      
      // Skills and qualifications (store as JSON)
      skills: JSON.stringify(data.skills || []),
      education: JSON.stringify(data.education || []),
      certifications: JSON.stringify(data.certifications || []),
      languages: JSON.stringify(data.languages || []),
      
      // Social and portfolio links
      linkedinUrl: data.linkedinUrl || '',
      portfolioUrl: data.portfolioUrl || '',
      githubUrl: data.githubUrl || '',
      
      // Privacy settings
      hideContactInfo: data.hideContactInfo ?? true,
      hideEmail: data.hideEmail ?? true,
      hidePhone: data.hidePhone ?? true,
      hideAddress: data.hideAddress ?? true,
      profileVisibility: data.profileVisibility || 'public',
      allowDirectContact: data.allowDirectContact ?? false,
      showSalaryExpectation: data.showSalaryExpectation ?? false,
      
      updatedAt: new Date()
    };

    // Upsert job seeker profile
    const jobSeekerProfile = await prisma.jobSeeker.upsert({
      where: { userId: user.id },
      update: jobSeekerData,
      create: {
        userId: user.id,
        ...jobSeekerData
      }
    });

    return Response.json({
      success: true,
      message: 'Profile updated successfully',
      profile: jobSeekerProfile
    });

  } catch (error) {
    console.error('Error updating job seeker profile:', error);
    return Response.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'job_seeker') {
      return Response.json({ error: 'Access denied' }, { status: 403 });
    }

    // Delete job seeker profile (this will cascade to related records)
    await prisma.jobSeeker.delete({
      where: { userId: user.id }
    });

    return Response.json({
      success: true,
      message: 'Profile deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting job seeker profile:', error);
    return Response.json(
      { error: 'Failed to delete profile' },
      { status: 500 }
    );
  }
}
