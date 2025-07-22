import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

export async function PATCH(request, { params }) {
  try {
    console.log('📝 Admin Application Update API - PATCH request received');
    const { id: applicationId } = params;
    console.log('📝 Admin Application Update API - Application ID:', applicationId);

    // Get token from cookies or Authorization header
    const cookieStore = cookies();
    const token = cookieStore.get('auth-token')?.value || 
                  cookieStore.get('token')?.value ||
                  request.headers.get('authorization')?.replace('Bearer ', '');

    console.log('📝 Admin Application Update API - Token found:', !!token);

    if (!token) {
      console.log('📝 Admin Application Update API - No token provided');
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('📝 Admin Application Update API - Token decoded successfully, user ID:', decoded.id);
    } catch (error) {
      console.log('📝 Admin Application Update API - Token verification failed:', error.message);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = decoded.id;
    console.log('📝 Admin Application Update API - User ID:', userId);

    // Get user details to check role
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, parentUserId: true }
    });

    if (!user || !['employer_admin', 'super_admin'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
    }

    // Get request body
    const updateData = await request.json();
    console.log('📝 Admin Application Update API - Update data:', updateData);

    // Find the application and verify permissions
    const application = await prisma.jobApplication.findFirst({
      where: { id: applicationId },
      include: {
        job: {
          select: { 
            id: true, 
            title: true,
            postedById: true 
          }
        }
      }
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Check if user has permission to update this application
    if (user.role === 'employer_admin') {
      const baseUserId = user.parentUserId || user.id;
      const hasPermission = application.job.postedById === user.id || 
                           application.job.postedById === baseUserId;
      
      if (!hasPermission) {
        return NextResponse.json({ error: 'Unauthorized to update this application' }, { status: 403 });
      }
    }

    // Update the application
    const updatedApplication = await prisma.jobApplication.update({
      where: { id: applicationId },
      data: {
        status: updateData.status || application.status,
        notes: updateData.notes !== undefined ? updateData.notes : application.notes,
        rating: updateData.rating !== undefined ? updateData.rating : application.rating,
        updatedAt: new Date()
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            company: {
              select: {
                name: true
              }
            }
          }
        },
        applicant: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        }
      }
    });

    console.log('📝 Admin Application Update API - Application updated successfully');

    // Transform the response
    const applicationData = updatedApplication.applicationData ? 
      JSON.parse(updatedApplication.applicationData) : {};

    const response = {
      success: true,
      message: 'Application updated successfully',
      application: {
        id: updatedApplication.id,
        status: updatedApplication.status,
        appliedAt: updatedApplication.appliedAt,
        notes: updatedApplication.notes,
        rating: updatedApplication.rating,
        
        // Job information
        job: {
          id: updatedApplication.job.id,
          title: updatedApplication.job.title,
          company: updatedApplication.job.company?.name || 'Unknown Company'
        },
        
        // Applicant information
        user: {
          id: updatedApplication.applicant?.id,
          fullName: updatedApplication.applicant?.fullName,
          email: updatedApplication.applicant?.email
        },
        
        candidateName: updatedApplication.applicant?.fullName || applicationData.full_name || 'Anonymous',
        candidateEmail: updatedApplication.applicant?.email || applicationData.email || '',
        
        applicationData: applicationData,
        fileData: updatedApplication.fileData ? JSON.parse(updatedApplication.fileData) : {}
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('📝 Admin Application Update API - Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update application',
      details: error.message 
    }, { status: 500 });
  }
}

export async function GET(request, { params }) {
  try {
    console.log('📄 Admin Application Detail API - GET request received');
    const { id: applicationId } = params;
    console.log('📄 Admin Application Detail API - Application ID:', applicationId);

    // Get token from cookies or Authorization header
    const cookieStore = cookies();
    const token = cookieStore.get('auth-token')?.value || 
                  cookieStore.get('token')?.value ||
                  request.headers.get('authorization')?.replace('Bearer ', '');

    console.log('📄 Admin Application Detail API - Token found:', !!token);

    if (!token) {
      console.log('📄 Admin Application Detail API - No token provided');
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('📄 Admin Application Detail API - Token decoded successfully, user ID:', decoded.id);
    } catch (error) {
      console.log('📄 Admin Application Detail API - Token verification failed:', error.message);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = decoded.id;

    // Get user details to check role
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, parentUserId: true }
    });

    if (!user || !['employer_admin', 'super_admin'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
    }

    // Find the application
    const application = await prisma.jobApplication.findFirst({
      where: { id: applicationId },
      include: {
        job: {
          select: { 
            id: true, 
            title: true,
            postedById: true,
            company: {
              select: {
                name: true
              }
            }
          }
        },
        applicant: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        }
      }
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Check permissions for employer_admin
    if (user.role === 'employer_admin') {
      const baseUserId = user.parentUserId || user.id;
      const hasPermission = application.job.postedById === user.id || 
                           application.job.postedById === baseUserId;
      
      if (!hasPermission) {
        return NextResponse.json({ error: 'Unauthorized to view this application' }, { status: 403 });
      }
    }

    // Transform the response
    const applicationData = application.applicationData ? 
      JSON.parse(application.applicationData) : {};

    const response = {
      success: true,
      application: {
        id: application.id,
        status: application.status,
        appliedAt: application.appliedAt,
        notes: application.notes,
        rating: application.rating,
        
        // Job information
        job: {
          id: application.job.id,
          title: application.job.title,
          company: application.job.company?.name || 'Unknown Company'
        },
        
        // Applicant information
        user: {
          id: application.applicant?.id,
          fullName: application.applicant?.fullName,
          email: application.applicant?.email
        },
        
        candidateName: application.applicant?.fullName || applicationData.full_name || 'Anonymous',
        candidateEmail: application.applicant?.email || applicationData.email || '',
        
        applicationData: applicationData,
        fileData: application.fileData ? JSON.parse(application.fileData) : {}
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('📄 Admin Application Detail API - Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch application details',
      details: error.message 
    }, { status: 500 });
  }
}
