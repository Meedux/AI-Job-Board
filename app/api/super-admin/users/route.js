import { NextResponse } from 'next/server';
import prisma from '../../../../utils/db';
import { getUserFromRequest } from '../../../../utils/auth';

// GET - List all users with pagination and filtering
export async function GET(request) {
  try {
    const user = getUserFromRequest(request);
    
    if (!user || user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 50;
    const role = searchParams.get('role');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const skip = (page - 1) * limit;

    // Build where clause
    const where = {};
    
    if (role && role !== 'all') {
      where.role = role;
    }
    
    if (status && status !== 'all') {
      where.accountStatus = status;
    }
    
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          subscriptions: {
            include: {
              plan: true
            },
            orderBy: { createdAt: 'desc' },
            take: 1
          },
          _count: {
            select: {
              applications: true,
              postedJobs: true
            }
          }
        }
      }),
      prisma.user.count({ where })
    ]);

    return NextResponse.json({ 
      success: true, 
      users,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch users' 
    }, { status: 500 });
  }
}
