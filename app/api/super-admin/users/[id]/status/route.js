import { NextResponse } from 'next/server';
import prisma from '../../../../../../utils/db';
import { getUserFromRequest } from '../../../../../../utils/auth';

// PUT - Update user status
export async function PUT(request, { params }) {
  try {
    const user = getUserFromRequest(request);
    
    if (!user || user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { status } = await request.json();
    
    // Validate status
    const validStatuses = ['active', 'pending', 'suspended'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ 
        error: 'Invalid status. Must be one of: active, pending, suspended' 
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

    // Prevent super admin from suspending themselves
    if (params.id === user.id && status === 'suspended') {
      return NextResponse.json({ 
        error: 'Cannot suspend your own account' 
      }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: { 
        accountStatus: status,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ 
      success: true, 
      user: updatedUser 
    });

  } catch (error) {
    console.error('Error updating user status:', error);
    return NextResponse.json({ 
      error: 'Failed to update user status' 
    }, { status: 500 });
  }
}
