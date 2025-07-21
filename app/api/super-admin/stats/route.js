import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/utils/auth';
import { prisma } from '@/utils/db';

export async function GET(request) {
  try {
    const user = getUserFromRequest(request);
    
    if (!user || user.role !== 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'Super admin access required' },
        { status: 403 }
      );
    }

    // Get all stats in parallel for better performance
    const [
      totalUsers,
      totalRevenue,
      activeSubscriptions,
      totalCreditsIssued,
      totalJobs,
      totalCompanies
    ] = await Promise.all([
      // Total users
      prisma.user.count(),
      
      // Total revenue (sum of all successful transactions)
      prisma.paymentTransaction.aggregate({
        where: {
          status: 'completed'
        },
        _sum: {
          amount: true
        }
      }),
      
      // Active subscriptions
      prisma.userSubscription.count({
        where: {
          status: 'active',
          expiresAt: {
            gte: new Date()
          }
        }
      }),
      
      // Total credits issued (sum of all purchased credits)
      prisma.userCredit.aggregate({
        _sum: {
          totalPurchased: true
        }
      }),
      
      // Total jobs
      prisma.job.count(),
      
      // Total companies
      prisma.company.count()
    ]);

    const stats = {
      totalUsers,
      totalRevenue: totalRevenue._sum.amount || 0,
      activeSubscriptions,
      totalCreditsIssued: totalCreditsIssued._sum.totalPurchased || 0,
      totalJobs,
      totalCompanies
    };

    return NextResponse.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('❌ Error fetching super admin stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
