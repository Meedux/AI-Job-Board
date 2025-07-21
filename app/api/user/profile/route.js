import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function PUT(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = decoded.id;
    const updateData = await request.json();

    // Validate the update data
    const allowedFields = ['fullName', 'nickname', 'dateOfBirth', 'fullAddress'];
    const filteredData = {};

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        // Map camelCase frontend to camelCase Prisma fields
        switch (field) {
          case 'dateOfBirth':
            filteredData.dateOfBirth = updateData[field] ? new Date(updateData[field]) : null;
            break;
          default:
            filteredData[field] = updateData[field];
        }
      }
    }

    // Update the user in the database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...filteredData,
        updatedAt: new Date()
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        nickname: true,
        dateOfBirth: true,
        fullAddress: true,
        role: true,
        isActive: true,
        accountStatus: true,
        updatedAt: true
      }
    });

    // Convert database field names to camelCase for frontend (already in camelCase)
    const responseUser = {
      id: updatedUser.id,
      email: updatedUser.email,
      fullName: updatedUser.fullName,
      nickname: updatedUser.nickname,
      dateOfBirth: updatedUser.dateOfBirth,
      fullAddress: updatedUser.fullAddress,
      role: updatedUser.role,
      isActive: updatedUser.isActive,
      accountStatus: updatedUser.accountStatus,
      updatedAt: updatedUser.updatedAt
    };

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: responseUser
    });

  } catch (error) {
    console.error('Error updating user profile:', error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = decoded.id;

    // Get the current user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        nickname: true,
        dateOfBirth: true,
        fullAddress: true,
        role: true,
        isActive: true,
        accountStatus: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Convert database field names to camelCase for frontend (already in camelCase)
    const responseUser = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      nickname: user.nickname,
      dateOfBirth: user.dateOfBirth,
      fullAddress: user.fullAddress,
      role: user.role,
      isActive: user.isActive,
      accountStatus: user.accountStatus,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    return NextResponse.json({
      success: true,
      user: responseUser
    });

  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}
