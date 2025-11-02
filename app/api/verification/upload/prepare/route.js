import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/utils/auth';
import { prisma } from '@/utils/db';

// Prepare an upload: validate metadata and create a VerificationDocument row.
export async function POST(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Only allow employer roles to upload verification docs
    if (!['employer_admin', 'employer_staff', 'super_admin'].includes(user.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body = await request.json();
    const { filename, fileType, size, category } = body || {};

    if (!filename || !fileType || !size) {
      return NextResponse.json({ error: 'Missing upload metadata' }, { status: 400 });
    }

    const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg'];

    if (!allowedTypes.includes(fileType)) {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
    }

    if (size > MAX_BYTES) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 });
    }

    // Create a verification document record (url will be set after upload)
    const doc = await prisma.verificationDocument.create({
      data: {
        userId: user.id,
        filename,
        url: '',
        fileType,
        size: parseInt(size, 10),
        category: category || null
      }
    });

    // Use the document id to form a proxy upload key (fallback)
    const safeKey = `${doc.id}-${filename.replace(/[^a-zA-Z0-9_.-]/g, '_')}`;

    // If a Vercel Blob token is configured, attempt to generate a direct upload URL.
    const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN || process.env.VERCEL_BLOB_READ_WRITE_TOKEN;
    const BLOB_API = process.env.VERCEL_BLOB_API_URL || process.env.NEXT_PUBLIC_VERCEL_BLOB_API_URL || 'https://vercel.com/api/blob';

    if (BLOB_TOKEN) {
      try {
        const blobResp = await fetch(BLOB_API, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${BLOB_TOKEN}`
          },
          body: JSON.stringify({
            size: parseInt(size, 10),
            filename,
            contentType: fileType
          })
        });

        if (blobResp.ok) {
          const blobJson = await blobResp.json();
          // Try common response shapes for upload URL and blob URL
          const uploadUrl = blobJson.uploadURL || blobJson.uploadUrl || blobJson.url || blobJson.signedUrl || blobJson.upload_url;
          const blobUrl = blobJson.blobUrl || blobJson.blobURL || blobJson.url || blobJson.publicUrl || blobJson.blob_url;

          if (uploadUrl) {
            // If the blob API returned a stable public URL for the created blob, store it as a placeholder.
            if (blobUrl) {
              try {
                await prisma.verificationDocument.update({ where: { id: doc.id }, data: { url: blobUrl } });
              } catch (e) {
                console.warn('Failed to set blob placeholder URL on verification document:', e.message);
              }
            }

            return NextResponse.json({
              success: true,
              documentId: doc.id,
              uploadUrl,
              uploadMethod: 'PUT',
              direct: true,
              blobUrl: blobUrl || null,
              proxyKey: safeKey
            });
          }
        } else {
          console.warn('Vercel Blob API returned non-OK status when creating upload URL:', await blobResp.text());
        }
      } catch (err) {
        console.warn('Error requesting Vercel Blob upload URL, falling back to proxy:', err.message);
      }
    }

    // Fallback to proxy upload URL
    const uploadUrl = `/api/verification/upload/proxy/${encodeURIComponent(safeKey)}`;

    return NextResponse.json({
      success: true,
      documentId: doc.id,
      uploadUrl,
      uploadMethod: 'PUT',
      direct: false,
      proxyKey: safeKey
    });

  } catch (error) {
    console.error('Error preparing verification upload:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}
