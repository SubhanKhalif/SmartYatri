import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

function mapRole(r) {
  return {
    id: r.id,
    name: r.name,
    isDefault: r.isDefault ?? false,
    permissions: (r.rolePermissions || []).map(p => p.permission.code),
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    assignedCount: r._count?.userLogins ?? 0,
  };
}

export async function GET(req) {
  try {
    const url = req?.nextUrl || (typeof req === 'object' && 'url' in req ? new URL(req.url, 'http://localhost') : null);
    let type = null;
    if (url) {
      type = url.searchParams.get('type');
    }
    const where = type ? { type } : {};
    const roles = await prisma.Role.findMany({
      where,
      include: {
        rolePermissions: { include: { permission: true } },
        _count: { select: { userLogins: true } },
      },
      orderBy: { id: 'asc' },
    });
    return NextResponse.json({ success: true, roles: roles.map(r => ({ ...mapRole(r), type: r.type })) });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const name = (body.name || '').trim();
    const cloneFromId = body.cloneFromId ?? null;
    if (!name) return NextResponse.json({ success: false, error: 'Role name is required' }, { status: 400 });

    let cloneKeys = [];
    if (cloneFromId) {
      const src = await prisma.Role.findUnique({
        where: { id: Number(cloneFromId) },
        include: { rolePermissions: { include: { permission: true } } },
      });
      if (!src) return NextResponse.json({ success: false, error: 'Source role not found' }, { status: 404 });
      cloneKeys = (src.rolePermissions || []).map(p => p.permission.code);
    }
    const perms = await prisma.PermissionCatalog.findMany({ where: { code: { in: cloneKeys }, active: true } });

    const role = await prisma.Role.create({
      data: {
        name,
        isDefault: false,
        rolePermissions: {
          create: perms.map(pi => ({ permissionId: pi.id })),
        },
      },
      include: {
        rolePermissions: { include: { permission: true } },
        _count: { select: { userLogins: true } },
      },
    });

    return NextResponse.json({ success: true, role: mapRole(role) }, { status: 201 });
  } catch (e) {
    const status = e.code === 'P2002' ? 409 : 500;
    const error = e.code === 'P2002' ? 'Role name must be unique' : e.message;
    return NextResponse.json({ success: false, error }, { status });
  }
}