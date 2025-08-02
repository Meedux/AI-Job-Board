import { NextResponse } from 'next/server';
import { verifyToken, getUserFromRequest } from '../../../../utils/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user has permission to post jobs
    const allowedRoles = ['super_admin', 'employer_admin', 'sub_user'];
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions to post jobs' },
        { status: 403 }
      );
    }

    const jobData = await request.json();
    
    // Validate required fields - check both old and new field names
    const title = jobData.title || jobData.jobTitle;
    const description = jobData.description || jobData.jobDescription;
    const companyName = jobData.company || jobData.companyName;
    
    if (!title || title.toString().trim() === '') {
      return NextResponse.json(
        { error: 'Job title is required' },
        { status: 400 }
      );
    }
    
    if (!description || description.toString().trim() === '') {
      return NextResponse.json(
        { error: 'Job description is required' },
        { status: 400 }
      );
    }
    
    if (!companyName || companyName.toString().trim() === '') {
      return NextResponse.json(
        { error: 'Company name is required' },
        { status: 400 }
      );
    }

    // Additional validation for overseas employers
    if (jobData.employerType?.startsWith('overseas_')) {
      if (!jobData.overseasStatement) {
        return NextResponse.json(
          { error: 'Overseas statement selection is required for international jobs' },
          { status: 400 }
        );
      }
      
      // Overseas jobs must have salary information
      if (!jobData.showCompensation || (!jobData.customSalaryMin && !jobData.salaryRange)) {
        return NextResponse.json(
          { error: 'Salary information is required for overseas job postings' },
          { status: 400 }
        );
      }
    }

    // Validate license for agencies
    const requiresLicense = ['local_pra', 'local_do174', 'local_cda', 'overseas_manning', 'overseas_recruitment'];
    if (requiresLicense.includes(jobData.employerType) && !jobData.licenseNumber) {
      return NextResponse.json(
        { error: 'License number is required for your employer type' },
        { status: 400 }
      );
    }

    // Generate slug
    const baseSlug = jobData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    let slug = baseSlug;
    let counter = 1;
    
    // Ensure unique slug
    while (await prisma.job.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Find or create company
    let company = await prisma.company.findFirst({
      where: { name: companyName }
    });

    if (!company) {
      company = await prisma.company.create({
        data: {
          name: companyName,
          industry: jobData.industry || 'Other',
          location: jobData.location || `${jobData.city}, ${jobData.state || jobData.country}`,
          createdById: user.id,
        }
      });
    }

    // Calculate salary values
    let salaryFrom = null;
    let salaryTo = null;
    
    if (jobData.showCompensation) {
      if (jobData.salaryRange && jobData.salaryRange !== 'custom' && jobData.salaryRange !== 'minimum_wage') {
        const range = jobData.salaryRange.split('-');
        if (range.length === 2) {
          salaryFrom = parseInt(range[0]);
          salaryTo = parseInt(range[1]);
        }
      } else if (jobData.customSalaryMin && jobData.customSalaryMax) {
        salaryFrom = parseInt(jobData.customSalaryMin);
        salaryTo = parseInt(jobData.customSalaryMax);
      }
    }

    // Create job posting
    const job = await prisma.job.create({
      data: {
        title: title,
        slug: slug,
        description: description,
        requirements: jobData.qualification || jobData.requirements,
        benefits: jobData.benefits || null,
        salaryFrom: salaryFrom,
        salaryTo: salaryTo,
        salaryCurrency: jobData.currency || 'PHP',
        location: jobData.location || `${jobData.city}, ${jobData.state || jobData.country}`,
        remoteType: jobData.workMode === 'remote' ? 'full' : 
                   jobData.workMode === 'hybrid' ? 'hybrid' : 'none',
        jobType: jobData.jobType,
        experienceLevel: jobData.experienceLevel,
        requiredSkills: jobData.requiredSkills || jobData.skillsRequired || [],
        preferredSkills: jobData.preferredSkills || [],
        expiresAt: jobData.endPostingOn ? new Date(jobData.endPostingOn) : null,
        status: 'draft', // Start as draft, publish later
        companyId: company.id,
        postedById: user.id,
        
        // Extended fields for comprehensive posting
        numberOfOpenings: jobData.numberOfOpenings || 1,
        educationAttainment: jobData.educationAttainment,
        employmentType: jobData.employmentType,
        industry: jobData.industry,
        subIndustry: jobData.subIndustry,
        
        // Location details
        city: jobData.city,
        state: jobData.state,
        postalCode: jobData.postalCode,
        country: jobData.country,
        
        // Salary details
        salaryPeriod: jobData.salaryPeriod,
        salaryRange: jobData.salaryRange,
        showCompensation: jobData.showCompensation,
        
        // Application settings
        applicationMethod: jobData.applicationMethod,
        externalApplicationUrl: jobData.externalApplicationUrl,
        applicationEmail: jobData.applicationEmail,
        applicationDeadline: jobData.applicationDeadline ? new Date(jobData.applicationDeadline) : null,
        
        // Contact settings
        showContactOnPosting: jobData.showContactOnPosting,
        protectEmailAddress: jobData.protectEmailAddress,
        
        // Employer-specific fields
        licenseNumber: jobData.licenseNumber,
        licenseExpirationDate: jobData.licenseExpirationDate ? new Date(jobData.licenseExpirationDate) : null,
        overseasStatement: jobData.overseasStatement,
        
        // Additional features
        allowPreview: jobData.allowPreview,
        generateQRCode: jobData.generateQRCode,
        generateSocialTemplate: jobData.generateSocialTemplate,
        
        // Mode and employer type
        mode: jobData.mode,
        employerType: jobData.employerType,
      }
    });

    // Create prescreen questions if any
    if (jobData.prescreenQuestions && jobData.prescreenQuestions.length > 0) {
      const formData = {
        title: `${jobData.title} - Application Form`,
        description: `Custom application form for ${jobData.title} position`,
        fields: JSON.stringify(jobData.prescreenQuestions),
        jobId: job.id,
        createdBy: user.id,
      };

      await prisma.applicationForm.create({
        data: formData
      });
    }

    // Log the job creation
    console.log(`📋 Comprehensive job created: ${job.title} (${job.id}) by ${user.email}`);

    return NextResponse.json({
      success: true,
      message: 'Job posting created successfully',
      job: {
        id: job.id,
        slug: job.slug,
        title: job.title,
        status: job.status,
        companyName: jobData.companyName,
        mode: jobData.mode,
        employerType: jobData.employerType,
      }
    });

  } catch (error) {
    console.error('Error creating comprehensive job posting:', error);
    
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
  } finally {
    await prisma.$disconnect();
  }
}
