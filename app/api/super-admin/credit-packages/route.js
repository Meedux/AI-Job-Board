import { NextResponse } from 'next/server';
import prisma from '../../../../utils/db';
import { getUserFromRequest } from '../../../../utils/auth';

// GET - List all credit packages
export async function GET(request) {
  try {
    const user = getUserFromRequest(request);
    
    if (!user || user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const packages = await prisma.creditPackage.findMany({
      orderBy: [
        { price: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json({ 
      success: true, 
      packages 
    });

  } catch (error) {
    console.error('Error fetching credit packages:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch credit packages' 
    }, { status: 500 });
  }
}

// POST - Create new credit package
export async function POST(request) {
  try {
    const user = getUserFromRequest(request);
    
    if (!user || user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    
    // Validate required fields
    if (!data.name || !data.creditType || !data.amount || !data.price) {
      return NextResponse.json({ 
        error: 'Name, credit type, amount, and price are required' 
      }, { status: 400 });
    }

    // Check if package name already exists
    const existingPackage = await prisma.creditPackage.findFirst({
      where: { name: data.name }
    });

    if (existingPackage) {
      return NextResponse.json({ 
        error: 'A package with this name already exists' 
      }, { status: 400 });
    }

    const newPackage = await prisma.creditPackage.create({
      data: {
        name: data.name,
        description: data.description || '',
        creditType: data.creditType,
        creditAmount: data.amount,
        price: data.price,
        bonusCredits: data.bonusAmount || 0,
        validityDays: data.expiryDays || null,
        isActive: data.isActive !== false,
        // Store UI-specific features in bundleConfig or addonFeatures
        bundleConfig: data.features ? { features: data.features, isPopular: data.isPopular } : null
      }
    });

    return NextResponse.json({ 
      success: true, 
      package: newPackage 
    });

  } catch (error) {
    console.error('Error creating credit package:', error);
    return NextResponse.json({ 
      error: 'Failed to create credit package' 
    }, { status: 500 });
  }
}
