import { NextResponse } from 'next/server';
import { verifyToken } from '../../../../utils/auth';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    // Get token from cookies
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token
    const userFromToken = verifyToken(token);
    if (!userFromToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, reason, reasonDetails } = await request.json();
    const userId = userFromToken.id;

    switch (action) {
      case 'deactivate':
        await prisma.user.update({
          where: { id: userId },
          data: { isActive: false },
        });

        await prisma.userPreference.upsert({
          where: { userId },
          update: { accountStatus: 'deactivated' },
          create: { userId, accountStatus: 'deactivated' },
        });

        // Log the deactivation
        await prisma.dataProcessingLog.create({
          data: {
            userId,
            action: 'deactivation',
            details: { reason: 'user_requested' },
            ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
            userAgent: request.headers.get('user-agent'),
          },
        });

        return NextResponse.json({ success: true });

      case 'reactivate':
        await prisma.user.update({
          where: { id: userId },
          data: { isActive: true },
        });

        await prisma.userPreference.upsert({
          where: { userId },
          update: { accountStatus: 'active' },
          create: { userId, accountStatus: 'active' },
        });

        // Log the reactivation
        await prisma.dataProcessingLog.create({
          data: {
            userId,
            action: 'reactivation',
            details: { reason: 'user_requested' },
            ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
            userAgent: request.headers.get('user-agent'),
          },
        });

        return NextResponse.json({ success: true });

      case 'delete':
        // Create deletion request
        const deletionRequest = await prisma.accountDeletionRequest.create({
          data: {
            userId,
            reason,
            reasonDetails,
            status: 'pending',
            dataRetentionDays: 30,
            finalDeletionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          },
        });

        // Deactivate account immediately
        await prisma.user.update({
          where: { id: userId },
          data: { isActive: false },
        });

        await prisma.userPreference.upsert({
          where: { userId },
          update: { accountStatus: 'deletion_requested' },
          create: { userId, accountStatus: 'deletion_requested' },
        });

        // Log the deletion request
        await prisma.dataProcessingLog.create({
          data: {
            userId,
            action: 'deletion_request',
            details: { reason, reasonDetails, requestId: deletionRequest.id },
            ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
            userAgent: request.headers.get('user-agent'),
          },
        });

        // TODO: Send confirmation email
        // await sendAccountDeletionConfirmationEmail(user.email, deletionRequest.id);

        return NextResponse.json({ success: true, requestId: deletionRequest.id });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error processing account action:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
