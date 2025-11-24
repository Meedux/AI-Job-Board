import { verifyToken, getUserFromRequest } from '@/utils/auth';
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// Helper function to calculate profile completeness
function calculateProfileCompleteness(user) {
  const fields = [
    user?.fullName,
    user?.email,
    user?.phone,
    user?.location,
    user?.skills && user.skills.length > 0,
    user?.resumeUrl
  ];

  const completedFields = fields.filter(field =>
    typeof field === 'boolean' ? field : Boolean(field)
  ).length;

  return Math.round((completedFields / fields.length) * 100);
}

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
        age: true,
        vcardUrl: true,
        qrImagePath: true,
        shareableLink: true,
        exAbroad: true,
        countryDeployed: true,
        passportExpiry: true,
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

    // Fetch application counts and recent applications using correct applicantId
    // We limit the returned application list so the profile endpoint stays performant
    const positiveResponseStatuses = ['shortlisted', 'interview_scheduled', 'interviewed', 'offered', 'hired', 'reviewed'];

    const [
      totalApplications,
      applicationsByStatus,
      recentApplications,
      resumeRevealCount,
      resumeScanCount,
      parsedResumeAgg
    ] = await Promise.all([
      // total number of applications the user submitted
      prisma.jobApplication.count({ where: { applicantId: user.id } }),

      // grouped counts by status for quick breakdown
      // groupBy returns an array of { status, _count: { status: n }}
      prisma.jobApplication.groupBy({
        by: ['status'],
        where: { applicantId: user.id },
        _count: { status: true }
      }).catch(() => []),

      // a short list of most recent applications for UI previews
      prisma.jobApplication.findMany({
        where: { applicantId: user.id },
        include: {
          job: {
            select: {
              id: true,
              title: true,
              company: {
                select: { id: true, name: true }
              }
            }
          }
        },
        orderBy: { appliedAt: 'desc' },
        take: 5
      }).catch(() => []),

      // number of resume contact reveals targeted at this user (employers who revealed contact)
      prisma.resumeContactReveal.count({ where: { targetUserId: user.id } }).catch(() => 0),

      // number of resume scans performed against this user's parsed resumes
      prisma.resumeScanResult.count({ where: { resume: { userId: user.id } } }).catch(() => 0),

      // average resume quality if parsed resumes exist
      prisma.parsedResume.aggregate({ _avg: { resumeQualityScore: true }, where: { userId: user.id } }).catch(() => ({ _avg: { resumeQualityScore: null } }))
    ]);

    // Map grouped status counts into an object for easy consumption by the UI
    const applicationsStatusCounts = (applicationsByStatus || []).reduce((acc, item) => {
      acc[item.status] = item._count?.status || 0;
      return acc;
    }, {});

    const interviewsScheduled = applicationsStatusCounts['interview_scheduled'] || 0;

    // Calculate profile completeness using actual profile fields
    const profileCompleteness = calculateProfileCompleteness(jobSeekerProfile);

    // Aggregate profile views from contact reveals + resume scan activity
    const profileViews = (resumeRevealCount || 0) + (resumeScanCount || 0);

    // Calculate response rate based on meaningful status transitions (non-pending states)
    const respondedCount = Object.keys(applicationsStatusCounts).reduce((acc, status) => {
      return positiveResponseStatuses.includes(status) ? (acc + (applicationsStatusCounts[status] || 0)) : acc;
    }, 0);

    const responseRate = totalApplications > 0 ? Math.min(100, Math.round((respondedCount / totalApplications) * 100)) : 0;

    // Include resume quality metric (0-100) as a factor in profile strength
    const avgResumeQuality = parsedResumeAgg?._avg?.resumeQualityScore || 0;

    // Profile strength is derived from completeness, response behavior, and resume quality
    const strengthScore = Math.round((profileCompleteness * 0.6) + (responseRate * 0.25) + (avgResumeQuality * 0.15));
    let profileStrength = 'Poor';
    if (strengthScore >= 85) profileStrength = 'Excellent';
    else if (strengthScore >= 70) profileStrength = 'Good';
    else if (strengthScore >= 50) profileStrength = 'Fair';

    // Get member since date
    const memberSince = jobSeekerProfile?.createdAt;

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
      responseRate,
      profileStrength,
      
      // Related data
      applications: recentApplications || [],
      resumeScans: resumeScanCount || 0,

      // Recent activity (sanitized)
      recentApplications: (recentApplications || []).map(app => ({
        id: app.id,
        jobId: app.job?.id || null,
        jobTitle: app.job?.title || 'Unknown',
        company: app.job?.company?.name || null,
        status: app.status,
        appliedAt: app.appliedAt
      })),

      // Profile completeness
      profileCompleteness: profileCompleteness,
      applicationsStatusCounts,
      resumeRevealCount,
      avgResumeQuality
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

    // If user-level profile fields were passed (vcard/qr/share/exAbroad/passport), update the user table
    const userUpdates = {};
    if (data.vcardUrl !== undefined) userUpdates.vcardUrl = data.vcardUrl || null;
    if (data.qrImagePath !== undefined) userUpdates.qrImagePath = data.qrImagePath || null;
    if (data.shareableLink !== undefined) userUpdates.shareableLink = data.shareableLink || null;
    if (data.exAbroad !== undefined) userUpdates.exAbroad = !!data.exAbroad;
    if (data.countryDeployed !== undefined) userUpdates.countryDeployed = data.countryDeployed || null;
    if (data.passportExpiry !== undefined) userUpdates.passportExpiry = data.passportExpiry ? new Date(data.passportExpiry) : null;

    // If dateOfBirth set, compute and set age on user as well
    if (data.dateOfBirth) {
      const dob = new Date(data.dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
      userUpdates.age = age;
    }

    // Upsert job seeker profile
    const jobSeekerProfile = await prisma.jobSeeker.upsert({
      where: { userId: user.id },
      update: jobSeekerData,
      create: {
        userId: user.id,
        ...jobSeekerData
      }
    });

    if (Object.keys(userUpdates).length > 0) {
      await prisma.user.update({ where: { id: user.id }, data: userUpdates });
    }

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
