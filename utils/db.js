// Prisma database client and utilities
import { PrismaClient } from '@prisma/client';

// Global instance to prevent multiple connections in development
const globalForPrisma = globalThis;

// Create Prisma client with proper configuration
export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  errorFormat: 'pretty',
});

// Prevent multiple instances in development
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Ensure the client is connected
async function connectPrisma() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}

// Initialize connection
connectPrisma().catch(console.error);

// Database utility functions
export const db = {
  // Jobs
  jobs: {
    // Get jobs with filtering, pagination, and search
    async findMany(options = {}) {
      const {
        search,
        location,
        jobType,
        experienceLevel,
        category,
        remote,
        includeExpired = false,
        sortBy = 'postedAt',
        sortOrder = 'desc',
        limit = 10,
        offset = 0,
        postedByEmployer, // New employer filter
      } = options;

      const where = {
        status: 'active',
        ...(includeExpired ? {} : {
          OR: [
            { expiresAt: null },
            { expiresAt: { gte: new Date() } }
          ]
        }),
        ...(search && {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { company: { name: { contains: search, mode: 'insensitive' } } },
          ]
        }),
        ...(location && {
          location: { contains: location, mode: 'insensitive' }
        }),
        ...(jobType && { jobType }),
        ...(experienceLevel && { experienceLevel }),
        ...(remote && { remoteType: { not: 'no' } }),
        ...(category && {
          categories: {
            some: {
              category: {
                slug: category
              }
            }
          }
        }),
        ...(postedByEmployer && postedByEmployer) // Add employer filter
      };

      const orderBy = { [sortBy]: sortOrder };

      const results = await prisma.job.findMany({
        where,
        include: {
          company: {
            include: {
              createdBy: {
                select: {
                  id: true,
                  isVerified: true,
                  verificationStatus: true
                }
              }
            }
          },
          employerType: {
            include: { requirements: true }
          },
          categories: {
            include: {
              category: true
            }
          },
          postedBy: {
            select: {
              id: true,
              fullName: true,
              email: true,
              verificationDocuments: {
                where: { status: 'verified' },
                select: { id: true, category: true, fileType: true }
              }
            }
          },
          applicationForm: {
            select: {
              id: true,
              title: true,
              description: true,
              fields: true,
              isActive: true
            }
          }
        },
        orderBy,
        take: limit,
        skip: offset,
      });

      // Map results to include company_verified boolean derived from postedBy.verificationDocuments
      const mapped = results.map(job => {
        const verifiedDocs = job.postedBy?.verificationDocuments || [];
        const verifiedCount = verifiedDocs.length;
        const company_verified = verifiedCount > 0;
        // Expose summarized categories to make it easy for UIs to check which verified documents exist
        const employerVerifiedCategories = Array.from(new Set(verifiedDocs.map(d => d.category).filter(Boolean)));
        // Remove the raw verificationDocuments to avoid leaking file metadata
        if (job.postedBy && job.postedBy.verificationDocuments) delete job.postedBy.verificationDocuments;
        return { ...job, company_verified, employerVerifiedCategories };
      });

      return mapped;
    },

    // Count jobs with same filters
    async count(options = {}) {
      const {
        search,
        location,
        jobType,
        experienceLevel,
        category,
        remote,
        includeExpired = false,
        postedByEmployer, // New employer filter
      } = options;

      const where = {
        status: 'active',
        ...(includeExpired ? {} : {
          OR: [
            { expiresAt: null },
            { expiresAt: { gte: new Date() } }
          ]
        }),
        ...(search && {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { company: { name: { contains: search, mode: 'insensitive' } } },
          ]
        }),
        ...(location && {
          location: { contains: location, mode: 'insensitive' }
        }),
        ...(jobType && { jobType }),
        ...(experienceLevel && { experienceLevel }),
        ...(remote && { remoteType: { not: 'no' } }),
        ...(category && {
          categories: {
            some: {
              category: {
                slug: category
              }
            }
          }
        }),
        ...(postedByEmployer && postedByEmployer) // Add employer filter
      };

      return await prisma.job.count({ where });
    },

    // Find job by slug
    async findBySlug(slug) {
      const job = await prisma.job.findUnique({
        where: { slug },
        include: {
          company: true,
          employerType: { include: { requirements: true } },
          categories: {
            include: {
              category: true
            }
          },
          postedBy: {
            select: {
              id: true,
              fullName: true,
              email: true,
              verificationStatus: true,
              isVerified: true,
              verificationDocuments: {
                where: { status: 'verified' },
                select: { id: true }
              },
              employerTypeUser: {
                select: {
                  id: true,
                  code: true,
                  label: true,
                  category: true,
                  type: true,
                  subtype: true,
                  description: true
                }
              }
            }
          },
          applicationForm: {
            select: {
              id: true,
              title: true,
              description: true,
              fields: true,
              isActive: true
            }
          }
        }
      });

      if (!job) return null;
      const verifiedDocs = job.postedBy?.verificationDocuments || [];
      const verifiedCount = verifiedDocs.length || 0;
      const company_verified = verifiedCount > 0;
      const employerVerifiedCategories = Array.from(new Set(verifiedDocs.map(d => d.category).filter(Boolean)));
      if (job.postedBy && job.postedBy.verificationDocuments) delete job.postedBy.verificationDocuments;
      return { ...job, company_verified, employerVerifiedCategories };
    },

    // Create new job
    async create(data) {
      const { categories, companyId, companyName, company, postedById, ...jobData } = data;

      // Build company relation handling: prefer explicit companyId, then company object, then companyName (connectOrCreate)
      const companyRelation = companyId
        ? { connect: { id: companyId } }
        : company?.id
          ? { connect: { id: company.id } }
          : companyName
            ? { connectOrCreate: { where: { name: companyName }, create: { name: companyName } } }
            : undefined;

      const postedByRelation = postedById ? { postedBy: { connect: { id: postedById } } } : undefined;

      const createData = {
        ...jobData,
        ...(companyRelation && { company: companyRelation }),
        ...(postedByRelation && postedByRelation),
        ...(categories && {
          categories: {
            create: categories.map(categoryId => ({
              categoryId
            }))
          }
        })
      };

      return await prisma.job.create({
        data: createData,
        include: {
          company: true,
          categories: {
            include: {
              category: true
            }
          }
        }
      });
    },

    // Update job
    async update(id, data) {
      const { categories, ...jobData } = data;
      
      return await prisma.job.update({
        where: { id },
        data: {
          ...jobData,
          ...(categories && {
            categories: {
              deleteMany: {},
              create: categories.map(categoryId => ({
                categoryId
              }))
            }
          })
        },
        include: {
          company: true,
          categories: {
            include: {
              category: true
            }
          }
        }
      });
    },

    // Increment view count
    async incrementViews(id) {
      return await prisma.job.update({
        where: { id },
        data: {
          viewsCount: {
            increment: 1
          }
        }
      });
    }
  },

  // Companies
  companies: {
    async findMany() {
      return await prisma.company.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' }
      });
    },

    async findByName(name) {
      return await prisma.company.findUnique({
        where: { name }
      });
    },

    async create(data) {
      return await prisma.company.create({
        data
      });
    },

    async upsert(name, data) {
      return await prisma.company.upsert({
        where: { name },
        update: data,
        create: { name, ...data }
      });
    }
  },

  // Categories
  categories: {
    async findMany() {
      return await prisma.jobCategory.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' }
      });
    },

    async findBySlug(slug) {
      return await prisma.jobCategory.findUnique({
        where: { slug }
      });
    },

    async create(data) {
      return await prisma.jobCategory.create({
        data
      });
    },

    async upsert(slug, data) {
      return await prisma.jobCategory.upsert({
        where: { slug },
        update: data,
        create: { slug, ...data }
      });
    }
  },

  // Users
  users: {
    async findByEmail(email) {
      return await prisma.user.findUnique({
        where: { email }
      });
    },

    async findByUid(uid) {
      return await prisma.user.findUnique({
        where: { uid }
      });
    },

    async create(data) {
      return await prisma.user.create({
        data
      });
    },

    async update(id, data) {
      return await prisma.user.update({
        where: { id },
        data
      });
    },

    async updateByEmail(email, data) {
      return await prisma.user.update({
        where: { email },
        data
      });
    },

    async findMany(options = {}) {
      const { skip = 0, take = 10, search, role, isActive = true } = options;
      
      const where = {
        ...(isActive !== undefined && { isActive }),
        ...(search && {
          OR: [
            { fullName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { nickname: { contains: search, mode: 'insensitive' } }
          ]
        }),
        ...(role && { role })
      };

      return await prisma.user.findMany({
        skip,
        take,
        where,
        orderBy: { createdAt: 'desc' }
      });
    },

    async count(options = {}) {
      const { search, role, isActive = true } = options;
      
      const where = {
        ...(isActive !== undefined && { isActive }),
        ...(search && {
          OR: [
            { fullName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { nickname: { contains: search, mode: 'insensitive' } }
          ]
        }),
        ...(role && { role })
      };

      return await prisma.user.count({ where });
    }
  },

  // Applications
  applications: {
    async create(data) {
      return await prisma.jobApplication.create({
        data,
        include: {
          job: {
            include: {
              company: true
            }
          },
          user: true
        }
      });
    },

    async findByUser(userId) {
      return await prisma.jobApplication.findMany({
        where: { userId },
        include: {
          job: {
            include: {
              company: true
            }
          }
        },
        orderBy: { appliedAt: 'desc' }
      });
    }
  }
};

// Transaction helper
export const transaction = async (callback) => {
  return await prisma.$transaction(callback);
};

// Graceful shutdown
export const disconnect = async () => {
  await prisma.$disconnect();
};

// Error handling helper
export const handlePrismaError = (error) => {
  if (error.code === 'P2002') {
    return { error: 'A record with this data already exists' };
  }
  if (error.code === 'P2025') {
    return { error: 'Record not found' };
  }
  return { error: 'Database operation failed' };
};

export default prisma;
