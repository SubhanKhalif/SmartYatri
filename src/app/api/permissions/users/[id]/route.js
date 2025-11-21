import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function PATCH(req, { params }) {
  try {
    const id = Number(params.id);
    const body = await req.json();
    const custom = Array.isArray(body.custom) ? body.custom : null;

    const user = await prisma.UserLogin.findUnique({ where: { id } });
    if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });

    if (custom) {
      const perms = await prisma.PermissionCatalog.findMany({
        where: { code: { in: [...new Set(custom.map(String))] }, active: true },
        select: { id: true },
      });
      await prisma.$transaction([
        prisma.UserCustomPermission.deleteMany({ where: { userId: id } }),
        ...perms.map(p => prisma.UserCustomPermission.create({ data: { userId: id, permissionId: p.id } })),
      ]);
    }

    const updated = await prisma.UserLogin.findUnique({
      where: { id },
      include: { assignedRole: true, customPermissions: { include: { permission: true } } },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updated.id,
        username: updated.username,
        email: updated.email,
        roleId: updated.roleId,
        roleName: updated.assignedRole?.name ?? null,
        customPermissions: updated.customPermissions.map(c => c.permission.code),
      },
    });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}