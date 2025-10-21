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

    if (user.role !== 'job_seeker') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('resume');
    const userId = formData.get('userId');

    if (!file || !userId) {
      return NextResponse.json({
        error: 'Resume file and user ID are required'
      }, { status: 400 });
    }

    // Validate file type
    if (!file.type.includes('pdf') && !file.type.includes('doc') && !file.type.includes('docx')) {
      return NextResponse.json({
        error: 'Only PDF, DOC, and DOCX files are allowed'
      }, { status: 400 });
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({
        error: 'File size must be less than 5MB'
      }, { status: 400 });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `resume_${userId}_${timestamp}.${fileExtension}`;

    // Upload to Vercel Blob
    const blob = await put(fileName, file, {
      access: 'public',
      contentType: file.type,
    });

    // Update user profile with blob URL
    await prisma.user.update({
      where: { id: userId },
      data: {
        resumeUrl: blob.url,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      resumeUrl: blob.url,
      fileName: file.name,
      blobUrl: blob.url,
      message: 'Resume uploaded successfully'
    });

  } catch (error) {
    console.error('Resume upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload resume' },
      { status: 500 }
    );
  }
}