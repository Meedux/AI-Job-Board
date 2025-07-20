import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/utils/auth';
import { PrismaClient } from '@prisma/client';
import { USER_ROLES } from '@/utils/roleSystem';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.id) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        parentUser: {
          select: {
            id: true,
            fullName: true,
            email: true,
            companyName: true
          }
        },
        atsActivities: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            activityType: true,
            description: true,
            createdAt: true
          }
        },
        resumeExports: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            candidateName: true,
            exportedAt: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Calculate stats
    const stats = {
      resumeCreditsUsed: user.usedResumeCredits || 0,
      resumeCreditsAllocated: user.allocatedResumeCredits || 0,
      aiCreditsUsed: user.usedAiCredits || 0,
      aiCreditsAllocated: user.allocatedAiCredits || 0,
      totalActivities: user.atsActivities?.length || 0,
      lastLoginAt: user.lastLoginAt
    };

    // Get recent activities (placeholder until ATS is fully implemented)
    const activities = user.atsActivities || [];

    return NextResponse.json({
      stats,
      activities,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        userType: user.userType,
        role: user.role,
        isActive: user.isActive,
        parentUser: user.parentUser,
        permissions: user.permissions,
        lastLoginAt: user.lastLoginAt
      }
    });

  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update user's last login and other dashboard stats
export async function PUT(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.id) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { action } = await request.json();

    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update last login time
    if (action === 'updateLastLogin') {
      await prisma.user.update({
        where: { id: decoded.id },
        data: {
          lastLoginAt: new Date()
        }
      });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Dashboard update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
