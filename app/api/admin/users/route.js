import { cookies } from 'next/headers';
import { verifyToken } from '@/utils/auth';
import { PrismaClient } from '@prisma/client';
import { 
  USER_ROLES, 
  hasPermission, 
  canManageUser, 
  getDefaultPermissions,
  PERMISSIONS
} from '@/utils/roleSystem';

const prisma = new PrismaClient();

// GET - Fetch users (with role-based filtering)
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
      where: { id: decoded.id },
      include: {
        subUsers: true,
        parentUser: true
      }
    });

    if (!currentUser) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    let users = [];

    // Super admin can see all users
    if (currentUser.role === USER_ROLES.SUPER_ADMIN) {
      users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          userType: true,
          employerType: true,
          isActive: true,
          accountStatus: true,
          parentUserId: true,
          createdAt: true,
          lastLoginAt: true,
          _count: {
            select: {
              subUsers: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    } 
    // Employer admin can see their sub-users
    else if (currentUser.role === USER_ROLES.EMPLOYER_ADMIN) {
      users = await prisma.user.findMany({
        where: {
          parentUserId: currentUser.id
        },
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          userType: true,
          isActive: true,
          accountStatus: true,
          allocatedResumeCredits: true,
          allocatedAiCredits: true,
          usedResumeCredits: true,
          usedAiCredits: true,
          createdAt: true,
          lastLoginAt: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    }
    // Sub-users and job seekers can only see themselves
    else {
      users = [currentUser];
    }

    return Response.json({ users });

  } catch (error) {
    console.error('Get users error:', error);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST - Create new user
export async function POST(request) {
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

    const {
      email,
      fullName,
      password,
      role,
      userType,
      employerType,
      parentUserId: providedParentUserId,
      allocatedResumeCredits = 0,
      allocatedAiCredits = 0,
      accessLevel = 1,
      permissions = {}
    } = await request.json();

    // Determine parent user ID for sub-users
    let parentUserId = providedParentUserId;

    // Validate permissions
    if (role === USER_ROLES.SUPER_ADMIN) {
      if (currentUser.role !== USER_ROLES.SUPER_ADMIN) {
        return Response.json({ error: 'Only super admins can create super admin accounts' }, { status: 403 });
      }
    } else if (role === USER_ROLES.SUB_USER) {
      if (currentUser.role !== USER_ROLES.SUPER_ADMIN && currentUser.role !== USER_ROLES.EMPLOYER_ADMIN) {
        return Response.json({ error: 'Insufficient permissions to create sub-users' }, { status: 403 });
      }
      
      // For sub-users, set parentUserId to current user if not specified
      if (!parentUserId && currentUser.role === USER_ROLES.EMPLOYER_ADMIN) {
        parentUserId = currentUser.id;
      }
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return Response.json({ error: 'Email already registered' }, { status: 400 });
    }

    // Hash password
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 12);

    // Get default permissions for role
    const defaultPermissions = getDefaultPermissions(role, userType);
    const finalPermissions = { ...defaultPermissions, ...permissions };

    // Generate activation code for sub-users
    const activationCode = role === USER_ROLES.SUB_USER ? 
      Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) : 
      null;

    // Create user
    const newUser = await prisma.user.create({
      data: {
        email,
        fullName,
        password: hashedPassword,
        role,
        userType,
        employerType,
        parentUserId: parentUserId || null,
        allocatedResumeCredits,
        allocatedAiCredits,
        accessLevel,
        permissions: finalPermissions,
        activationCode,
        accountStatus: role === USER_ROLES.SUB_USER ? 'pending' : 'active'
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        userType: true,
        employerType: true,
        activationCode: true,
        createdAt: true
      }
    });

    return Response.json({
      success: true,
      user: newUser,
      message: 'User created successfully'
    });

  } catch (error) {
    console.error('Create user error:', error);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}
