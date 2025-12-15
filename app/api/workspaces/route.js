import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/utils/db';
import { getUserFromRequest, sanitizeInput } from '@/utils/auth';
import { hasPermission, PERMISSIONS, USER_ROLES } from '@/utils/roleSystem';

export const runtime = 'nodejs';

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '') || `workspace-${Date.now()}`;
}

function requirePermission(user, perm) {
  if (!hasPermission(user, perm)) {
    throw NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
}

async function ensureUniqueSlug(base) {
  let slug = slugify(base);
  let i = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await prisma.workspace.findUnique({ where: { slug } });
    if (!existing) return slug;
    slug = `${slug}-${i++}`;
  }
}

function normalizeWorkspace(ws) {
  return {
    ...ws,
    uniqueUrl: `/workspace/${ws.uniqueUrlToken}`
  };
}

export async function GET(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const canViewAll = hasPermission(user, PERMISSIONS.WORKSPACE.VIEW_ALL) || user.role === USER_ROLES.SUPER_ADMIN || user.role === USER_ROLES.OWNER;

    let workspaces = [];
    if (canViewAll) {
      workspaces = await prisma.workspace.findMany({
        where: { ownerId: user.id },
        orderBy: { createdAt: 'desc' }
      });
    } else if (hasPermission(user, PERMISSIONS.WORKSPACE.VIEW_ASSIGNED)) {
      workspaces = await prisma.workspace.findMany({
        where: { assignedToId: user.id },
        orderBy: { createdAt: 'desc' }
      });
    } else {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ workspaces: workspaces.map(normalizeWorkspace) });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error('[workspace-list] error', error);
    return NextResponse.json({ error: 'Failed to load workspaces' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!(user.role === USER_ROLES.SUPER_ADMIN || hasPermission(user, PERMISSIONS.WORKSPACE.CREATE))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { name } = await request.json();
    const cleanName = sanitizeInput(name);
    if (!cleanName) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

    const slug = await ensureUniqueSlug(cleanName);
    const uniqueUrlToken = crypto.randomUUID().replace(/-/g, '');

    const workspace = await prisma.workspace.create({
      data: {
        name: cleanName,
        slug,
        uniqueUrlToken,
        ownerId: user.id,
        workspaceData: {},
        metadata: { createdBy: user.id }
      }
    });

    return NextResponse.json({ workspace: normalizeWorkspace(workspace) });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error('[workspace-create] error', error);
    return NextResponse.json({ error: 'Failed to create workspace' }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { id, name, assignToUserId, assignRole, wipe } = body;
    if (!id) return NextResponse.json({ error: 'Workspace id required' }, { status: 400 });

    const workspace = await prisma.workspace.findUnique({ where: { id } });
    if (!workspace) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const isOwner = workspace.ownerId === user.id;
    const canManage = isOwner || hasPermission(user, PERMISSIONS.WORKSPACE.ASSIGN) || user.role === USER_ROLES.SUPER_ADMIN;
    if (!canManage) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const updates = {};
    if (name) {
      requirePermission(user, PERMISSIONS.WORKSPACE.RENAME);
      updates.name = sanitizeInput(name);
    }

    if (assignToUserId) {
      requirePermission(user, PERMISSIONS.WORKSPACE.ASSIGN);
      const isReassign = workspace.assignedToId && workspace.assignedToId !== assignToUserId;
      updates.assignedToId = assignToUserId;
      updates.assignedRole = sanitizeInput(assignRole) || null;
      if (isReassign || wipe) {
        updates.workspaceData = {};
        updates.wipedAt = new Date();
      }
    }

    if (wipe && !assignToUserId) {
      requirePermission(user, PERMISSIONS.WORKSPACE.WIPE);
      updates.workspaceData = {};
      updates.wipedAt = new Date();
    }

    const updated = await prisma.workspace.update({ where: { id }, data: updates });
    return NextResponse.json({ workspace: normalizeWorkspace(updated) });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error('[workspace-update] error', error);
    return NextResponse.json({ error: 'Failed to update workspace' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Workspace id required' }, { status: 400 });

    const workspace = await prisma.workspace.findUnique({ where: { id } });
    if (!workspace) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const canDelete = workspace.ownerId === user.id || hasPermission(user, PERMISSIONS.WORKSPACE.DELETE) || user.role === USER_ROLES.SUPER_ADMIN;
    if (!canDelete) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await prisma.workspace.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error('[workspace-delete] error', error);
    return NextResponse.json({ error: 'Failed to delete workspace' }, { status: 500 });
  }
}