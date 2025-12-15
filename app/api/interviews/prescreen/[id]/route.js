import { NextResponse } from 'next/server';
import { getUserFromRequest, sanitizeInput } from '@/utils/auth';
import { prisma } from '@/utils/db';

export const runtime = 'nodejs';

function canAccess(user, interview) {
  if (!user) return false;
  if (user.role === 'super_admin') return true;
  const baseUserId = user.parentUserId || user.id;
  return interview.createdById === user.id
    || interview.candidateId === user.id
    || interview.job?.postedById === baseUserId;
}

function normalizeInterview(interview) {
  const isExpired = interview.expiresAt ? new Date(interview.expiresAt).getTime() < Date.now() : false;
  return {
    ...interview,
    status: isExpired ? 'expired' : interview.status,
    allowDownload: interview.accessMode === 'downloadable'
  };
}

export async function GET(_request, { params }) {
  try {
    const user = await getUserFromRequest(_request);
    const interviewId = params?.id;
    if (!interviewId) {
      return NextResponse.json({ error: 'Interview id missing' }, { status: 400 });
    }

    const interview = await prisma.prescreenInterview.findUnique({
      where: { id: interviewId },
      include: {
        application: {
          include: {
            applicant: true,
            job: true
          }
        },
        job: true,
        createdBy: { select: { id: true, fullName: true, email: true } }
      }
    });

    if (!interview) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const isExpired = interview.expiresAt ? new Date(interview.expiresAt).getTime() < Date.now() : false;
    if (isExpired && interview.status !== 'expired') {
      await prisma.prescreenInterview.update({ where: { id: interview.id }, data: { status: 'expired' } });
      interview.status = 'expired';
    }

    if (!canAccess(user, interview)) {
      return NextResponse.json({ error: 'Access denied', requiresAccessRequest: true }, { status: 403 });
    }

    return NextResponse.json({ interview: normalizeInterview(interview) });
  } catch (error) {
    console.error('[prescreen-get] error', error);
    return NextResponse.json({ error: 'Failed to load interview' }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const interviewId = params?.id;
    if (!interviewId) {
      return NextResponse.json({ error: 'Interview id missing' }, { status: 400 });
    }

    const body = await request.json();
    const accessModeRaw = sanitizeInput(body.accessMode);
    const schedulingLink = sanitizeInput(body.schedulingLink) || null;
    const expiresAtRaw = body.expiresAt ? sanitizeInput(body.expiresAt) : null;
    const status = body.status && ['active', 'expired', 'revoked'].includes(body.status) ? body.status : undefined;

    const interview = await prisma.prescreenInterview.findUnique({ where: { id: interviewId }, include: { job: true } });
    if (!interview) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const baseUserId = user.parentUserId || user.id;
    const canEdit = user.role === 'super_admin' || interview.createdById === user.id || interview.job?.postedById === baseUserId;
    if (!canEdit) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updates = {};
    if (accessModeRaw === 'downloadable' || accessModeRaw === 'view_only') {
      updates.accessMode = accessModeRaw;
    }
    if (schedulingLink !== null) {
      updates.schedulingLink = schedulingLink;
    }
    if (expiresAtRaw) {
      updates.expiresAt = new Date(expiresAtRaw);
      updates.status = updates.expiresAt.getTime() < Date.now() ? 'expired' : 'active';
    }
    if (status) updates.status = status;

    const updated = await prisma.prescreenInterview.update({ where: { id: interviewId }, data: updates, include: { job: true } });
    return NextResponse.json({ interview: normalizeInterview(updated) });
  } catch (error) {
    console.error('[prescreen-update] error', error);
    return NextResponse.json({ error: 'Failed to update interview' }, { status: 500 });
  }
}
