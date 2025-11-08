// API Route: /api/resume/contact
import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/utils/auth';
import { prisma } from '@/utils/db';
import { useCredit, getUserCredits, checkUserUsageLimits } from '@/utils/newSubscriptionService';
import { USER_ROLES, hasPermission, PERMISSIONS } from '@/utils/roleSystem';

export async function POST(request) {
  try {
    const tokenPayload = getUserFromRequest(request);

    if (!tokenPayload) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Load full user so we can respect parent/main account billing
    const currentUser = await prisma.user.findUnique({ where: { id: tokenPayload.id || tokenPayload.uid }, include: { parentUser: true } });
    if (!currentUser) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Permission check
    if (!hasPermission(currentUser, PERMISSIONS.VIEW_RESUMES)) {
      return NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 });
    }

    const { resumeId, jobApplicationId, contactType = 'view' } = await request.json();
    if (!resumeId && !jobApplicationId) {
      return NextResponse.json({ success: false, error: 'Job application ID or Resume ID is required' }, { status: 400 });
    }

    // Determine whose credits to bill (main account for sub-users)
    const creditUser = currentUser.role === USER_ROLES.SUB_USER && currentUser.parentUser ? currentUser.parentUser : currentUser;

    // Resolve contact source: job application (applicant) or resume owner
    let target = null;
    let targetApplication = null;
    if (jobApplicationId) {
      targetApplication = await prisma.jobApplication.findUnique({
        where: { id: jobApplicationId },
        include: {
          applicant: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
              username: true,
              socialLinks: true,
              profilePicture: true,
              showSensitiveInfo: true
            }
          },
          job: {
            select: {
              id: true,
              employerId: true
            }
          }
        }
      });

      if (!targetApplication) {
        return NextResponse.json({ success: false, error: 'Job application not found' }, { status: 404 });
      }

      // Verify that the current (or main) account can access this application
      const employerId = targetApplication.job?.employerId;
      if (!employerId || employerId !== creditUser.id) {
        return NextResponse.json({ success: false, error: 'Access denied to this application' }, { status: 403 });
      }

      target = targetApplication.applicant;
    } else if (resumeId) {
      target = await prisma.user.findUnique({
        where: { id: resumeId },
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          username: true,
          socialLinks: true,
          profilePicture: true,
          showSensitiveInfo: true
        }
      });

      if (!target) {
        return NextResponse.json({ success: false, error: 'Resume not found' }, { status: 404 });
      }
    }

    // Check if contact was already revealed by this user or their main account
    const existingReveal = await prisma.resumeContactReveal.findFirst({
      where: {
        OR: [
          // application-level reveals
          jobApplicationId ? { revealedBy: currentUser.id, applicationId: jobApplicationId } : null,
          jobApplicationId && currentUser.parentUser ? { revealedBy: creditUser.id, applicationId: jobApplicationId } : null,
          // database resume reveals
          resumeId ? { revealedBy: currentUser.id, targetUserId: resumeId, applicationId: null } : null,
          resumeId && currentUser.parentUser ? { revealedBy: creditUser.id, targetUserId: resumeId, applicationId: null } : null
        ].filter(Boolean)
      }
    });

    // If already revealed, return existing contact info and remaining credits info
    if (existingReveal) {
      const parsedContact = existingReveal.contactInfo ? JSON.parse(existingReveal.contactInfo) : {
        email: target.email,
        phone: target.phone
      };
      const purchased = await getUserCredits(creditUser.id).catch(() => ({}));
      const purchasedBalance = (purchased && purchased.resume_contact && purchased.resume_contact.balance) || 0;

      return NextResponse.json({
        success: true,
        contactInfo: parsedContact,
        alreadyRevealed: true,
        revealedAt: existingReveal.createdAt,
        remainingCredits: purchasedBalance
      });
    }

    // Attempt to consume a resume contact credit (subscription allowance will be used first)
    let creditUsageResult = null;
    try {
      creditUsageResult = await useCredit(creditUser.id, 'resume_contact', 1);
    } catch (err) {
      const usage = await checkUserUsageLimits(creditUser.id, 'resume_view').catch(() => null);
      const purchased = await getUserCredits(creditUser.id).catch(() => ({}));
      const purchasedBalance = (purchased && purchased.resume_contact && purchased.resume_contact.balance) || 0;
      return NextResponse.json({
        success: false,
        error: 'Insufficient resume credits',
        requiresCredits: true,
        neededCredits: 1,
        available: {
          subscriptionRemaining: usage && usage.hasLimit ? usage.remaining : 'unlimited',
          purchasedBalance
        }
      }, { status: 402 });
    }

    // If the credit was consumed from purchased credits, increment usedResumeCredits on the credit owner for backwards-compat
    if (creditUsageResult && creditUsageResult.source === 'credit') {
      await prisma.user.update({ where: { id: creditUser.id }, data: { usedResumeCredits: { increment: 1 } } });
    }

    // Create a ResumeContactReveal record (tracks that this resume's contact was revealed)
    const reveal = await prisma.resumeContactReveal.create({
      data: {
        revealedBy: currentUser.id,
        targetUserId: target.id,
        applicationId: jobApplicationId || null,
        creditCost: 1,
        contactInfo: JSON.stringify({ email: target.email, phone: target.phone, socialLinks: target.socialLinks || null, fullName: target.fullName }),
        revealType: jobApplicationId ? 'application' : 'database'
      }
    });

    const purchased = await getUserCredits(creditUser.id).catch(() => ({}));
    const purchasedBalance = (purchased && purchased.resume_contact && purchased.resume_contact.balance) || 0;

    return NextResponse.json({
      success: true,
      contactInfo: { email: target.email, phone: target.phone, socialLinks: target.socialLinks || null },
      alreadyRevealed: false,
      creditsUsed: 1,
      remainingCredits: purchasedBalance,
      revealedBy: currentUser.fullName || currentUser.email,
      revealedAt: reveal.createdAt
    });
  } catch (error) {
    console.error('Error accessing resume contact:', error);
    return NextResponse.json({ success: false, error: 'Failed to access resume contact' }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const tokenPayload = await getUserFromRequest(request);
    if (!tokenPayload) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({ where: { id: tokenPayload.id || tokenPayload.uid }, include: { parentUser: true } });
    if (!currentUser) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Permission to view resumes
    if (!hasPermission(currentUser, PERMISSIONS.VIEW_RESUMES)) {
      return NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const resumeId = searchParams.get('resume_id');
    if (!resumeId) {
      return NextResponse.json({ success: false, error: 'Resume ID is required' }, { status: 400 });
    }

    // Determine credit owner
    const creditUser = currentUser.role === USER_ROLES.SUB_USER && currentUser.parentUser ? currentUser.parentUser : currentUser;

    // Resolve basic resume/profile info
    const targetUser = await prisma.user.findUnique({
      where: { id: resumeId },
      select: {
        id: true,
        fullName: true,
        profilePicture: true,
        location: true,
        email: true,
        phone: true,
        showSensitiveInfo: true
      }
    });

    if (!targetUser) {
      return NextResponse.json({ success: false, error: 'Resume not found' }, { status: 404 });
    }

    // Check if current user or their main account already revealed this resume
    const existingReveal = await prisma.resumeContactReveal.findFirst({
      where: {
        OR: [
          { revealedBy: currentUser.id, targetUserId: resumeId, applicationId: null },
          ...(currentUser.parentUser ? [{ revealedBy: creditUser.id, targetUserId: resumeId, applicationId: null }] : [])
        ]
      }
    });

    const purchased = await getUserCredits(creditUser.id).catch(() => ({}));
    const purchasedBalance = (purchased && purchased.resume_contact && purchased.resume_contact.balance) || 0;

    // Build a basic resume info payload (without contact details)
    const parsedResume = await prisma.parsedResume.findFirst({ where: { userId: resumeId, parsingStatus: 'completed' }, select: { summary: true, skills: true, experience: true, totalExperienceYears: true } });
    const resumeInfo = {
      resumeId: resumeId,
      fullName: targetUser.fullName,
      title: parsedResume?.summary || null,
      location: targetUser.location,
      experience: parsedResume?.totalExperienceYears || null,
      skills: parsedResume?.skills || [],
      summary: parsedResume?.summary || null
    };

    return NextResponse.json({
      success: true,
      resumeInfo,
      hasAccess: !!existingReveal,
      remainingCredits: purchasedBalance,
      canAccess: purchasedBalance > 0 || !!existingReveal || !!targetUser.showSensitiveInfo
    });
  } catch (error) {
    console.error('Error fetching resume info:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch resume info' }, { status: 500 });
  }
}

// Helper functions (mock implementations)
async function getResumeContactInfo(resumeId) {
  // In a real implementation, this would fetch from your resume database
  return {
    resumeId: resumeId,
    email: 'john.doe@example.com',
    phone: '+63 912 345 6789',
    linkedin: 'https://linkedin.com/in/johndoe',
    github: 'https://github.com/johndoe',
    website: 'https://johndoe.dev'
  };
}

async function getBasicResumeInfo(resumeId) {
  // In a real implementation, this would fetch basic info from your resume database
  return {
    resumeId: resumeId,
    fullName: 'John Doe',
    title: 'Senior Software Engineer',
    location: 'Manila, Philippines',
    experience: '5+ years',
    skills: ['JavaScript', 'React', 'Node.js', 'Python'],
    summary: 'Experienced software engineer with expertise in full-stack development...'
  };
}

async function hasAccessedResume(userId, resumeId) {
  // Check if user has previously accessed this resume
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();
  
  const access = await prisma.$queryRaw`
    SELECT COUNT(*) as count 
    FROM contact_views 
    WHERE user_id = ${userId}::uuid 
    AND resume_id = ${resumeId}::uuid
  `;
  
  return access[0].count > 0;
}

async function logContactView(userId, resumeId, contactType) {
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();
  
  // Create contact_views table if it doesn't exist
  await prisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS contact_views (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL,
      resume_id UUID NOT NULL,
      contact_type VARCHAR(50) NOT NULL,
      viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, resume_id)
    )
  `;
  
  // Log the view
  await prisma.$executeRaw`
    INSERT INTO contact_views (user_id, resume_id, contact_type)
    VALUES (${userId}::uuid, ${resumeId}::uuid, ${contactType})
    ON CONFLICT (user_id, resume_id) DO UPDATE 
    SET viewed_at = CURRENT_TIMESTAMP
  `;
}
