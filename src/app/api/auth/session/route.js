import { NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth';

export async function GET(req) {
  try {
    // Use shared auth logic
    const { user, session } = await validateSession(req);

    // Optionally update lastUsed timestamp
    await session &&
      session.id &&
      session.lastUsed &&
      session.lastUsed instanceof Date &&
      session.lastUsed.getTime() !== new Date().getTime() &&
      (await import('@/lib/prisma')).default.session.update({
        where: { id: session.id },
        data: { lastUsed: new Date() }
      });

    const userInfo = {
      id: user.id,
      username: user.username,
      roleId: user.roleId ?? null,
      roleName: user.assignedRole ? user.assignedRole.name : null,
      loginType: user.loginType,
      warehouseId: user.warehouseId,
      warehouseName: user.warehouse ? user.warehouse.name : undefined,
      storeId: user.storeId,
      storeName: user.store ? user.store.name : undefined,
      lastLogin: user.lastLogin,
    };

    return NextResponse.json({ user: userInfo });

  } catch (err) {
    // If validateSession throws a NextResponse, just return it
    if (err instanceof NextResponse) return err;
    return NextResponse.json({ user: null, error: err.message || 'Failed to get session.' }, { status: 500 });
  }
}
