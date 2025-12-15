import { NextResponse } from 'next/server';
import { prisma } from '@/utils/db';
import { getUserFromRequest, sanitizeInput } from '@/utils/auth';
import { sendMessage } from '@/utils/messagingService';

export async function GET(request, { params }) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { conversationId } = params;
  const participant = await prisma.conversationParticipant.findFirst({
    where: { conversationId, userId: user.id }
  });

  if (!participant) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { sentAt: 'asc' },
    include: { deliveries: true }
  });

  return NextResponse.json({ messages });
}

export async function POST(request, { params }) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { conversationId } = params;
  const body = await request.json();

  try {
    const result = await sendMessage({
      conversationId,
      senderId: user.id,
      content: sanitizeInput(body.content || ''),
      contentType: body.contentType || 'text',
      attachments: body.attachments || null,
      metadata: body.metadata || {}
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
