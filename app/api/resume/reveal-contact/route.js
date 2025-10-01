import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/utils/auth';
import { PrismaClient } from '@prisma/client';
import { USER_ROLES, hasPermission, PERMISSIONS } from '@/utils/roleSystem';

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

    // Check if user has sufficient resume credits
    if (creditUser.allocatedResumeCredits <= creditUser.usedResumeCredits) {
      return NextResponse.json({ 
        error: 'Insufficient resume credits',
        remainingCredits: Math.max(0, creditUser.allocatedResumeCredits - creditUser.usedResumeCredits)
      }, { status: 402 });
    }

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
          { 
            revealedBy: currentUser.id,
            ...(jobApplicationId ? { jobApplicationId } : { resumeId })
          },
          // For sub-users, also check if parent user already revealed
          ...(currentUser.role === USER_ROLES.SUB_USER ? [{
            revealedBy: creditUser.id,
            ...(jobApplicationId ? { jobApplicationId } : { resumeId })
          }] : [])
        ]
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

    // Deduct credit from the appropriate user (main user for sub-users)
    await prisma.user.update({
      where: { id: creditUser.id },
      data: {
        usedResumeCredits: {
          increment: 1
        }
      }
    });

    // Track the contact reveal
    await prisma.resumeContactReveal.create({
      data: {
        revealedBy: currentUser.id,
        revealedFor: creditUser.id, // Track which account the credit was used from
        jobApplicationId: jobApplicationId || null,
        resumeId: resumeId || null,
        contactInfo: JSON.stringify(contactInfo),
        revealType: jobApplicationId ? 'application' : 'database'
      }
    });

    const remainingCredits = Math.max(0, creditUser.allocatedResumeCredits - (creditUser.usedResumeCredits + 1));

    return NextResponse.json({
      success: true,
      contactInfo,
      alreadyRevealed: false,
      creditsUsed: 1,
      remainingCredits,
      revealedBy: currentUser.fullName || currentUser.email
    });

  } catch (error) {
    console.error('Resume contact reveal error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}