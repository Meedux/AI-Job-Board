// API route for individual job operations using Prisma
import { db, handlePrismaError } from '../../../../utils/db';

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
        description: job.company.description
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
