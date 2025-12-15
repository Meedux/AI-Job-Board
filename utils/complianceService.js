import { prisma } from './db';
import { createNotification } from './notificationService';
import { USER_ROLES } from './roleSystem';

export async function lockAccount(userId, reason, severity = 'high', metadata = {}) {
  const lock = await prisma.accountLock.upsert({
    where: { userId },
    update: {
      reason,
      severity,
      metadata,
      lockedAt: new Date(),
      unlockedAt: null
    },
    create: {
      userId,
      reason,
      severity,
      metadata
    }
  });

  await prisma.user.update({
    where: { id: userId },
    data: { accountStatus: 'suspended' }
  }).catch(() => null);

  return lock;
}

export async function recordSuspiciousActivity({
  userId = null,
  type,
  severity = 'medium',
  description,
  detectedBy = 'system',
  metadata = {}
}) {
  const activity = await prisma.suspiciousActivity.create({
    data: {
      userId,
      type,
      severity,
      description,
      detectedBy,
      metadata
    }
  });

  await prisma.auditEvent.create({
    data: {
      userId,
      action: 'suspicious_activity',
      targetType: 'security',
      targetId: activity.id,
      metadata: { type, severity, description, ...metadata }
    }
  }).catch(() => null);

  if (severity === 'high' || severity === 'critical') {
    if (userId) {
      await lockAccount(userId, description || type, severity, metadata);
    }
    await notifySecurityAdmins(type, severity, description, metadata);
  }

  return activity;
}

async function notifySecurityAdmins(type, severity, description, metadata) {
  const recipients = await prisma.user.findMany({
    where: {
      role: { in: [USER_ROLES.OWNER, USER_ROLES.MAIN_ADMIN, USER_ROLES.SUPER_ADMIN] },
      emailNotifications: true
    },
    select: { id: true, email: true }
  });

  const tasks = recipients.map((recipient) =>
    createNotification({
      type: 'security_alert',
      title: `Security alert: ${type}`,
      message: description || 'Suspicious activity detected',
      category: 'security',
      priority: severity === 'critical' ? 'critical' : 'high',
      userId: recipient.id,
      userEmail: recipient.email,
      metadata
    })
  );

  await Promise.all(tasks);
}
