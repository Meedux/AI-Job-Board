import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/utils/auth';
import { prisma, handlePrismaError } from '@/utils/db';

export async function GET(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only allow employers and admins
    if (!['employer_admin', 'employer_staff', 'super_admin'].includes(user.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get user's company information
    const userProfile = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        companies: {
          include: {
            jobs: {
              include: {
                applications: true
              }
            },
            reviews: true
          }
        }
      }
    });

    if (!userProfile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Get primary company (first company or create basic profile)
    let company = userProfile.companies[0];
    let profileData = {};

    if (company) {
      // Calculate statistics
      const totalJobs = company.jobs.length;
      const activeJobs = company.jobs.filter(job => job.status === 'active').length;
      const totalApplications = company.jobs.reduce((sum, job) => sum + job.applications.length, 0);

      profileData = {
        // Company Information
        companyName: company.name,
        companyDescription: company.description,
        industry: company.industry,
        logoUrl: company.logoUrl,
        websiteUrl: company.websiteUrl,
        
        // Contact Information
        businessAddress: company.location,
        city: userProfile.city || '',
        state: userProfile.state || '',
        country: userProfile.country || 'Philippines',
        postalCode: userProfile.postalCode || '',
        businessPhone: userProfile.phone,
        businessEmail: userProfile.email,
        
        // Business Details
        licenseNumber: userProfile.licenseNumber || '',
        licenseExpirationDate: userProfile.licenseExpirationDate,
        employerType: userProfile.employerType || '',
        
        // Profile Settings
        showContactOnProfile: userProfile.showContactOnProfile || false,
        allowDirectContact: userProfile.allowDirectContact || true,
        profileVisibility: userProfile.profileVisibility || 'public',
        
        // Social Media
        linkedinUrl: userProfile.linkedinUrl || '',
        facebookUrl: userProfile.facebookUrl || '',
        twitterUrl: userProfile.twitterUrl || '',
        
        // Statistics
        totalJobsPosted: totalJobs,
        activeJobs: activeJobs,
        totalApplications: totalApplications,
        memberSince: userProfile.createdAt,
        
        // Company specific
        companySize: company.companySize || '',
        foundedYear: company.foundedYear || '',
      };
    } else {
      // Basic profile for users without company
      profileData = {
        companyName: userProfile.fullName + "'s Company",
        businessEmail: userProfile.email,
        businessPhone: userProfile.phone || '',
        city: userProfile.city || '',
        country: userProfile.country || 'Philippines',
        memberSince: userProfile.createdAt,
        totalJobsPosted: 0,
        activeJobs: 0,
        totalApplications: 0,
        showContactOnProfile: false,
        allowDirectContact: true,
        profileVisibility: 'public'
      };
    }

    return NextResponse.json(profileData);

  } catch (error) {
    console.error('Error fetching employer profile:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only allow employers and admins
    if (!['employer_admin', 'employer_staff', 'super_admin'].includes(user.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const profileData = await request.json();

    // Update user profile
    const userUpdateData = {
      phone: profileData.businessPhone,
      city: profileData.city,
      state: profileData.state,
      country: profileData.country,
      postalCode: profileData.postalCode,
      licenseNumber: profileData.licenseNumber,
      licenseExpirationDate: profileData.licenseExpirationDate ? new Date(profileData.licenseExpirationDate) : null,
      employerType: profileData.employerType,
      showContactOnProfile: profileData.showContactOnProfile,
      allowDirectContact: profileData.allowDirectContact,
      profileVisibility: profileData.profileVisibility,
      linkedinUrl: profileData.linkedinUrl,
      facebookUrl: profileData.facebookUrl,
      twitterUrl: profileData.twitterUrl,
    };

    await prisma.user.update({
      where: { id: user.id },
      data: userUpdateData
    });

    // Update or create company
    let company = await prisma.company.findFirst({
      where: { createdById: user.id }
    });

    const companyData = {
      name: profileData.companyName,
      description: profileData.companyDescription,
      industry: profileData.industry,
      location: profileData.businessAddress,
      logoUrl: profileData.logoUrl,
      websiteUrl: profileData.websiteUrl,
      companySize: profileData.companySize,
      foundedYear: profileData.foundedYear ? parseInt(profileData.foundedYear) : null,
    };

    if (company) {
      // Update existing company
      company = await prisma.company.update({
        where: { id: company.id },
        data: companyData
      });
    } else {
      // Create new company
      company = await prisma.company.create({
        data: {
          ...companyData,
          createdById: user.id
        }
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Profile updated successfully',
      companyId: company.id 
    });

  } catch (error) {
    console.error('Error updating employer profile:', error);
    const errorResponse = handlePrismaError(error);
    
    return NextResponse.json(
      { error: errorResponse.error || 'Failed to update profile', details: error.message },
      { status: 500 }
    );
  }
}
