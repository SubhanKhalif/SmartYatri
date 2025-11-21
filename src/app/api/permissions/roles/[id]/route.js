import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

function toInt(v) { return Number.parseInt(v, 10); }

export async function PATCH(req, { params }) {
  try {
    const id = toInt(params.id);
    const body = await req.json();
    const rename = body.name?.trim();
    const permissions = Array.isArray(body.permissions) ? body.permissions : null;

    const role = await prisma.Role.findUnique({ where: { id } });
    if (!role) return NextResponse.json({ success: false, error: 'Role not found' }, { status: 404 });

    if (permissions && role.name === 'Admin') {
      return NextResponse.json({ success: false, error: 'Admin must retain full access' }, { status: 400 });
    }

    if (rename) {
      await prisma.Role.update({ where: { id }, data: { name: rename } });
    }

    if (permissions) {
      const keys = [...new Set(permissions.map(String))];
      const perms = await prisma.PermissionCatalog.findMany({
        where: { code: { in: keys }, active: true },
        select: { id: true },
      });
      const permIds = perms.map(p => p.id);

      await prisma.$transaction([
        prisma.RolePermission.deleteMany({ where: { roleId: id } }),
        ...permIds.map(pid => prisma.RolePermission.create({ data: { roleId: id, permissionId: pid } })),
      ]);
    }

    const updated = await prisma.Role.findUnique({
      where: { id },
      include: {
        rolePermissions: { include: { permission: true } },
        _count: { select: { userLogins: true } },
      },
    });

    return NextResponse.json({
      success: true,
      role: {
        id: updated.id,
        name: updated.name,
        isDefault: updated.isDefault,
        permissions: (updated.rolePermissions || []).map(p => p.permission.code),
        assignedCount: updated._count.userLogins,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      },
    });
  } catch (e) {
    const status = e.code === 'P2002' ? 409 : 500;
    const error = e.code === 'P2002' ? 'Role name must be unique' : e.message;
    return NextResponse.json({ success: false, error }, { status });
  }
}

export async function DELETE(_req, { params }) {
  try {
    const id = Number(params.id);
    const role = await prisma.Role.findUnique({ where: { id } });
    if (!role) return NextResponse.json({ success: false, error: 'Role not found' }, { status: 404 });
    if (role.isDefault) return NextResponse.json({ success: false, error: 'Cannot delete default role' }, { status: 400 });

    const fallback = await prisma.Role.findFirst({
      where: { id: { not: id }, name: 'Cashier' },
    }) || await prisma.Role.findFirst({
      where: { id: { not: id } },
      orderBy: { id: 'asc' },
    });

    await prisma.UserLogin.updateMany({
      where: { roleId: id },
      data: { roleId: fallback ? fallback.id : null },
    });

    await prisma.Role.delete({ where: { id } });
    return NextResponse.json({ success: true, reassignedToRoleId: fallback?.id ?? null });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}