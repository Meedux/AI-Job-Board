import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = decoded.id;

    // Get user info to check role
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user || !['super_admin', 'employer_admin', 'sub_user'].includes(user.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get companies - for employer_admin and sub_users, show companies they have access to
    let companies;
    if (user.role === 'super_admin') {
      // Super admin can see all companies
      companies = await prisma.company.findMany({
        include: {
          createdBy: {
            select: {
              id: true,
              fullName: true,
              email: true
            }
          },
          _count: {
            select: {
              jobs: true
            }
          }
        },
        orderBy: { name: 'asc' }
      });
    } else {
      // For employers and sub_users, show companies they created or have access to
      const baseUserId = user.parentUserId || userId; // Use parent user ID for sub_users
      
      companies = await prisma.company.findMany({
        where: {
          OR: [
            { createdById: userId }, // Companies created by this user
            { createdById: baseUserId }, // Companies created by parent user (for sub_users)
            { 
              AND: [
                { createdById: { not: null } },
                { 
                  createdBy: { 
                    OR: [
                      { id: userId },
                      { id: baseUserId },
                      { parentUserId: baseUserId }
                    ]
                  }
                }
              ]
            }
          ]
        },
        include: {
          createdBy: {
            select: {
              id: true,
              fullName: true,
              email: true
            }
          },
          _count: {
            select: {
              jobs: true
            }
          }
        },
        orderBy: { name: 'asc' }
      });
    }

    return NextResponse.json({
      success: true,
      companies
    });

  } catch (error) {
    console.error('Error fetching companies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch companies' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = decoded.id;
    const companyData = await request.json();

    // Validate required fields
    const requiredFields = ['name'];
    for (const field of requiredFields) {
      if (!companyData[field]) {
        return NextResponse.json({ error: `${field} is required` }, { status: 400 });
      }
    }

    // Check if user has permission to create companies
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user || !['super_admin', 'employer_admin', 'sub_user'].includes(user.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Check if company name already exists
    const existingCompany = await prisma.company.findFirst({
      where: { name: companyData.name }
    });

    if (existingCompany) {
      return NextResponse.json({ 
        error: 'A company with this name already exists' 
      }, { status: 409 });
    }

    // Create the company
    const company = await prisma.company.create({
      data: {
        name: companyData.name,
        description: companyData.description || null,
        location: companyData.location || null,
        industry: companyData.industry || 'Technology',
        logoUrl: companyData.logoUrl || null,
        websiteUrl: companyData.websiteUrl || null,
        createdById: userId, // Link company to the user who created it
        isActive: true
      },
      include: {
        createdBy: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Company created successfully',
      company: {
        id: company.id,
        name: company.name,
        description: company.description,
        location: company.location,
        industry: company.industry,
        logoUrl: company.logoUrl,
        websiteUrl: company.websiteUrl
      }
    });

  } catch (error) {
    console.error('Error creating company:', error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A company with this name already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create company' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = decoded.id;
    const url = new URL(request.url);
    const companyId = url.searchParams.get('id');
    const companyData = await request.json();

    if (!companyId) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
    }

    // Check if user has permission to edit companies
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user || !['super_admin', 'employer_admin', 'sub_user'].includes(user.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get the company to check ownership
    const existingCompany = await prisma.company.findUnique({
      where: { id: companyId },
      include: { createdBy: true }
    });

    if (!existingCompany) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // Check access permissions
    const baseUserId = user.parentUserId || userId;
    const canEdit = user.role === 'super_admin' || 
                   existingCompany.createdById === userId ||
                   existingCompany.createdById === baseUserId ||
                   (existingCompany.createdBy?.parentUserId === baseUserId);

    if (!canEdit) {
      return NextResponse.json({ error: 'You can only edit companies you created' }, { status: 403 });
    }

    // Update the company
    const company = await prisma.company.update({
      where: { id: companyId },
      data: {
        name: companyData.name,
        description: companyData.description || null,
        location: companyData.location || null,
        industry: companyData.industry || 'Technology',
        logoUrl: companyData.logoUrl || null,
        websiteUrl: companyData.websiteUrl || null,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Company updated successfully',
      company
    });

  } catch (error) {
    console.error('Error updating company:', error);
    return NextResponse.json(
      { error: 'Failed to update company' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = decoded.id;
    const url = new URL(request.url);
    const companyId = url.searchParams.get('id');

    if (!companyId) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
    }

    // Check if user has permission to delete companies
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user || !['super_admin', 'employer_admin', 'sub_user'].includes(user.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get the company to check ownership and dependencies
    const existingCompany = await prisma.company.findUnique({
      where: { id: companyId },
      include: { 
        createdBy: true,
        jobs: true
      }
    });

    if (!existingCompany) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // Check access permissions - only super_admin or creator can delete
    const baseUserId = user.parentUserId || userId;
    const canDelete = user.role === 'super_admin' || 
                     existingCompany.createdById === userId ||
                     existingCompany.createdById === baseUserId;

    if (!canDelete) {
      return NextResponse.json({ error: 'You can only delete companies you created' }, { status: 403 });
    }

    // Check if company has associated jobs
    if (existingCompany.jobs.length > 0) {
      return NextResponse.json({ 
        error: `Cannot delete company. It has ${existingCompany.jobs.length} associated job(s). Please remove all jobs first.` 
      }, { status: 400 });
    }

    // Delete the company
    await prisma.company.delete({
      where: { id: companyId }
    });

    return NextResponse.json({
      success: true,
      message: 'Company deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting company:', error);
    return NextResponse.json(
      { error: 'Failed to delete company' },
      { status: 500 }
    );
  }
}
