import { NextResponse } from 'next/server';
import { prisma } from '@/utils/db';
import { getUserFromRequest, sanitizeInput } from '@/utils/auth';
import { createNotification, CATEGORIES, PRIORITY } from '@/utils/notificationService';

export async function GET(request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: {
      deliveries: true
    }
  });

  return NextResponse.json({ notifications });
}

export async function POST(request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const notification = await createNotification({
    type: body.type,
    title: sanitizeInput(body.title || 'Notification'),
    message: sanitizeInput(body.message || ''),
    category: body.category || CATEGORIES.USER,
    priority: body.priority || PRIORITY.MEDIUM,
    userId: user.id,
    userEmail: user.email,
    metadata: body.metadata || {}
  });

  return NextResponse.json({ notification }, { status: 201 });
}
