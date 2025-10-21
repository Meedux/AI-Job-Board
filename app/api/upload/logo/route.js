import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getUserFromRequest } from '@/utils/auth';
import { put } from '@vercel/blob';
import { prisma } from '@/utils/db';

export async function POST(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only allow employers and admins
    if (!['employer_admin', 'employer_staff', 'super_admin'].includes(user.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('logo');
    const userId = formData.get('userId');

    if (!file || !userId) {
      return NextResponse.json({
        error: 'Logo file and user ID are required'
      }, { status: 400 });
    }

    // Validate file type (images only)
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({
        error: 'Only image files are allowed'
      }, { status: 400 });
    }

    // Validate file size (5MB limit for logos)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({
        error: 'File size must be less than 5MB'
      }, { status: 400 });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `logo_${userId}_${timestamp}.${fileExtension}`;

    // Upload to Vercel Blob
    const blob = await put(fileName, file, {
      access: 'public',
      contentType: file.type,
    });

    // Find or create company for the user
    let company = await prisma.company.findFirst({
      where: { createdById: userId }
    });

    if (company) {
      // Update existing company logo
      await prisma.company.update({
        where: { id: company.id },
        data: {
          logoUrl: blob.url,
          updatedAt: new Date()
        }
      });
    } else {
      // Create new company with logo
      company = await prisma.company.create({
        data: {
          name: `${user.fullName || user.email}'s Company`,
          logoUrl: blob.url,
          createdById: userId
        }
      });
    }

    return NextResponse.json({
      success: true,
      logoUrl: blob.url,
      fileName: file.name,
      blobUrl: blob.url,
      companyId: company.id,
      message: 'Logo uploaded successfully'
    });

  } catch (error) {
    console.error('Logo upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload logo' },
      { status: 500 }
    );
  }
}