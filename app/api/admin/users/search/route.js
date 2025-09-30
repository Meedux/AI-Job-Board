import { cookies } from 'next/headers';
import { verifyToken } from '@/utils/auth';
import { PrismaClient } from '@prisma/client';
import { USER_ROLES } from '@/utils/roleSystem';

const prisma = new PrismaClient();

// GET - Search for existing users that can become sub-users
export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return Response.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.id) {
      return Response.json({ error: 'Invalid token' }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!currentUser) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    // Only employer admins and super admins can search for users
    if (currentUser.role !== USER_ROLES.EMPLOYER_ADMIN && currentUser.role !== USER_ROLES.SUPER_ADMIN) {
      return Response.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '10');

    if (query.length < 2) {
      return Response.json({ users: [] });
    }

    // Search for job seekers and employers that are not already sub-users
    const users = await prisma.user.findMany({
      where: {
        AND: [
          {
            OR: [
              { role: USER_ROLES.JOB_SEEKER },
              { role: USER_ROLES.EMPLOYER_ADMIN }
            ]
          },
          {
            OR: [
              { email: { contains: query, mode: 'insensitive' } },
              { fullName: { contains: query, mode: 'insensitive' } },
              { username: { contains: query, mode: 'insensitive' } }
            ]
          },
          // Exclude users that are already sub-users of this employer
          {
            NOT: {
              parentUserId: currentUser.id
            }
          },
          // Exclude current user
          {
            NOT: {
              id: currentUser.id
            }
          }
        ]
      },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        role: true,
        userType: true,
        createdAt: true,
        lastLoginAt: true
      },
      take: limit,
      orderBy: [
        { fullName: 'asc' },
        { email: 'asc' }
      ]
    });

    return Response.json({ users });

  } catch (error) {
    console.error('Search users error:', error);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}