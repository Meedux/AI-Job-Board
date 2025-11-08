import { NextResponse } from 'next/server';
import { getUserFromRequest } from '../../../../../utils/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(request, { params }) {
  try {
    // Verify user authentication
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { reportId } = await params;
    const { action } = await request.json();

    if (!['resolved', 'dismissed'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const updatedReport = await prisma.reviewReport.update({
      where: { id: reportId },
      data: {
        status: action,
      },
    });

    return NextResponse.json({ success: true, report: updatedReport });
  } catch (error) {
    console.error('Error processing report:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
