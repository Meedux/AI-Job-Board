import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/utils/auth';
import { canRevealResume } from '@/utils/policy';
import { PrismaClient } from '@prisma/client';
import { USER_ROLES, hasPermission, PERMISSIONS } from '@/utils/roleSystem';
import { useCredit, getUserCredits, checkUserUsageLimits } from '@/utils/newSubscriptionService';

const prisma = new PrismaClient();

// POST - Reveal resume contact information with credit tracking
export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.id) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        parentUser: true
      }
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user has permission to view resume contacts
    if (!hasPermission(currentUser, PERMISSIONS.VIEW_RESUMES)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { jobApplicationId, resumeId } = await request.json();

    if (!jobApplicationId && !resumeId) {
      return NextResponse.json({ error: 'Job application ID or resume ID is required' }, { status: 400 });
    }

    // Determine which user's credits to use (main user for sub-users)
    const creditUser = currentUser.role === USER_ROLES.SUB_USER && currentUser.parentUser 
      ? currentUser.parentUser 
      : currentUser;

    let creditUsage = null;

    let contactInfo = {};
    let targetApplication = null;

    if (jobApplicationId) {
      // Get contact info from job application
      targetApplication = await prisma.jobApplication.findUnique({
        where: { id: jobApplicationId },
        include: {
          applicant: {
            select: {
              id: true,
              email: true,
              phone: true,
              fullName: true,
              username: true,
              contactInfo: true,
              socialLinks: true,
              isContactRevealed: true
            }
          },
          job: {
            select: {
              id: true,
              title: true,
              companyName: true,
              employerId: true
            }
          }
        }
      });

      if (!targetApplication) {
        return NextResponse.json({ error: 'Job application not found' }, { status: 404 });
      }

      // Check if the current user/employer has access to this application
      if (targetApplication.job.employerId !== creditUser.id) {
        return NextResponse.json({ error: 'Access denied to this application' }, { status: 403 });
      }

      contactInfo = {
        email: targetApplication.applicant.email,
        phone: targetApplication.applicant.phone,
        fullName: targetApplication.applicant.fullName,
        username: targetApplication.applicant.username,
        contactInfo: targetApplication.applicant.contactInfo,
        socialLinks: targetApplication.applicant.socialLinks
      };
    } else if (resumeId) {
      // Get contact info from resume database
      const resume = await prisma.user.findUnique({
        where: { id: resumeId },
        select: {
          id: true,
          email: true,
          phone: true,
          fullName: true,
          username: true,
          contactInfo: true,
          socialLinks: true,
          isContactRevealed: true
        }
      });

      if (!resume) {
        return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
      }

      contactInfo = resume;
    }

    // Check if contact was already revealed by this user/employer
    const existingReveal = await prisma.resumeContactReveal.findFirst({
      where: {
        OR: [
          jobApplicationId ? { revealedBy: currentUser.id, applicationId: jobApplicationId } : null,
          jobApplicationId && currentUser.role === USER_ROLES.SUB_USER ? { revealedBy: creditUser.id, applicationId: jobApplicationId } : null,
          resumeId ? { revealedBy: currentUser.id, targetUserId: resumeId, applicationId: null } : null,
          resumeId && currentUser.role === USER_ROLES.SUB_USER ? { revealedBy: creditUser.id, targetUserId: resumeId, applicationId: null } : null
        ].filter(Boolean)
      }
    });

    if (existingReveal) {
      return NextResponse.json({
        success: true,
        contactInfo,
        alreadyRevealed: true,
        revealedAt: existingReveal.createdAt,
        remainingCredits: Math.max(0, creditUser.allocatedResumeCredits - creditUser.usedResumeCredits)
      });
    }

    // If not already revealed, attempt to consume a credit (subscription allowance first, then purchased credits)
    if (!existingReveal) {
      // Enforce verification restrictions: unverified employers cannot reveal resumes from the public/database
      if (resumeId) {
        const revealActor = creditUser; // the account that will be charged/used
        if (!canRevealResume({ user: revealActor })) {
          return NextResponse.json({ error: 'Account not verified — verify company to reveal resumes from the database' }, { status: 403 });
        }
      }
      try {
        creditUsage = await useCredit(creditUser.id, 'resume_contact', 1);
      } catch (err) {
        const usage = await checkUserUsageLimits(creditUser.id, 'resume_view').catch(() => null);
        const purchased = await getUserCredits(creditUser.id).catch(() => ({}));
        const purchasedBalance = (purchased && purchased.resume_contact && purchased.resume_contact.balance) || 0;
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

      // If the credit was consumed from purchased credits, increment usedResumeCredits on the credit owner for backward-compatibility
      if (creditUsage && creditUsage.source === 'credit') {
        await prisma.user.update({ where: { id: creditUser.id }, data: { usedResumeCredits: { increment: 1 } } });
      }

      // Track the contact reveal
      const created = await prisma.resumeContactReveal.create({
        data: {
          revealedBy: currentUser.id,
          targetUserId: jobApplicationId ? targetApplication.applicant.id : (resumeId || null),
          applicationId: jobApplicationId || null,
          creditCost: 1,
          contactInfo: JSON.stringify(contactInfo),
          revealType: jobApplicationId ? 'application' : 'database'
        }
      });

      const purchased = await getUserCredits(creditUser.id).catch(() => ({}));
      const purchasedBalance = (purchased && purchased.resume_contact && purchased.resume_contact.balance) || 0;

      // Return canonical response
      return NextResponse.json({
        success: true,
        contactInfo,
        alreadyRevealed: false,
        creditsUsed: 1,
        remainingCredits: purchasedBalance,
        revealedBy: currentUser.fullName || currentUser.email,
        revealedAt: created.createdAt
      });
    }

    const purchased = await getUserCredits(creditUser.id).catch(() => ({}));
    const purchasedBalance = (purchased && purchased.resume_contact && purchased.resume_contact.balance) || 0;

    // Return canonical response
    return NextResponse.json({
      success: true,
      contactInfo,
      alreadyRevealed: false,
      creditsUsed: 1,
      remainingCredits: purchasedBalance,
      revealedBy: currentUser.fullName || currentUser.email,
      revealedAt: created.createdAt
    });

  } catch (error) {
    console.error('Resume contact reveal error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}