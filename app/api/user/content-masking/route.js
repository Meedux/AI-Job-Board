import { getUserFromRequest } from '@/utils/auth';
import { PrismaClient } from '@prisma/client';
import { canUseContentMasking } from '@/utils/userContentMasking';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const decoded = getUserFromRequest(request);

    if (!decoded || !decoded.id) {
      return Response.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const userId = decoded.id;

    // Get user's current content masking setting
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        contentMasking: true,
        subscriptions: {
          where: {
            status: 'active',
            currentPeriodEnd: { gt: new Date() }
          },
          include: {
            plan: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      }
    });

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user can use content masking
    const subscription = user.subscriptions[0];
    const canUseMasking = canUseContentMasking(subscription);
    
    console.log('Debug - User subscription:', subscription);
    console.log('Debug - Can use masking:', canUseMasking);
    console.log('Debug - Current plan:', subscription?.plan?.planType || 'none');

    return Response.json({
      contentMasking: user.contentMasking,
      canUseMasking,
      currentPlan: subscription?.plan?.planType || 'free'
    });

  } catch (error) {
    console.error('Get content masking error:', error);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const decoded = getUserFromRequest(request);

    if (!decoded || !decoded.id) {
      return Response.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const userId = decoded.id;

    const { contentMasking } = await request.json();

    if (typeof contentMasking !== 'boolean') {
      return Response.json({ error: 'Invalid content masking value' }, { status: 400 });
    }

    // Get user and check subscription
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscriptions: {
          where: {
            status: 'active',
            currentPeriodEnd: { gt: new Date() }
          },
          include: {
            plan: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      }
    });

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user can use content masking
    const subscription = user.subscriptions[0];
    const canUseMasking = canUseContentMasking(subscription);

    if (contentMasking && !canUseMasking) {
      return Response.json({ 
        error: 'Content masking is a premium feature. Please upgrade your subscription.',
        requiresPremium: true 
      }, { status: 403 });
    }

    // Update content masking setting
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { contentMasking },
      select: {
        id: true,
        contentMasking: true
      }
    });

    return Response.json({
      success: true,
      contentMasking: updatedUser.contentMasking,
      message: `Content masking ${contentMasking ? 'enabled' : 'disabled'} successfully`
    });

  } catch (error) {
    console.error('Update content masking error:', error);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}
