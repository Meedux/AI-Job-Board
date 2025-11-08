import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/utils/auth';

const prisma = new PrismaClient();

// GET /api/super-admin/employer-types/[id] - Get single employer type
export async function GET(request, { params }) {
  try {
    // Verify super admin access
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== 'super_admin') {
      return NextResponse.json({ error: 'Super admin access required' }, { status: 403 });
    }

    const { id } = params;

    const employerType = await prisma.employerType.findUnique({
      where: { id }
    });

    if (!employerType) {
      return NextResponse.json(
        { error: 'Employer type not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      employerType
    });

  } catch (error) {
    console.error('Error fetching employer type:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/super-admin/employer-types/[id] - Update employer type
export async function PUT(request, { params }) {
  try {
    // Verify super admin access
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== 'super_admin') {
      return NextResponse.json({ error: 'Super admin access required' }, { status: 403 });
    }

    const { id } = params;
    const body = await request.json();
    const { code, label, category, type, subtype, description, isActive } = body;

    // Validate required fields
    if (!code || !label || !category || !type) {
      return NextResponse.json(
        { error: 'Code, label, category, and type are required' },
        { status: 400 }
      );
    }

    // Check if another employer type with this code exists
    const existingType = await prisma.employerType.findFirst({
      where: {
        code,
        id: { not: id }
      }
    });

    if (existingType) {
      return NextResponse.json(
        { error: 'Another employer type with this code already exists' },
        { status: 400 }
      );
    }

    const employerType = await prisma.employerType.update({
      where: { id },
      data: {
        code,
        label,
        category,
        type,
        subtype,
        description,
        isActive
      }
    });

    return NextResponse.json({
      success: true,
      employerType
    });

  } catch (error) {
    console.error('Error updating employer type:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/super-admin/employer-types/[id] - Partial update (for status toggle)
export async function PATCH(request, { params }) {
  try {
    // Verify super admin access
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== 'super_admin') {
      return NextResponse.json({ error: 'Super admin access required' }, { status: 403 });
    }

    const { id } = params;
    const body = await request.json();

    const employerType = await prisma.employerType.update({
      where: { id },
      data: body
    });

    return NextResponse.json({
      success: true,
      employerType
    });

  } catch (error) {
    console.error('Error updating employer type:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/super-admin/employer-types/[id] - Delete employer type
export async function DELETE(request, { params }) {
  try {
    // Verify super admin access
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== 'super_admin') {
      return NextResponse.json({ error: 'Super admin access required' }, { status: 403 });
    }

    const { id } = params;

    // Check if employer type is being used
    const usersCount = await prisma.user.count({
      where: { employerTypeId: id }
    });

    const jobsCount = await prisma.job.count({
      where: { employerTypeId: id }
    });

    if (usersCount > 0 || jobsCount > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete employer type that is currently in use',
          details: `Used by ${usersCount} users and ${jobsCount} jobs`
        },
        { status: 400 }
      );
    }

    await prisma.employerType.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Employer type deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting employer type:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}