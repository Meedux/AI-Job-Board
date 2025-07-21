import { NextResponse } from 'next/server';
import prisma from '../../../../../utils/db';
import { getUserFromRequest } from '../../../../../utils/auth';

// GET - Get single credit package
export async function GET(request, { params }) {
  try {
    const user = getUserFromRequest(request);
    
    if (!user || user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const creditPackage = await prisma.creditPackage.findUnique({
      where: { id: params.id }
    });

    if (!creditPackage) {
      return NextResponse.json({ 
        error: 'Credit package not found' 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      package: creditPackage 
    });

  } catch (error) {
    console.error('Error fetching credit package:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch credit package' 
    }, { status: 500 });
  }
}

// PUT - Update credit package
export async function PUT(request, { params }) {
  try {
    const user = getUserFromRequest(request);
    
    if (!user || user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    
    // Check if package exists
    const existingPackage = await prisma.creditPackage.findUnique({
      where: { id: params.id }
    });

    if (!existingPackage) {
      return NextResponse.json({ 
        error: 'Credit package not found' 
      }, { status: 404 });
    }

    // Check if name is being changed and if it conflicts
    if (data.name && data.name !== existingPackage.name) {
      const nameConflict = await prisma.creditPackage.findFirst({
        where: { 
          name: data.name,
          id: { not: params.id }
        }
      });

      if (nameConflict) {
        return NextResponse.json({ 
          error: 'A package with this name already exists' 
        }, { status: 400 });
      }
    }

    const updatedPackage = await prisma.creditPackage.update({
      where: { id: params.id },
      data: {
        name: data.name !== undefined ? data.name : existingPackage.name,
        description: data.description !== undefined ? data.description : existingPackage.description,
        creditType: data.creditType !== undefined ? data.creditType : existingPackage.creditType,
        creditAmount: data.amount !== undefined ? data.amount : existingPackage.creditAmount,
        price: data.price !== undefined ? data.price : existingPackage.price,
        bonusCredits: data.bonusAmount !== undefined ? data.bonusAmount : existingPackage.bonusCredits,
        validityDays: data.expiryDays !== undefined ? data.expiryDays : existingPackage.validityDays,
        isActive: data.isActive !== undefined ? data.isActive : existingPackage.isActive,
        bundleConfig: data.features !== undefined || data.isPopular !== undefined ? 
          { features: data.features || [], isPopular: data.isPopular || false } : 
          existingPackage.bundleConfig,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ 
      success: true, 
      package: updatedPackage 
    });

  } catch (error) {
    console.error('Error updating credit package:', error);
    return NextResponse.json({ 
      error: 'Failed to update credit package' 
    }, { status: 500 });
  }
}

// DELETE - Delete credit package
export async function DELETE(request, { params }) {
  try {
    const user = getUserFromRequest(request);
    
    if (!user || user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if package exists
    const existingPackage = await prisma.creditPackage.findUnique({
      where: { id: params.id }
    });

    if (!existingPackage) {
      return NextResponse.json({ 
        error: 'Credit package not found' 
      }, { status: 404 });
    }

    // Check if there are any credit purchases using this package
    const creditPurchases = await prisma.userCredit.count({
      where: { 
        sourceType: 'purchase',
        sourceId: params.id
      }
    });

    if (creditPurchases > 0) {
      return NextResponse.json({ 
        error: `Cannot delete package with ${creditPurchases} existing purchase(s). Consider deactivating instead.` 
      }, { status: 400 });
    }

    // Soft delete by setting isActive to false
    const deletedPackage = await prisma.creditPackage.update({
      where: { id: params.id },
      data: { 
        isActive: false,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Credit package deleted successfully' 
    });

  } catch (error) {
    console.error('Error deleting credit package:', error);
    return NextResponse.json({ 
      error: 'Failed to delete credit package' 
    }, { status: 500 });
  }
}
