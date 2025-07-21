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
      companies = await prisma.company.findMany({
        orderBy: { name: 'asc' }
      });
    } else {
      // For employers, we'll get companies they've created jobs for or their own company
      companies = await prisma.company.findMany({
        where: {
          OR: [
            { jobs: { some: { postedById: userId } } },
            { name: user.companyName }
          ]
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
        isActive: true
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
