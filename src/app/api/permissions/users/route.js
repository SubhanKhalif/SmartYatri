import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

function mapUser(u) {
  const stationType = u.storeId ? 'store' : (u.warehouseId ? 'warehouse' : null);
  const stationId = u.storeId ?? u.warehouseId ?? null;
  return {
    id: u.id,
    username: u.username,
    email: u.email,
    roleId: u.roleId,
    roleName: u.assignedRole?.name ?? null,
    customPermissions: u.customPermissions.map(c => c.permission.code),
    stationType,
    stationId,
  };
}

export async function GET() {
  try {
    const users = await prisma.UserLogin.findMany({
      include: {
        assignedRole: true,
        customPermissions: { include: { permission: true } },
      },
      orderBy: { id: 'asc' },
    });
    return NextResponse.json({ success: true, users: users.map(mapUser) });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}