import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/employer-types - Get all active employer types
export async function GET(request) {
  try {
    const employerTypes = await prisma.employerType.findMany({
      where: {
        isActive: true
      },
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