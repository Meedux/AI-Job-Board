import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { getUserFromRequest, sanitizeInput } from '@/utils/auth';
import { prisma } from '@/utils/db';
import emailItService from '@/utils/emailItService';

export const runtime = 'nodejs';

const ALLOWED_ROLES = ['job_seeker', 'employer_admin', 'super_admin', 'sub_user'];

function canViewList(user) {
  return Boolean(user && ALLOWED_ROLES.includes(user.role));
}

function buildListWhere(user) {
  if (user.role === 'super_admin') return {};
  const baseUserId = user.parentUserId || user.id;

  if (user.role === 'job_seeker') {
    return {
      OR: [
        { candidateId: user.id },
        { application: { applicantId: user.id } }
      ]
    };
  }

  return {
    OR: [
      { createdById: user.id },
      { job: { postedById: baseUserId } }
    ]
  };
}

async function sendSchedulingEmail(interview, application) {
  if (!interview.schedulingLink || !application?.applicant?.email) return;

  const subject = 'Prescreen interview recorded and scheduling link available';
  const html = `
    <p>Hello ${application.applicant.firstName || application.applicant.fullName || ''},</p>
    <p>Your prescreen interview has been recorded. You can review it and continue the process using the link below:</p>
    <p><a href="${interview.schedulingLink}" target="_blank" rel="noreferrer">Schedule next step</a></p>
    <p>If you have questions, reply to this email.</p>
  `;

  try {
    await emailItService.sendEmail(application.applicant.email, subject, html, 'prescreen_interview');
  } catch (error) {
    console.error('[prescreen-email] Failed to send scheduling email', error);
  }
}

export async function GET(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!canViewList(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const where = buildListWhere(user);
    const interviews = await prisma.prescreenInterview.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        application: {
          include: {
            applicant: true,
            job: true
          }
        },
        createdBy: { select: { id: true, fullName: true, email: true } }
      }
    });

    const normalized = interviews.map((item) => {
      const isExpired = item.expiresAt ? new Date(item.expiresAt).getTime() < Date.now() : false;
      return {
        ...item,
        status: isExpired ? 'expired' : item.status,
        allowDownload: item.accessMode === 'downloadable'
      };
    });

    return NextResponse.json({ interviews: normalized });
  } catch (error) {
    console.error('[prescreen-list] error', error);
    return NextResponse.json({ error: 'Unable to load prescreen interviews' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || !ALLOWED_ROLES.includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const applicationId = sanitizeInput(formData.get('applicationId')) || null;
    const jobId = sanitizeInput(formData.get('jobId')) || null;
    const accessModeRaw = sanitizeInput(formData.get('accessMode'));
    const accessMode = accessModeRaw === 'downloadable' ? 'downloadable' : 'view_only';
    const expiresAtRaw = sanitizeInput(formData.get('expiresAt'));
    const schedulingLink = sanitizeInput(formData.get('schedulingLink')) || null;
    const notes = sanitizeInput(formData.get('notes')) || null;

    if (!file) {
      return NextResponse.json({ error: 'Video file is required' }, { status: 400 });
    }

    let application = null;
    if (applicationId) {
      application = await prisma.jobApplication.findUnique({
        where: { id: applicationId },
        include: {
          applicant: true,
          job: { select: { id: true, postedById: true } }
        }
      });

      if (!application) {
        return NextResponse.json({ error: 'Application not found' }, { status: 404 });
      }

      const baseUserId = user.parentUserId || user.id;
      const ownsApplication = user.role === 'super_admin'
        || application.applicantId === user.id
        || application.job?.postedById === baseUserId;

      if (!ownsApplication) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const blob = await put(`prescreen/${user.id}-${Date.now()}-${file.name}`, file, {
      access: 'public',
      addRandomSuffix: true,
      multipart: true,
      token: process.env.BLOB_READ_WRITE_TOKEN
    });

    const expiresAt = expiresAtRaw ? new Date(expiresAtRaw) : null;
    const status = expiresAt && expiresAt.getTime() < Date.now() ? 'expired' : 'active';

    const interview = await prisma.prescreenInterview.create({
      data: {
        applicationId: applicationId || null,
        jobId: application?.jobId || jobId || null,
        candidateId: application?.applicantId || (user.role === 'job_seeker' ? user.id : null),
        createdById: user.id,
        blobPath: blob.pathname || new URL(blob.url).pathname,
        blobUrl: blob.url,
        downloadUrl: blob.downloadUrl,
        accessMode,
        expiresAt,
        schedulingLink,
        status,
        notes
      },
      include: {
        application: {
          include: {
            applicant: true,
            job: true
          }
        }
      }
    });

    await sendSchedulingEmail(interview, interview.application);

    return NextResponse.json({ interview });
  } catch (error) {
    console.error('[prescreen-upload] error', error);
    return NextResponse.json({ error: 'Failed to upload interview' }, { status: 500 });
  }
}
