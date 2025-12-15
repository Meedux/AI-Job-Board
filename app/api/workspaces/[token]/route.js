import { NextResponse } from 'next/server';
import { prisma } from '@/utils/db';

export const runtime = 'nodejs';

function normalizeWorkspace(ws) {
  return {
    id: ws.id,
    name: ws.name,
    slug: ws.slug,
    assignedRole: ws.assignedRole,
    allowDownload: ws.assignedRole === 'vendor' || ws.assignedRole === 'client',
    wipedAt: ws.wipedAt,
    updatedAt: ws.updatedAt,
    createdAt: ws.createdAt
  };
}

export async function GET(_request, { params }) {
  try {
    const token = params?.token;
    if (!token) return NextResponse.json({ error: 'Token missing' }, { status: 400 });

    const workspace = await prisma.workspace.findUnique({ where: { uniqueUrlToken: token } });
    if (!workspace) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Only vendor/client isolation via token is allowed
    if (!(workspace.assignedRole === 'vendor' || workspace.assignedRole === 'client')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ workspace: normalizeWorkspace(workspace) });
  } catch (error) {
    console.error('[workspace-token] error', error);
    return NextResponse.json({ error: 'Failed to load workspace' }, { status: 500 });
  }
}
