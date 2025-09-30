import { cookies } from 'next/headers';
import { verifyToken } from '@/utils/auth';
import { PrismaClient } from '@prisma/client';
import { 
  USER_ROLES, 
  hasPermission, 
  canManageUser,
  validateRoleTransition,
  PERMISSIONS
} from '@/utils/roleSystem';

const prisma = new PrismaClient();

// GET - Get specific user details
export async function GET(request, { params }) {
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

    const { id } = await params;
    
    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    const targetUser = await prisma.user.findUnique({
      where: { id },
      include: {
        subUsers: {
          select: {
            id: true,
            email: true,
            fullName: true,
            role: true,
            userType: true,
            isActive: true,
            accountStatus: true
          }
        },
        parentUser: {
          select: {
            id: true,
            email: true,
            fullName: true,
            role: true
          }
        },
        subscriptions: {
          where: {
            status: 'active'
          },
          include: {
            plan: true
          },
          take: 1
        }
      }
    });

    if (!targetUser) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    // Check permissions
    if (!canManageUser(currentUser, targetUser) && currentUser.id !== targetUser.id) {
      return Response.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    return Response.json({ user: targetUser });

  } catch (error) {
    console.error('Get user error:', error);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}

// PUT - Update user
export async function PUT(request, { params }) {
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

    const { id } = await params;
    
    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    const targetUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!targetUser) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    // Check permissions
    if (!canManageUser(currentUser, targetUser) && currentUser.id !== targetUser.id) {
      return Response.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const {
      fullName,
      email,
      role,
      userType,
      employerType,
      isActive,
      accountStatus,
      allocatedResumeCredits,
      allocatedAiCredits,
      accessLevel,
      permissions,
      convertToSubUser
    } = await request.json();

    // Handle sub-user conversion
    if (convertToSubUser && role === USER_ROLES.SUB_USER) {
      // Special handling for converting existing users to sub-users
      if (currentUser.role !== USER_ROLES.EMPLOYER_ADMIN && currentUser.role !== USER_ROLES.SUPER_ADMIN) {
        return Response.json({ error: 'Only employer admins can convert users to sub-users' }, { status: 403 });
      }
      
      // Validate that the target user can be converted (job seeker or employer)
      if (targetUser.role !== USER_ROLES.JOB_SEEKER && targetUser.role !== USER_ROLES.EMPLOYER_ADMIN) {
        return Response.json({ error: 'Only job seekers and employers can be converted to sub-users' }, { status: 400 });
      }
      
      // Make sure they're not already a sub-user of someone else
      if (targetUser.parentUserId && targetUser.parentUserId !== currentUser.id) {
        return Response.json({ error: 'User is already a sub-user of another employer' }, { status: 400 });
      }
    } 
    // Validate role transition for non-conversion updates
    else if (role && role !== targetUser.role) {
      if (!validateRoleTransition(targetUser.role, role)) {
        return Response.json({ error: 'Invalid role transition' }, { status: 400 });
      }
    }

    // Build update data
    const updateData = {};
    
    if (fullName !== undefined) updateData.fullName = fullName;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) updateData.role = role;
    if (userType !== undefined) updateData.userType = userType;
    if (employerType !== undefined) updateData.employerType = employerType;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (accountStatus !== undefined) updateData.accountStatus = accountStatus;
    if (accessLevel !== undefined) updateData.accessLevel = accessLevel;
    if (permissions !== undefined) updateData.permissions = permissions;
    
    // Handle sub-user conversion - set parent relationship
    if (convertToSubUser && role === USER_ROLES.SUB_USER && currentUser.role === USER_ROLES.EMPLOYER_ADMIN) {
      updateData.parentUserId = currentUser.id;
    }
    
    // Only parent users or super admin can modify credits
    if ((currentUser.role === USER_ROLES.SUPER_ADMIN || 
         (currentUser.role === USER_ROLES.EMPLOYER_ADMIN && targetUser.parentUserId === currentUser.id))) {
      if (allocatedResumeCredits !== undefined) updateData.allocatedResumeCredits = allocatedResumeCredits;
      if (allocatedAiCredits !== undefined) updateData.allocatedAiCredits = allocatedAiCredits;
    }

    updateData.updatedAt = new Date();

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        userType: true,
        employerType: true,
        isActive: true,
        accountStatus: true,
        allocatedResumeCredits: true,
        allocatedAiCredits: true,
        usedResumeCredits: true,
        usedAiCredits: true,
        accessLevel: true,
        permissions: true,
        updatedAt: true
      }
    });

    return Response.json({
      success: true,
      user: updatedUser,
      message: 'User updated successfully'
    });

  } catch (error) {
    console.error('Update user error:', error);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}

// DELETE - Delete/deactivate user
export async function DELETE(request, { params }) {
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

    const { id } = await params;
    
    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    const targetUser = await prisma.user.findUnique({
      where: { id },
      include: {
        subUsers: true
      }
    });

    if (!targetUser) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    // Check permissions
    if (!canManageUser(currentUser, targetUser)) {
      return Response.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Don't allow deletion of super admin by non-super admin
    if (targetUser.role === USER_ROLES.SUPER_ADMIN && currentUser.role !== USER_ROLES.SUPER_ADMIN) {
      return Response.json({ error: 'Cannot delete super admin account' }, { status: 403 });
    }

    // For users with sub-users, deactivate instead of delete
    if (targetUser.subUsers.length > 0) {
      await prisma.user.update({
        where: { id },
        data: {
          isActive: false,
          accountStatus: 'suspended'
        }
      });

      return Response.json({
        success: true,
        message: 'User account deactivated (has sub-users)'
      });
    }

    // Actually delete the user
    await prisma.user.delete({
      where: { id }
    });

    return Response.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}
