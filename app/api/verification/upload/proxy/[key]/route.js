import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/utils/auth';
import { prisma } from '@/utils/db';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function PUT(request, { params }) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const key = params.key;
    if (!key) return NextResponse.json({ error: 'Missing upload key' }, { status: 400 });

    // Extract document id from the key (prefix before first '-')
    const parts = key.split('-');
    const docId = parts[0];
    if (!docId) return NextResponse.json({ error: 'Invalid key' }, { status: 400 });

    // Read the incoming binary body
    const arrayBuffer = await request.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const MAX_BYTES = 12 * 1024 * 1024; // 12 MB server-side limit
    if (buffer.length > MAX_BYTES) {
      return NextResponse.json({ error: 'File too large' }, { status: 400 });
    }

    // Determine storage strategy: if VERCEL_BLOB_ENDPOINT is configured, forwarding can be implemented here.
    // For now default to local public/uploads storage for development.
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadsDir, { recursive: true });

    // Filename portion after the doc id
    const filename = key.split('-').slice(1).join('-') || key;
    const safeName = filename.replace(/[^a-zA-Z0-9_.-]/g, '_');
    const storedName = `${docId}-${safeName}`;
    const destPath = path.join(uploadsDir, storedName);

    await fs.writeFile(destPath, buffer);

    // Public URL served from /uploads
    const publicUrl = `/uploads/${storedName}`;

    // Update verification document record
    try {
      await prisma.verificationDocument.update({
        where: { id: docId },
        data: { url: publicUrl }
      });
    } catch (e) {
      console.warn('Failed to update verification document record:', e.message);
    }

    return NextResponse.json({ success: true, url: publicUrl });

  } catch (error) {
    console.error('Error proxying upload:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}
