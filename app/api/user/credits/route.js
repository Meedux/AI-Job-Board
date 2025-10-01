import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

// GET - Get user credit information
export async function GET(request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('auth-token');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from token
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { id: token.value },
          { email: token.value }
        ]
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get main user for credit calculations
    const mainUser = user.parentUserId ? 
      await prisma.user.findUnique({ 
        where: { id: user.parentUserId },
        select: {
          id: true,
          allocatedResumeCredits: true,
          usedResumeCredits: true,
          allocatedAiCredits: true,
          usedAiCredits: true
        }
      }) : 
      {
        id: user.id,
        allocatedResumeCredits: user.allocatedResumeCredits,
        usedResumeCredits: user.usedResumeCredits,
        allocatedAiCredits: user.allocatedAiCredits,
        usedAiCredits: user.usedAiCredits
      };

    // Calculate remaining credits
    const resumeCredits = Math.max(0, mainUser.allocatedResumeCredits - mainUser.usedResumeCredits);
    const aiCredits = Math.max(0, mainUser.allocatedAiCredits - mainUser.usedAiCredits);

    // Get credit usage history
    const creditHistory = await prisma.resumeContactReveal.findMany({
      where: {
        OR: [
          { revealedBy: user.id },
          user.parentUserId ? { revealedBy: user.parentUserId } : { revealedBy: 'none' }
        ]
      },
      select: {
        id: true,
        creditCost: true,
        revealType: true,
        createdAt: true,
        targetUser: {
          select: {
            fullName: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });

    return NextResponse.json({
      success: true,
      credits: resumeCredits, // Total credits (for backward compatibility)
      resumeCredits,
      aiCredits,
      allocated: {
        resumeCredits: mainUser.allocatedResumeCredits,
        aiCredits: mainUser.allocatedAiCredits
      },
      used: {
        resumeCredits: mainUser.usedResumeCredits,
        aiCredits: mainUser.usedAiCredits
      },
      isSubUser: !!user.parentUserId,
      parentUserId: user.parentUserId,
      recentUsage: creditHistory
    });

  } catch (error) {
    console.error('Error fetching user credits:', error);
    return NextResponse.json(
      { error: 'Failed to fetch credit information' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}