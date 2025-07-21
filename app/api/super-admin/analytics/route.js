import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getUserFromRequest } from '@/utils/auth';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user || user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const dateRange = searchParams.get('dateRange') || '30d';

    // Calculate date range
    const now = new Date();
    let startDate;
    switch (dateRange) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // System Overview Statistics
    const [
      totalUsers,
      totalJobs,
      totalApplications,
      totalCompanies,
      activeUsers,
      recentUsers,
      recentJobs,
      recentApplications
    ] = await Promise.all([
      // Total users
      prisma.user.count(),
      
      // Total jobs
      prisma.job.count(),
      
      // Total applications
      prisma.jobApplication.count(),
      
      // Total companies (unique employers)
      prisma.user.count({
        where: {
          role: {
            in: ['employer_admin', 'sub_user']
          }
        }
      }),
      
      // Active users (logged in within date range)
      prisma.user.count({
        where: {
          lastLoginAt: {
            gte: startDate
          }
        }
      }),
      
      // Recent users (created within date range)
      prisma.user.count({
        where: {
          createdAt: {
            gte: startDate
          }
        }
      }),
      
      // Recent jobs (created within date range)
      prisma.job.count({
        where: {
          createdAt: {
            gte: startDate
          }
        }
      }),
      
      // Recent applications (created within date range)
      prisma.jobApplication.count({
        where: {
          createdAt: {
            gte: startDate
          }
        }
      })
    ]);

    // User growth over time (daily stats for the period)
    const userGrowthData = await prisma.user.groupBy({
      by: ['createdAt'],
      _count: {
        id: true
      },
      where: {
        createdAt: {
          gte: startDate
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Job posting trends
    const jobTrendsData = await prisma.job.groupBy({
      by: ['createdAt'],
      _count: {
        id: true
      },
      where: {
        createdAt: {
          gte: startDate
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // User types breakdown
    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: {
        id: true
      }
    });

    // Subscription statistics
    const subscriptionStats = await prisma.userSubscription.groupBy({
      by: ['status'],
      _count: {
        id: true
      }
    });

    // Top performing companies (by job posts and applications)
    const topCompanies = await prisma.user.findMany({
      where: {
        role: 'employer_admin',
        postedJobs: {
          some: {}
        }
      },
      select: {
        id: true,
        companyName: true,
        email: true,
        createdAt: true,
        _count: {
          select: {
            postedJobs: true
          }
        },
        postedJobs: {
          select: {
            _count: {
              select: {
                applications: true
              }
            }
          }
        }
      },
      orderBy: {
        postedJobs: {
          _count: 'desc'
        }
      },
      take: 10
    });

    // System health metrics
    const systemHealth = {
      activeJobsCount: await prisma.job.count({
        where: {
          status: 'active'
        }
      }),
      pendingApplicationsCount: await prisma.jobApplication.count({
        where: {
          status: 'pending'
        }
      }),
      totalCreditsIssued: await prisma.userCredit.aggregate({
        _sum: {
          totalPurchased: true
        }
      }),
      totalCreditsUsed: await prisma.userCredit.aggregate({
        _sum: {
          usedCredits: true
        }
      })
    };

    // Recent platform activities
    const recentActivities = await prisma.aTSActivity.findMany({
      take: 20,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            email: true,
            companyName: true,
            role: true
          }
        }
      }
    });

    // Revenue statistics (if payment transactions exist)
    let revenueStats = null;
    try {
      revenueStats = await prisma.paymentTransaction.aggregate({
        _sum: {
          amount: true
        },
        _count: {
          id: true
        },
        where: {
          status: 'completed',
          createdAt: {
            gte: startDate
          }
        }
      });
    } catch (error) {
      console.log('Revenue stats not available:', error.message);
    }

    // Calculate percentages and format data
    const analytics = {
      // Overview metrics
      overview: {
        totalUsers,
        totalJobs,
        totalApplications,
        totalCompanies,
        activeUsers,
        recentUsers,
        recentJobs,
        recentApplications
      },
      
      // Growth trends
      userGrowth: userGrowthData.map(item => ({
        date: item.createdAt.toISOString().split('T')[0],
        count: item._count.id
      })),
      
      jobTrends: jobTrendsData.map(item => ({
        date: item.createdAt.toISOString().split('T')[0],
        count: item._count.id
      })),
      
      // User demographics
      usersByRole: usersByRole.map(item => ({
        role: item.role,
        count: item._count.id,
        percentage: Math.round((item._count.id / totalUsers) * 100)
      })),
      
      // Subscription breakdown
      subscriptionBreakdown: subscriptionStats.map(item => ({
        status: item.status,
        count: item._count.id
      })),
      
      // Top performing companies
      topCompanies: topCompanies.map(company => ({
        id: company.id,
        name: company.companyName || company.email,
        email: company.email,
        jobsPosted: company._count.postedJobs,
        totalApplications: company.postedJobs.reduce((sum, job) => sum + job._count.applications, 0),
        joinedDate: company.createdAt
      })),
      
      // System health
      systemHealth: {
        ...systemHealth,
        creditsUtilization: systemHealth.totalCreditsIssued?._sum?.totalPurchased ? 
          Math.round((systemHealth.totalCreditsUsed?._sum?.usedCredits || 0) / systemHealth.totalCreditsIssued._sum.totalPurchased * 100) : 0
      },
      
      // Recent activities
      recentActivities: recentActivities.map(activity => ({
        id: activity.id,
        type: activity.activityType,
        description: activity.description,
        user: activity.user,
        createdAt: activity.createdAt
      })),
      
      // Revenue (if available)
      revenue: revenueStats ? {
        total: revenueStats._sum.amount || 0,
        transactionCount: revenueStats._count.id || 0
      } : null
    };

    return NextResponse.json(analytics);

  } catch (error) {
    console.error('Super admin analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
