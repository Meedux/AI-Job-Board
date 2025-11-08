import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    // Try to get token from cookie first, then from Authorization header
    const cookieStore = await cookies();
    let token = cookieStore.get('auth-token')?.value;
    
    if (!token) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

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
    const formData = await request.json();

    console.log('Application form creation attempt:', {
      userId,
      jobId: formData.jobId,
      title: formData.title,
      fieldsCount: formData.fields?.length || 0
    });

    // Validate required fields
    if (!formData.jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }

    if (!formData.title || !formData.fields) {
      return NextResponse.json({ error: 'Form title and fields are required' }, { status: 400 });
    }

    // Validate jobId format
    if (!formData.jobId || typeof formData.jobId !== 'string') {
      return NextResponse.json({ error: 'Invalid Job ID format' }, { status: 400 });
    }

    // Check if job exists and user has permission to create forms for it
    const job = await prisma.job.findFirst({
      where: { 
        id: formData.jobId,
        postedById: userId 
      }
    });

    console.log('Job validation result:', {
      jobFound: !!job,
      jobId: formData.jobId,
      userId: userId
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found or unauthorized' }, { status: 404 });
    }

    // Create the application form
    const applicationForm = await prisma.applicationForm.create({
      data: {
        title: formData.title,
        description: formData.description || null,
        fields: JSON.stringify(formData.fields),
        jobId: formData.jobId,
        createdBy: userId,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    console.log('Application form created successfully:', {
      formId: applicationForm.id,
      jobId: applicationForm.jobId,
      title: applicationForm.title
    });

    return NextResponse.json({
      success: true,
      message: 'Application form created successfully',
      form: {
        id: applicationForm.id,
        title: applicationForm.title,
        jobId: applicationForm.jobId,
        isActive: applicationForm.isActive,
        createdAt: applicationForm.createdAt
      }
    });

  } catch (error) {
    console.error('Error creating application form:', error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'An application form for this job already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create application form' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    const formId = searchParams.get('formId');

    if (formId) {
      // Get specific form
      const form = await prisma.applicationForm.findUnique({
        where: { 
          id: formId,
          isActive: true 
        },
        select: {
          id: true,
          title: true,
          description: true,
          fields: true,
          jobId: true,
          isActive: true,
          createdAt: true,
          job: {
            select: {
              id: true,
              title: true,
              company: {
                select: {
                  name: true
                }
              },
              location: true
            }
          }
        }
      });

      if (!form) {
        return NextResponse.json({ error: 'Form not found' }, { status: 404 });
      }

      // Parse fields JSON
      const formData = {
        ...form,
        fields: JSON.parse(form.fields)
      };

      return NextResponse.json({
        success: true,
        form: formData
      });
    }

    if (jobId) {
      // Get form for specific job
      const form = await prisma.applicationForm.findFirst({
        where: { 
          jobId: jobId,
          isActive: true 
        },
        select: {
          id: true,
          title: true,
          description: true,
          fields: true,
          jobId: true,
          isActive: true,
          createdAt: true
        }
      });

      if (!form) {
        return NextResponse.json({ 
          success: true, 
          form: null,
          message: 'No custom form found for this job. Using default form.' 
        });
      }

      // Parse fields JSON
      const formData = {
        ...form,
        fields: JSON.parse(form.fields)
      };

      return NextResponse.json({
        success: true,
        form: formData
      });
    }

    // Get all forms for authenticated user
    const cookieStore = await cookies();
    let token = cookieStore.get('auth-token')?.value;
    
    if (!token) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

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

    const forms = await prisma.applicationForm.findMany({
      where: { 
        createdBy: userId,
        isActive: true 
      },
      select: {
        id: true,
        title: true,
        description: true,
        jobId: true,
        isActive: true,
        createdAt: true,
        job: {
          select: {
            id: true,
            title: true,
            status: true
          }
        },
        _count: {
          select: {
            applications: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      forms
    });

  } catch (error) {
    console.error('Error fetching application forms:', error);
    return NextResponse.json(
      { error: 'Failed to fetch application forms' },
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
    const { searchParams } = new URL(request.url);
    const formId = searchParams.get('id');

    if (!formId) {
      return NextResponse.json({ error: 'Form ID is required' }, { status: 400 });
    }

    const formData = await request.json();

    // Get user info to check role
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user owns this form or is super admin
    const existingForm = await prisma.applicationForm.findFirst({
      where: { 
        id: parseInt(formId)
      }
    });

    if (!existingForm) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    // Allow update if user owns the form or is super admin
    const canUpdate = existingForm.createdBy === userId || user.role === 'super_admin';

    if (!canUpdate) {
      return NextResponse.json({ error: 'Unauthorized to update this form' }, { status: 403 });
    }

    // Update the form
    const updatedForm = await prisma.applicationForm.update({
      where: { id: parseInt(formId) },
      data: {
        title: formData.title,
        description: formData.description || null,
        fields: JSON.stringify(formData.fields),
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Application form updated successfully',
      form: {
        id: updatedForm.id,
        title: updatedForm.title,
        updatedAt: updatedForm.updatedAt
      }
    });

  } catch (error) {
    console.error('Error updating application form:', error);
    return NextResponse.json(
      { error: 'Failed to update application form' },
      { status: 500 }
    );
  }
}
