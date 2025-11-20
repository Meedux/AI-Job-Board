import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/utils/auth';
import { canCreateJob } from '@/utils/policy';
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

    // Centralized policy check for posting rules (verification, placement fees, limits)
    const verifiedDoc = await prisma.verificationDocument.findFirst({ where: { userId: user.id, status: 'verified' } });
    const activeCount = await prisma.job.count({ where: { postedById: user.id, NOT: { status: 'closed' } } });

    const decision = canCreateJob({ user, verified: !!verifiedDoc, activeCount, jobData });
    if (!decision.allowed) {
      return NextResponse.json({ error: decision.message || 'Not allowed to create job' }, { status: 403 });
    }
    
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

    // employerType related validations removed — employerType has been deprecated

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

    // Determine premium vs free (simple heuristic: verified OR active subscription plan containing 'premium')
    const userWithSubs = await prisma.user.findUnique({
      where: { id: user.id },
      include: { subscriptions: { include: { plan: true }, where: { status: 'active' } }, employerTypeUser: true }
    });
    const hasPremiumSub = !!(userWithSubs?.subscriptions?.find(s => (s.plan?.name || '').toLowerCase().includes('premium')));
    const isPremium = hasPremiumSub || !!verifiedDoc;
    const durationDays = isPremium ? 60 : 30;
    const now = new Date();
    const computedExpiresAt = jobData.endPostingOn ? new Date(jobData.endPostingOn) : new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);
    const computedApplicationDeadline = jobData.applicationDeadline ? new Date(jobData.applicationDeadline) : computedExpiresAt;

    // DMW / overseas compliance checks
    const employerSubtype = userWithSubs?.employerTypeUser?.subtype || '';
    const isDMW = employerSubtype === 'dmw';
    const isOverseas = userWithSubs?.employerTypeUser?.category === 'abroad';
    if ((isDMW || isOverseas) && !jobData.mandatoryStatement && !jobData.dmwMandatoryStatement) {
      return NextResponse.json({ error: 'Mandatory statement required for DMW/overseas postings' }, { status: 400 });
    }
    if (isDMW && jobData.isSeaBased) {
      if (!jobData.vesselName || !jobData.vesselType) {
        return NextResponse.json({ error: 'Vessel name and type required for sea-based DMW job' }, { status: 400 });
      }
    }
    if (isDMW && !jobData.isSeaBased) {
      if (!jobData.landBasedCountry) {
        return NextResponse.json({ error: 'Country required for land-based DMW job' }, { status: 400 });
      }
    }
    // Placement fee restriction for unverified
    if (!verifiedDoc && (jobData.isPlacement || jobData.placementFee)) {
      return NextResponse.json({ error: 'Placement fee features restricted until verification' }, { status: 403 });
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
        expiresAt: computedExpiresAt,
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
          // Optional short link generation: set shortUrl if requested (token will be generated client-side or by separate API)
          shortUrl: jobData.generateShortLink && jobData.shortUrl ? jobData.shortUrl : null,
        // Application settings
        applicationMethod: jobData.applicationMethod,
        externalApplicationUrl: jobData.externalApplicationUrl,
        applicationEmail: jobData.applicationEmail,
        applicationDeadline: computedApplicationDeadline,
        
        // Contact settings
        showContactOnPosting: jobData.showContactOnPosting,
        protectEmailAddress: jobData.protectEmailAddress,
        
  // Employer-specific fields (optional)
  licenseNumber: jobData.licenseNumber,
  licenseExpirationDate: jobData.licenseExpirationDate ? new Date(jobData.licenseExpirationDate) : null,
  overseasStatement: jobData.overseasStatement,
  placementFee: jobData.placementFee ? parseFloat(jobData.placementFee) : null,
  placementFeeCurrency: jobData.placementFeeCurrency || jobData.currency || null,
  placementFeeNotes: jobData.placementFeeNotes || null,
  isPlacement: jobData.isPlacement || false,
        
        // Additional features
        allowPreview: jobData.allowPreview,
        generateQRCode: jobData.generateQRCode,
        generateSocialTemplate: jobData.generateSocialTemplate,
        
  // Mode
  mode: jobData.mode,
  // Functional & specialization fields
  functionalRole: jobData.functionalRole || null,
  specialization: jobData.specialization || null,
  course: jobData.course || null,
  region: jobData.region || null,
  mandatoryStatement: !!(jobData.mandatoryStatement || jobData.dmwMandatoryStatement),
  dmwMandatoryStatement: jobData.dmwMandatoryStatement || null,
  principalEmployer: jobData.principalEmployer || jobData.principal || null,
  validPassport: !!jobData.validPassport,
  isSeaBased: !!jobData.isSeaBased,
  vesselName: jobData.vesselName || null,
  vesselType: jobData.vesselType || null,
  vesselFlag: jobData.vesselFlag || null,
  landBasedCountry: jobData.landBasedCountry || null,
  landBasedLicenseNumber: jobData.landBasedLicenseNumber || null,
  dealBreakers: Array.isArray(jobData.dealBreakers) ? jobData.dealBreakers : [],
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
        premium: isPremium,
        expiresAt: job.expiresAt,
        applicationDeadline: job.applicationDeadline
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
