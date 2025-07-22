// API route to fetch jobs from PostgreSQL database using Prisma
import { db, handlePrismaError } from '../../../utils/db';
import { verifyToken, getUserFromRequest } from '../../../utils/auth';

// Simple in-memory cache for performance
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';
    const location = searchParams.get('location') || '';
    const type = searchParams.get('type') || '';
    const level = searchParams.get('level') || '';
    const category = searchParams.get('category') || '';
    const remote = searchParams.get('remote') === 'true';
    const includeExpired = searchParams.get('includeExpired') === 'true';
    const sortBy = searchParams.get('sortBy') || 'postedAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const employer = searchParams.get('employer') === 'true'; // Filter for employer's own jobs

    // Handle employer filtering - get authenticated user if filtering by employer
    let userFilter = null;
    if (employer) {
      const user = await getUserFromRequest(request);
      if (!user || !['employer_admin', 'super_admin'].includes(user.role)) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
      }
      userFilter = user;
    }

    // Create cache key from all parameters (including employer filter)
    const cacheKey = `jobs-${JSON.stringify({
      page, search, location, type, level, category, remote, includeExpired, sortBy, sortOrder, limit, employer, userId: userFilter?.id
    })}`;

    // Check cache first (skip cache for employer-specific requests for real-time data)
    if (!employer && cache.has(cacheKey)) {
      const { data, timestamp } = cache.get(cacheKey);
      if (Date.now() - timestamp < CACHE_DURATION) {
        return Response.json(data, {
          headers: {
            'Cache-Control': 'public, max-age=300, s-maxage=300',
            'X-Cache': 'HIT'
          }
        });
      }
      cache.delete(cacheKey);
    }

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Build filters object for database query
    const filters = {
      search: search || undefined,
      location: location || undefined,
      jobType: type || undefined,
      experienceLevel: level || undefined,
      category: category || undefined,
      remote,
      includeExpired,
      sortBy,
      sortOrder,
      limit,
      offset
    };

    // Add employer filter if specified
    if (employer && userFilter) {
      // For employer admin, filter by jobs posted by them or their sub-users
      if (userFilter.role === 'employer_admin') {
        const baseUserId = userFilter.parentUserId || userFilter.id;
        filters.postedByEmployer = {
          OR: [
            { postedById: userFilter.id }, // Jobs posted by this user
            { postedById: baseUserId }, // Jobs posted by parent user (for sub_users)
            { 
              postedBy: { 
                OR: [
                  { id: userFilter.id },
                  { id: baseUserId },
                  { parentUserId: baseUserId }
                ]
              }
            }
          ]
        };
      }
      // Super admin sees all jobs (no additional filter needed)
    }

    // Remove undefined values from filters
    Object.keys(filters).forEach(key => {
      if (filters[key] === undefined || filters[key] === '') {
        delete filters[key];
      }
    });

    // Fetch jobs and total count from database using Prisma
    const [jobs, totalJobs] = await Promise.all([
      db.jobs.findMany(filters),
      db.jobs.count(filters)
    ]);

    // Transform database results to match expected format
    const transformedJobs = jobs.map(job => ({
      id: job.id,
      slug: job.slug,
      title: job.title,
      description: job.description,
      full_description: job.description, // Provide description as full_description for backward compatibility
      requirements: job.requirements,
      benefits: job.benefits,
      content_doc_url: job.contentDocUrl,
      companyId: job.companyId, // Add companyId for review functionality
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
        location: job.company.location
      },
      company_name: job.company.name, // Backward compatibility
      company_logo: job.company.logoUrl, // Backward compatibility
      categories: job.categories.map(cat => cat.category.name),
      category_slugs: job.categories.map(cat => cat.category.slug),
      views_count: job.viewsCount,
      is_featured: job.isFeatured,
      status: job.status,
      required_skills: job.requiredSkills || [],
      preferred_skills: job.preferredSkills || [],
      // Additional computed fields
      postedAt: job.postedAt,
    }));

    const responseData = {
      jobs: transformedJobs,
      total: totalJobs,
      page,
      limit,
      totalPages: Math.ceil(totalJobs / limit),
      hasMore: totalJobs > page * limit,
      filters: Object.keys(filters).filter(key => filters[key]).length // Return applied filters count
    };

    // Cache the response (skip caching for employer-specific requests)
    if (!employer) {
      cache.set(cacheKey, { data: responseData, timestamp: Date.now() });
    }

    return Response.json(responseData, {
      headers: {
        'Cache-Control': employer ? 'no-cache, no-store, must-revalidate' : 'public, max-age=300, s-maxage=300',
        'X-Cache': 'MISS'
      }
    });

  } catch (error) {
    console.error('Error fetching jobs from database:', error);
    
    const errorResponse = handlePrismaError(error);
    
    return Response.json(
      { error: errorResponse.error || 'Failed to fetch jobs', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    // Verify authentication for posting jobs
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return Response.json({ error: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const user = await verifyToken(token);
    
    if (!user) {
      return Response.json({ error: 'Invalid token' }, { status: 401 });
    }

    const jobData = await request.json();

    // Validate required fields
    const requiredFields = ['title', 'description', 'location', 'jobType', 'companyId'];
    for (const field of requiredFields) {
      if (!jobData[field]) {
        return Response.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Generate slug if not provided
    if (!jobData.slug) {
      jobData.slug = jobData.title.toLowerCase()
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .replace(/\s+/g, '-');
      
      // Make slug unique
      let counter = 1;
      let uniqueSlug = jobData.slug;
      while (await db.jobs.findBySlug(uniqueSlug)) {
        uniqueSlug = `${jobData.slug}-${counter}`;
        counter++;
      }
      jobData.slug = uniqueSlug;
    }

    // Create job in database using Prisma
    const newJob = await db.jobs.create({
      ...jobData,
      postedById: user.id,
      status: 'active'
    });

    // Transform response to match expected format
    const response = {
      id: newJob.id,
      slug: newJob.slug,
      title: newJob.title,
      status: newJob.status,
      posted_at: newJob.postedAt,
      message: 'Job posted successfully'
    };

    return Response.json(response, { status: 201 });

  } catch (error) {
    console.error('Error creating job:', error);
    
    const errorResponse = handlePrismaError(error);
    
    return Response.json(
      { error: errorResponse.error || 'Failed to create job', details: error.message },
      { status: 500 }
    );
  }
}
