import { NextResponse } from 'next/server';
import { prisma } from '@/utils/db';
import { getUserFromRequest, sanitizeInput } from '@/utils/auth';
import { createNotification, CATEGORIES, PRIORITY } from '@/utils/notificationService';
import { USER_ROLES } from '@/utils/roleSystem';

const isAdmin = (user) => {
  if (!user) return false;
  if ([USER_ROLES.SUPER_ADMIN, USER_ROLES.OWNER, USER_ROLES.MAIN_ADMIN].includes(user.role)) return true;
  const emailLower = (user.email || '').toLowerCase();
  const domain = emailLower.split('@')[1];
  return emailLower.endsWith('@getgethired.com') || domain === 'getgethired.com';
};

export async function GET(request) {
  const user = await getUserFromRequest(request);
  if (!isAdmin(user)) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const notifications = await prisma.notification.findMany({
    where: {
      OR: [
        { category: 'admin' },
        { category: 'system' },
        { category: 'security' }
      ]
    },
    orderBy: { createdAt: 'desc' },
    take: 200,
    include: { deliveries: true }
  });

  return NextResponse.json({ notifications });
}

export async function POST(request) {
  const user = await getUserFromRequest(request);
  if (!isAdmin(user)) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const body = await request.json();
  const notification = await createNotification({
    type: body.type,
    title: sanitizeInput(body.title || 'Admin Notification'),
    message: sanitizeInput(body.message || ''),
    category: body.category || CATEGORIES.ADMIN,
    priority: body.priority || PRIORITY.MEDIUM,
    userId: user.id,
    userEmail: user.email,
    metadata: body.metadata || {}
  });

  return NextResponse.json({ notification }, { status: 201 });
}

export async function PATCH(request) {
  const user = await getUserFromRequest(request);
  if (!isAdmin(user)) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const body = await request.json();
  const { action, notificationIds } = body;

  if (!action) {
    return NextResponse.json({ error: 'Action required' }, { status: 400 });
  }

  if (action === 'mark_read' && Array.isArray(notificationIds)) {
    await prisma.notification.updateMany({
      where: { id: { in: notificationIds } },
      data: { status: 'read', readAt: new Date() }
    });
    await prisma.notificationDelivery.updateMany({
      where: { notificationId: { in: notificationIds }, userId: user.id },
      data: { status: 'read', readAt: new Date() }
    });
  } else if (action === 'mark_all_read') {
    const ids = await prisma.notification.findMany({
      where: {
        OR: [
          { category: 'admin' },
          { category: 'system' },
          { category: 'security' }
        ]
      },
      select: { id: true }
    });
    const idList = ids.map((n) => n.id);
    if (idList.length) {
      await prisma.notification.updateMany({
        where: { id: { in: idList } },
        data: { status: 'read', readAt: new Date() }
      });
      await prisma.notificationDelivery.updateMany({
        where: { notificationId: { in: idList }, userId: user.id },
        data: { status: 'read', readAt: new Date() }
      });
    }
  } else if (action === 'delete' && Array.isArray(notificationIds)) {
    await prisma.notificationDelivery.deleteMany({ where: { notificationId: { in: notificationIds } } });
    await prisma.notification.deleteMany({ where: { id: { in: notificationIds } } });
  } else if (action === 'clear_all') {
    await prisma.notificationDelivery.deleteMany({});
    await prisma.notification.deleteMany({
      where: {
        OR: [
          { category: 'admin' },
          { category: 'system' },
          { category: 'security' }
        ]
      }
    });
  }

  return NextResponse.json({ success: true });
}

export const addAdminNotification = async (type, title, message, metadata = {}) => {
  return createNotification({
    type,
    title,
    message,
    category: CATEGORIES.ADMIN,
    priority: PRIORITY.MEDIUM,
    metadata
  });
};
