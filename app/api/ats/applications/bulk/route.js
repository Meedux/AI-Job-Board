import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/utils/auth';
import { prisma } from '@/utils/db';

const ALLOWED_ACTIONS = new Set(['move_stage', 'add_note', 'set_priority', 'tag']);

function normalizeActionPayload(action, payload) {
  switch (action) {
    case 'move_stage':
      return payload?.stage ? { stage: payload.stage } : null;
    case 'add_note':
      return payload?.note ? { notes: payload.note } : null;
    case 'set_priority':
      return payload?.priority ? { priority: payload.priority } : null;
    case 'tag':
      return Array.isArray(payload?.tags) ? { tags: payload.tags } : null;
    default:
      return null;
  }
}

export async function POST(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || !['employer_admin', 'super_admin'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { applicationIds, action, payload } = await request.json();

    if (!Array.isArray(applicationIds) || applicationIds.length === 0) {
      return NextResponse.json({ error: 'Application IDs required' }, { status: 400 });
    }

    if (!ALLOWED_ACTIONS.has(action)) {
      return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
    }

    const updateData = normalizeActionPayload(action, payload);
    if (!updateData) {
      return NextResponse.json({ error: 'Invalid payload for action' }, { status: 400 });
    }

    const allowedIds = await prisma.jobApplication.findMany({
      where: {
        id: { in: applicationIds },
        ...(user.role === 'super_admin' ? {} : {
          job: {
            OR: [
              { postedById: user.id },
              { postedById: user.parentUserId || user.id },
              { postedBy: { parentUserId: user.parentUserId || user.id } }
            ]
          }
        })
      },
      select: { id: true }
    });

    if (allowedIds.length === 0) {
      return NextResponse.json({ error: 'No applications matched or access denied' }, { status: 404 });
    }

    const updateResult = await prisma.jobApplication.updateMany({
      where: { id: { in: allowedIds.map(item => item.id) } },
      data: updateData
    });

    await prisma.aTSActivity.create({
      data: {
        userId: user.id,
        activityType: `bulk_${action}`,
        entityType: 'job_application',
        entityId: 'bulk',
        description: `Bulk ${action.replace('_', ' ')} on ${updateResult.count} applications`,
        metadata: {
          action,
          applicationIds: allowedIds.map(item => item.id),
          payload: updateData
        }
      }
    });

    return NextResponse.json({
      success: true,
      updatedCount: updateResult.count,
      action
    });
  } catch (error) {
    console.error('ATS bulk action error:', error);
    return NextResponse.json({ error: 'Bulk action failed' }, { status: 500 });
  }
}
