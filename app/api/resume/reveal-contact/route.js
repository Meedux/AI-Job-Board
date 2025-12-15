import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/utils/auth';
import { canRevealResume } from '@/utils/policy';
import { prisma } from '@/utils/db';
import { USER_ROLES, hasPermission, PERMISSIONS } from '@/utils/roleSystem';
import { useCredit, getUserCredits, checkUserUsageLimits } from '@/utils/newSubscriptionService';

const SUB_USER_PERMISSIONS = [
  PERMISSIONS.SUB_USER?.RESUME_VIEW,
  PERMISSIONS.SUB_USER?.CANDIDATE_CONTACT
].filter(Boolean);

function canViewResumeContacts(user) {
  if (!user) return false;
  if ([USER_ROLES.SUPER_ADMIN, USER_ROLES.EMPLOYER_ADMIN].includes(user.role)) return true;
  return SUB_USER_PERMISSIONS.some(perm => hasPermission(user, perm));
}

export async function POST(request) {
  try {
    const sessionUser = await getUserFromRequest(request);
    if (!sessionUser?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      include: { parentUser: true }
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!canViewResumeContacts(currentUser)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { applicationId, resumeId } = await request.json();

    if (!applicationId && !resumeId) {
      return NextResponse.json({ error: 'Application ID or resume ID is required' }, { status: 400 });
    }

    const creditOwner = currentUser.role === USER_ROLES.SUB_USER && currentUser.parentUser
      ? currentUser.parentUser
      : currentUser;

    let creditUsage = null;
    let contactInfo = {};
    let targetApplication = null;

    if (applicationId) {
      targetApplication = await prisma.jobApplication.findUnique({
        where: { id: applicationId },
        include: {
          applicant: {
            select: {
              id: true,
              email: true,
              phone: true,
              fullName: true,
              contactInfo: true,
              socialLinks: true
            }
          },
          job: {
            select: {
              id: true,
              postedById: true
            }
          }
        }
      });

      if (!targetApplication) {
        return NextResponse.json({ error: 'Job application not found' }, { status: 404 });
      }

      const owningEmployerId = targetApplication.job.postedById;
      if (owningEmployerId && owningEmployerId !== creditOwner.id) {
        return NextResponse.json({ error: 'Access denied to this application' }, { status: 403 });
      }

      contactInfo = {
        email: targetApplication.applicant.email,
        phone: targetApplication.applicant.phone,
        fullName: targetApplication.applicant.fullName,
        contactInfo: targetApplication.applicant.contactInfo,
        socialLinks: targetApplication.applicant.socialLinks
      };
    } else if (resumeId) {
      const resumeOwner = await prisma.user.findUnique({
        where: { id: resumeId },
        select: {
          id: true,
          email: true,
          phone: true,
          fullName: true,
          contactInfo: true,
          socialLinks: true
        }
      });

      if (!resumeOwner) {
        return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
      }

      contactInfo = resumeOwner;
    }

    const revealQuery = [
      applicationId ? { revealedBy: currentUser.id, applicationId } : null,
      applicationId && currentUser.role === USER_ROLES.SUB_USER ? { revealedBy: creditOwner.id, applicationId } : null,
      resumeId ? { revealedBy: currentUser.id, targetUserId: resumeId, applicationId: null } : null,
      resumeId && currentUser.role === USER_ROLES.SUB_USER ? { revealedBy: creditOwner.id, targetUserId: resumeId, applicationId: null } : null
    ].filter(Boolean);

    const existingReveal = revealQuery.length > 0
      ? await prisma.resumeContactReveal.findFirst({ where: { OR: revealQuery } })
      : null;

    if (existingReveal) {
      const purchased = await getUserCredits(creditOwner.id).catch(() => ({}));
      const remainingBalance = (purchased?.resume_contact?.balance) || 0;
      return NextResponse.json({
        success: true,
        contactInfo,
        alreadyRevealed: true,
        revealedAt: existingReveal.createdAt,
        remainingCredits: remainingBalance
      });
    }

    if (resumeId) {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const monthlyCount = await prisma.resumeContactReveal.count({
        where: {
          revealedBy: creditOwner.id,
          applicationId: null,
          createdAt: { gte: thirtyDaysAgo }
        }
      });
      const verifiedAllowed = canRevealResume({ user: creditOwner });
      if (!verifiedAllowed && monthlyCount >= 1) {
        return NextResponse.json({
          error: 'Unverified account limit reached — only 1 resume reveal per month allowed until verification'
        }, { status: 403 });
      }
    }

    try {
      creditUsage = await useCredit(creditOwner.id, 'resume_contact', 1);
    } catch (err) {
      const usage = await checkUserUsageLimits(creditOwner.id, 'resume_view').catch(() => null);
      const purchased = await getUserCredits(creditOwner.id).catch(() => ({}));
      const purchasedBalance = (purchased?.resume_contact?.balance) || 0;
      return NextResponse.json({
        error: 'Insufficient resume credits',
        requiresCredits: true,
        neededCredits: 1,
        available: {
          subscriptionRemaining: usage && usage.hasLimit ? usage.remaining : 'unlimited',
          purchasedBalance
        }
      }, { status: 402 });
    }

    if (creditUsage?.source === 'credit') {
      await prisma.user.update({
        where: { id: creditOwner.id },
        data: { usedResumeCredits: { increment: 1 } }
      });
    }

    const createdReveal = await prisma.resumeContactReveal.create({
      data: {
        revealedBy: currentUser.id,
        targetUserId: applicationId ? targetApplication?.applicant.id : (resumeId || null),
        applicationId: applicationId || null,
        creditCost: 1,
        contactInfo: JSON.stringify(contactInfo),
        revealType: applicationId ? 'application' : 'database'
      }
    });

    const purchased = await getUserCredits(creditOwner.id).catch(() => ({}));
    const purchasedBalance = (purchased?.resume_contact?.balance) || 0;

    return NextResponse.json({
      success: true,
      contactInfo,
      alreadyRevealed: false,
      creditsUsed: 1,
      remainingCredits: purchasedBalance,
      revealedBy: currentUser.fullName || currentUser.email,
      revealedAt: createdReveal.createdAt
    });

  } catch (error) {
    console.error('Resume contact reveal error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}