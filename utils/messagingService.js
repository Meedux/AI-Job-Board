import { prisma } from './db';
import { emitRealtimeEvent, EVENTS } from './realtime';
import { recordSuspiciousActivity } from './complianceService';

export async function createConversation({
  title = null,
  type = 'direct',
  createdById,
  participantIds = [],
  workspaceId = null
}) {
  const conversation = await prisma.conversation.create({
    data: {
      title,
      type,
      createdById,
      workspaceId,
      participants: {
        create: [
          { userId: createdById, role: 'owner', canPost: true },
          ...participantIds
            .filter((id) => id && id !== createdById)
            .map((id) => ({ userId: id, role: 'member', canPost: true }))
        ]
      }
    },
    include: {
      participants: true
    }
  });

  return conversation;
}

export async function listConversations(userId) {
  return prisma.conversation.findMany({
    where: {
      participants: {
        some: { userId }
      }
    },
    orderBy: { updatedAt: 'desc' },
    include: {
      participants: true
    }
  });
}

export async function sendMessage({ conversationId, senderId, content, contentType = 'text', attachments = null, metadata = {} }) {
  const participant = await prisma.conversationParticipant.findFirst({
    where: { conversationId, userId: senderId }
  });
  if (!participant) {
    throw new Error('Not a participant in this conversation');
  }

  if (content && /(bit\.ly|tinyurl|free money|wire money)/i.test(content)) {
    await recordSuspiciousActivity({
      userId: senderId,
      type: 'messaging_content_flag',
      severity: 'high',
      description: 'Potential phishing content detected in message',
      metadata: { conversationId }
    });
  }

  const message = await prisma.message.create({
    data: {
      conversationId,
      senderId,
      content,
      contentType,
      attachments,
      metadata
    },
    include: {
      conversation: {
        select: { participants: true }
      }
    }
  });

  const deliveries = await prisma.$transaction(
    message.conversation.participants.map((p) =>
      prisma.messageDelivery.create({
        data: {
          messageId: message.id,
          userId: p.userId,
          status: p.userId === senderId ? 'read' : 'pending',
          deliveredAt: p.userId === senderId ? new Date() : null,
          readAt: p.userId === senderId ? new Date() : null
        }
      })
    )
  );

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() }
  });

  emitRealtimeEvent(EVENTS.MESSAGE, { conversationId, message, deliveries });
  return { message, deliveries };
}
