import { verifyToken, getUserFromRequest } from '@/utils/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'job_seeker') {
      return Response.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get job seeker profile
    const jobSeekerProfile = await prisma.jobSeeker.findUnique({
      where: { userId: user.id },
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
            createdAt: true
          }
        },
        applications: {
          include: {
            job: {
              select: {
                title: true,
                company: true,
                status: true
              }
            }
          }
        },
        resumeScans: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      }
    });

    // Calculate statistics
    const totalApplications = jobSeekerProfile?.applications?.length || 0;
    const interviewsScheduled = jobSeekerProfile?.applications?.filter(
      app => app.status === 'interview_scheduled'
    ).length || 0;

    // Get profile views (you might want to create a separate ProfileView model)
    const profileViews = Math.floor(Math.random() * 50) + 10; // Placeholder

    // Prepare response data
    const profileData = {
      // Basic user info
      fullName: jobSeekerProfile?.user?.fullName || user.fullName || '',
      email: user.email || '',
      memberSince: jobSeekerProfile?.user?.createdAt || user.createdAt,
      
      // Job seeker specific data
      phone: jobSeekerProfile?.phone || '',
      address: jobSeekerProfile?.address || '',
      city: jobSeekerProfile?.city || '',
      state: jobSeekerProfile?.state || '',
      country: jobSeekerProfile?.country || 'Philippines',
      postalCode: jobSeekerProfile?.postalCode || '',
      dateOfBirth: jobSeekerProfile?.dateOfBirth || null,
      profilePicture: jobSeekerProfile?.profilePicture || '',
      
      // Professional information
      currentPosition: jobSeekerProfile?.currentPosition || '',
      yearsOfExperience: jobSeekerProfile?.yearsOfExperience || 0,
      expectedSalary: jobSeekerProfile?.expectedSalary || '',
      salaryPeriod: jobSeekerProfile?.salaryPeriod || 'monthly',
      currency: jobSeekerProfile?.currency || 'PHP',
      availability: jobSeekerProfile?.availability || 'immediate',
      employmentType: jobSeekerProfile?.employmentType || 'full-time',
      workMode: jobSeekerProfile?.workMode || 'office',
      
      // Skills and qualifications
      skills: jobSeekerProfile?.skills ? JSON.parse(jobSeekerProfile.skills) : [],
      education: jobSeekerProfile?.education ? JSON.parse(jobSeekerProfile.education) : [],
      certifications: jobSeekerProfile?.certifications ? JSON.parse(jobSeekerProfile.certifications) : [],
      languages: jobSeekerProfile?.languages ? JSON.parse(jobSeekerProfile.languages) : [],
      
      // Social and portfolio links
      linkedinUrl: jobSeekerProfile?.linkedinUrl || '',
      portfolioUrl: jobSeekerProfile?.portfolioUrl || '',
      githubUrl: jobSeekerProfile?.githubUrl || '',
      
      // Privacy settings
      hideContactInfo: jobSeekerProfile?.hideContactInfo ?? true,
      hideEmail: jobSeekerProfile?.hideEmail ?? true,
      hidePhone: jobSeekerProfile?.hidePhone ?? true,
      hideAddress: jobSeekerProfile?.hideAddress ?? true,
      profileVisibility: jobSeekerProfile?.profileVisibility || 'public',
      allowDirectContact: jobSeekerProfile?.allowDirectContact ?? false,
      showSalaryExpectation: jobSeekerProfile?.showSalaryExpectation ?? false,
      
      // Resume information
      resumeUrl: jobSeekerProfile?.resumeScans?.[0]?.resumeUrl || '',
      resumeFileName: jobSeekerProfile?.resumeScans?.[0]?.fileName || '',
      resumeUploadedAt: jobSeekerProfile?.resumeScans?.[0]?.createdAt || null,
      
      // Statistics
      profileViews,
      applicationsSent: totalApplications,
      interviewsScheduled,
      
      // Recent activity
      recentApplications: jobSeekerProfile?.applications?.slice(0, 5)?.map(app => ({
        jobTitle: app.job.title,
        company: app.job.company,
        status: app.status,
        appliedAt: app.createdAt
      })) || []
    };

    return Response.json(profileData);

  } catch (error) {
    console.error('Error fetching job seeker profile:', error);
    return Response.json(
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
