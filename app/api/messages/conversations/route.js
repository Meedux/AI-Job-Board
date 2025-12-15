import { NextResponse } from 'next/server';
import { getUserFromRequest, sanitizeInput } from '@/utils/auth';
import { createConversation, listConversations } from '@/utils/messagingService';

export async function GET(request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const conversations = await listConversations(user.id);
  return NextResponse.json({ conversations });
}

export async function POST(request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const conversation = await createConversation({
    title: sanitizeInput(body.title || ''),
    type: body.type || 'direct',
    createdById: user.id,
    participantIds: body.participantIds || [],
    workspaceId: body.workspaceId || null
  });

  return NextResponse.json({ conversation }, { status: 201 });
}
