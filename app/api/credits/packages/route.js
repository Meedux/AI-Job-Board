// API Route: /api/credits/packages - Enhanced Credit Packages
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getUserFromRequest } from '@/utils/auth';
import { initializeDefaultCreditPackages, createCreditPackagePayment } from '@/utils/newSubscriptionService';

const prisma = new PrismaClient();

export async function GET(request) {
  console.log('📋 GET /api/credits/packages - Fetching credit packages');
  
  try {
    // Initialize default credit packages if none exist
    const packageCount = await prisma.creditPackage.count();
    if (packageCount === 0) {
      console.log('🔄 No credit packages found, initializing default packages...');
      try {
        await initializeDefaultCreditPackages();
      } catch (initError) {
        console.error('❌ Error initializing credit packages, continuing with empty list:', initError);
        // Continue execution to return empty list rather than failing completely
      }
    }

    const packages = await prisma.creditPackage.findMany({
      where: {
        isActive: true
      },
      orderBy: [
        { creditType: 'asc' },
        { price: 'asc' }
      ]
    });

    console.log(`✅ Found ${packages.length} active credit packages`);

    // Group packages by type for better organization
    const groupedPackages = packages.reduce((acc, pkg) => {
      if (!acc[pkg.creditType]) {
        acc[pkg.creditType] = [];
      }
      acc[pkg.creditType].push({
        id: pkg.id,
        name: pkg.name,
        description: pkg.description,
        creditType: pkg.creditType,
        creditAmount: pkg.creditAmount,
        price: pkg.price,
        currency: pkg.currency,
        bonusCredits: pkg.bonusCredits,
        bundleConfig: pkg.bundleConfig,
        isAddon: pkg.isAddon,
        addonFeatures: pkg.addonFeatures,
        validityDays: pkg.validityDays,
        totalCredits: pkg.creditAmount + pkg.bonusCredits,
        pricePerCredit: pkg.price / (pkg.creditAmount + pkg.bonusCredits),
        createdAt: pkg.createdAt,
        updatedAt: pkg.updatedAt
      });
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      packages: groupedPackages,
      all: packages
    });
  } catch (error) {
    console.error('❌ Error fetching credit packages:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch credit packages' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  console.log('💳 POST /api/credits/packages - Creating credit package payment');
  
  try {
    const user = getUserFromRequest(request);
    
    if (!user) {
      console.log('❌ Unauthorized access attempt');
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { packageId } = await request.json();
    
    if (!packageId) {
      return NextResponse.json(
        { success: false, error: 'Package ID is required' },
        { status: 400 }
      );
    }

    const userId = user.id || user.uid;
    console.log('🔄 Creating credit package payment:', { userId, packageId });

    // Create payment for credit package
    const result = await createCreditPackagePayment(userId, packageId);

    console.log('✅ Payment intent created:', result.paymentIntent.id);

    return NextResponse.json({
      success: true,
      paymentIntent: {
        id: result.paymentIntent.id,
        client_key: result.paymentIntent.attributes.client_key,
        amount: result.paymentIntent.attributes.amount,
        currency: result.paymentIntent.attributes.currency,
        status: result.paymentIntent.attributes.status
      },
      transaction: result.transaction
    });
  } catch (error) {
    console.error('❌ Error creating credit package payment:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create payment' },
      { status: 500 }
    );
  }
}
