// API route for individual job operations using Prisma
import { db, handlePrismaError, prisma } from '../../../../utils/db';
import { canCreateJob } from '@/utils/policy';
import { cookies } from 'next/headers';

// PUT - Update a job by id (RESTful endpoint)
export async function PUT(request, { params }) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('auth-token');
    if (!token) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from token value (token may store user id or email)
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { id: token.value },
          { email: token.value }
        ]
      }
    });

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    const jobId = params.id;
    const jobData = await request.json();

    // Fetch existing job and check permissions
    const existingJob = await prisma.job.findUnique({
      where: { id: jobId },
      include: { postedBy: { select: { id: true, parentUserId: true } } }
    });

    if (!existingJob) {
      return Response.json({ error: 'Job not found' }, { status: 404 });
    }

    const canUpdate = existingJob.postedById === user.id ||
      (user.role === 'employer_admin' && existingJob.postedBy.parentUserId === user.id) ||
      user.role === 'super_admin';

    if (!canUpdate) {
      return Response.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Enforce policy when updating employer-specific fields (placement, placementFee)
    try {
      const verifiedDoc = await prisma.verificationDocument.findFirst({ where: { userId: user.id, status: 'verified' } });
      // Exclude current job from active count
      const activeCount = await prisma.job.count({ where: { postedById: user.id, NOT: { status: 'closed', id: jobId } } });
      const decision = canCreateJob({ user, verified: !!verifiedDoc, activeCount, jobData });
      if (!decision.allowed) {
        return Response.json({ error: decision.message || 'Not allowed to update job' }, { status: 403 });
      }
    } catch (e) {
      // Continue — if policy check fails unexpectedly, let update proceed under existing permission model
      console.warn('Policy check failed during job update, proceeding with existing checks:', e?.message || e);
    }

    // Update using db helper (handles categories mapping)
    const updatedJob = await db.jobs.update(jobId, jobData);

    return Response.json({ success: true, job: updatedJob, message: 'Job updated successfully' });

  } catch (error) {
    console.error('Error updating job:', error);
    const errResponse = handlePrismaError(error);
    return Response.json({ error: errResponse.error || 'Failed to update job', details: error.message }, { status: 500 });
  }
}

export async function GET(request, { params }) {
  try {
    const jobSlug = await params.id; // This will be the slug since we're using slug as ID

    if (!jobSlug) {
      return Response.json(
        { error: 'Job slug is required' },
        { status: 400 }
      );
    }

    // Find job by slug using Prisma
    const job = await db.jobs.findBySlug(jobSlug);

    if (!job) {
      return Response.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Increment view count
    try {
      await db.jobs.incrementViews(job.id);
    } catch (viewError) {
      console.warn('Failed to increment view count:', viewError);
    }

    // Transform job data
    const transformedJob = {
      id: job.id,
      slug: job.slug,
      title: job.title,
      description: job.description,
      full_description: job.description, // Provide description as full_description for backward compatibility
      requirements: job.requirements,
      benefits: job.benefits,
      content_doc_url: job.contentDocUrl,
      salary: {
        from: job.salaryFrom,
        to: job.salaryTo,
        currency: job.salaryCurrency,
        period: job.salaryPeriod,
        range: job.salaryFrom && job.salaryTo 
          ? `${job.salaryFrom} - ${job.salaryTo}` 
          : (job.salaryFrom || job.salaryTo || null)
      },
      location: job.location,
      remote: job.remoteType === 'full' ? 'Yes' : 
              job.remoteType === 'hybrid' ? 'Hybrid' : 'No',
      remote_type: job.remoteType,
      type: job.jobType,
      level: job.experienceLevel,
      posted_time: job.postedAt,
      expire_time: job.expiresAt,
      apply_link: job.applyUrl || job.applyEmail,
      company: {
        id: job.company.id,
        name: job.company.name,
        logo: job.company.logoUrl,
        website: job.company.websiteUrl,
        location: job.company.location,
        description: job.company.description,
        verificationStatus: job.postedBy?.verificationStatus || 'unverified',
        isVerified: job.postedBy?.isVerified || false,
        employerType: job.postedBy?.employerTypeUser ? {
          id: job.postedBy.employerTypeUser.id,
          code: job.postedBy.employerTypeUser.code,
          label: job.postedBy.employerTypeUser.label,
          category: job.postedBy.employerTypeUser.category,
          type: job.postedBy.employerTypeUser.type,
          subtype: job.postedBy.employerTypeUser.subtype,
          description: job.postedBy.employerTypeUser.description
        } : null
      },
      company_name: job.company.name, // Backward compatibility
      company_logo: job.company.logoUrl, // Backward compatibility
      categories: job.categories.map(cat => cat.category.name),
      category_slugs: job.categories.map(cat => cat.category.slug),
      views_count: job.viewsCount + 1, // Include the increment
      is_featured: job.isFeatured,
      status: job.status,
      required_skills: job.requiredSkills || [],
      preferred_skills: job.preferredSkills || [],
      generate_qr_code: job.generateQRCode,
      qr_image_path: job.qrImagePath,
      postedAt: job.postedAt,
    };

    return Response.json(transformedJob, {
      headers: {
        'Cache-Control': 'public, max-age=300, s-maxage=600',
      }
    });

  } catch (error) {
    console.error('Error fetching job details:', error);
    
    const errorResponse = handlePrismaError(error);
    
    return Response.json(
      { error: errorResponse.error || 'Failed to fetch job', details: error.message },
      { status: 500 }
    );
  }
}
