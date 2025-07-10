// Prisma database client and utilities
import { PrismaClient } from '@prisma/client';

// Global instance to prevent multiple connections in development
const globalForPrisma = globalThis;

// Create Prisma client with logging in development
export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  errorFormat: 'pretty',
});

// Prevent multiple instances in development
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

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
        })
      };

      const orderBy = { [sortBy]: sortOrder };

      return await prisma.job.findMany({
        where,
        include: {
          company: true,
          categories: {
            include: {
              category: true
            }
          }
        },
        orderBy,
        take: limit,
        skip: offset,
      });
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
        })
      };

      return await prisma.job.count({ where });
    },

    // Find job by slug
    async findBySlug(slug) {
      return await prisma.job.findUnique({
        where: { slug },
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

    // Create new job
    async create(data) {
      const { categories, ...jobData } = data;
      
      return await prisma.job.create({
        data: {
          ...jobData,
          ...(categories && {
            categories: {
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
