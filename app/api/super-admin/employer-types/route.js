import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/utils/auth';

const prisma = new PrismaClient();

// GET /api/super-admin/employer-types - Get all employer types
export async function GET(request) {
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

    const employerTypes = await prisma.employerType.findMany({
      orderBy: [
        { category: 'asc' },
        { type: 'asc' },
        { label: 'asc' }
      ]
    });

    return NextResponse.json({
      success: true,
      employerTypes
    });

  } catch (error) {
    console.error('Error fetching employer types:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/super-admin/employer-types - Create new employer type
export async function POST(request) {
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

    const body = await request.json();
    const { code, label, category, type, subtype, description, isActive = true } = body;

    // Validate required fields
    if (!code || !label || !category || !type) {
      return NextResponse.json(
        { error: 'Code, label, category, and type are required' },
        { status: 400 }
      );
    }

    // Check if code already exists
    const existingType = await prisma.employerType.findUnique({
      where: { code }
    });

    if (existingType) {
      return NextResponse.json(
        { error: 'Employer type with this code already exists' },
        { status: 400 }
      );
    }

    const employerType = await prisma.employerType.create({
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
    console.error('Error creating employer type:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}