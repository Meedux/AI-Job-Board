// API Route: /api/resume/contact
import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/utils/auth';
import { useUserCredits, getUserCreditBalance, hasFeatureAccess } from '@/utils/subscriptionService';

export async function POST(request) {
  try {
    const user = getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { resumeId, contactType = 'view' } = await request.json();
    
    if (!resumeId) {
      return NextResponse.json(
        { success: false, error: 'Resume ID is required' },
        { status: 400 }
      );
    }

    // Check if user has access to resume contact feature
    const hasAccess = await hasFeatureAccess(user.id, 'resumeContacts');
    if (!hasAccess) {
      return NextResponse.json(
        { success: false, error: 'Feature not available in your plan' },
        { status: 403 }
      );
    }

    // Check credit balance
    const creditBalance = await getUserCreditBalance(user.id, 'resume_contact');
    if (creditBalance <= 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Insufficient credits', 
          remainingCredits: creditBalance 
        },
        { status: 402 }
      );
    }

    // Use credit
    const creditUsed = await useUserCredits(user.id, 'resume_contact', 1);
    if (!creditUsed) {
      return NextResponse.json(
        { success: false, error: 'Failed to use credit' },
        { status: 500 }
      );
    }

    // Get resume contact information (mock implementation)
    const contactInfo = await getResumeContactInfo(resumeId);
    
    // Log the contact view
    await logContactView(user.id, resumeId, contactType);

    return NextResponse.json({
      success: true,
      contactInfo: contactInfo,
      remainingCredits: creditBalance - 1
    });
  } catch (error) {
    console.error('Error accessing resume contact:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to access resume contact' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    const user = await verifyToken(token);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const resumeId = searchParams.get('resume_id');
    
    if (!resumeId) {
      return NextResponse.json(
        { success: false, error: 'Resume ID is required' },
        { status: 400 }
      );
    }

    // Check if user has access to resume contact feature
    const hasAccess = await hasFeatureAccess(user.id, 'resumeContacts');
    if (!hasAccess) {
      return NextResponse.json(
        { success: false, error: 'Feature not available in your plan' },
        { status: 403 }
      );
    }

    // Get credit balance
    const creditBalance = await getUserCreditBalance(user.id, 'resume_contact');
    
    // Check if user has previously accessed this resume
    const hasAccessed = await hasAccessedResume(user.id, resumeId);
    
    // Get basic resume info (without contact details)
    const resumeInfo = await getBasicResumeInfo(resumeId);
    
    return NextResponse.json({
      success: true,
      resumeInfo: resumeInfo,
      hasAccess: hasAccessed,
      remainingCredits: creditBalance,
      canAccess: creditBalance > 0 || hasAccessed
    });
  } catch (error) {
    console.error('Error fetching resume info:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch resume info' },
      { status: 500 }
    );
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
