import { NextResponse } from 'next/server';
import { getUserFromRequest, sanitizeInput } from '@/utils/auth';
import { prisma } from '@/utils/db';
import emailItService from '@/utils/emailItService';

export const runtime = 'nodejs';

export async function POST(request, { params }) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const interviewId = params?.id;
    if (!interviewId) return NextResponse.json({ error: 'Interview id missing' }, { status: 400 });

    const { message } = await request.json();
    const cleanMessage = sanitizeInput(message) || null;

    const interview = await prisma.prescreenInterview.findUnique({
      where: { id: interviewId },
      include: {
        createdBy: { select: { id: true, email: true, fullName: true } },
        job: { select: { title: true } }
      }
    });

    if (!interview) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const requestRecord = await prisma.prescreenAccessRequest.create({
      data: {
        interviewId,
        requesterId: user.id,
        message: cleanMessage || 'Access requested'
      }
    });

    if (interview.createdBy?.email) {
      const subject = 'New access request for prescreen interview';
      const html = `
        <p>Hello ${interview.createdBy.fullName || 'there'},</p>
        <p>${user.fullName || 'A user'} requested access to a prescreen interview.</p>
        <p>Job: ${interview.job?.title || 'N/A'}</p>
        <p>Message: ${cleanMessage || 'No additional message provided.'}</p>
      `;
      emailItService.sendEmail(interview.createdBy.email, subject, html, 'prescreen_request').catch((err) => {
        console.error('[prescreen-request-email] failed', err);
      });
    }

    return NextResponse.json({ request: requestRecord });
  } catch (error) {
    console.error('[prescreen-request-access] error', error);
    return NextResponse.json({ error: 'Failed to request access' }, { status: 500 });
  }
}
