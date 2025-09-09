import { NextResponse } from 'next/server';
import prisma from '../../../../../../utils/db';
import { getUserFromRequest } from '../../../../../../utils/auth';

// PUT - Update user role
export async function PUT(request, { params }) {
  try {
    const user = getUserFromRequest(request);
    
    if (!user || user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { role } = await request.json();
    
    // Validate role
    const validRoles = ['job_seeker', 'employer', 'employer_admin', 'sub_user', 'admin', 'super_admin'];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ 
        error: 'Invalid role. Must be one of: job_seeker, employer, employer_admin, sub_user, admin, super_admin' 
      }, { status: 400 });
    }

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: params.id }
    });

    if (!targetUser) {
      return NextResponse.json({ 
        error: 'User not found' 
      }, { status: 404 });
    }

    // Prevent super admin from demoting themselves
    if (params.id === user.id && role !== 'super_admin') {
      return NextResponse.json({ 
        error: 'Cannot change your own role' 
      }, { status: 400 });
    }

    // Check if trying to create another super admin
    if (role === 'super_admin' && targetUser.role !== 'super_admin') {
      // Count existing super admins
      const superAdminCount = await prisma.user.count({
        where: { role: 'super_admin' }
      });

      // Limit super admin count (optional security measure)
      if (superAdminCount >= 5) {
        return NextResponse.json({ 
          error: 'Maximum number of super administrators reached' 
        }, { status: 400 });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: { 
        role,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ 
      success: true, 
      user: updatedUser 
    });

  } catch (error) {
    console.error('Error updating user role:', error);
    return NextResponse.json({ 
      error: 'Failed to update user role' 
    }, { status: 500 });
  }
}
