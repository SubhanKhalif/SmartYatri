import { validateSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

// Normalize a route for consistent comparison
function normalizePath(path) {
  if (!path) return '/';
  let p = path.split('?')[0].replace(/\/+$/, '').toLowerCase();
  if (p === '') p = '/';
  return p.startsWith('/') ? p : '/' + p;
}

export async function GET(req) {
  try {
    // 1️⃣ Validate session
    const { user } = await validateSession(req);

    // 2️⃣ Determine loginType
    let loginType = null;
    if (user.warehouseId && !user.storeId) loginType = 'warehouse';
    else if (user.storeId && !user.warehouseId) loginType = 'store';
    else if (user.storeId && user.warehouseId) loginType = 'store';

    // 3️⃣ Collect permissions from roles + user custom permissions
    const rolePerms = await prisma.rolePermission.findMany({
      where: { roleId: user.roleId },
      include: { permission: true },
    });

    const customPerms = await prisma.userCustomPermission.findMany({
      where: { userId: user.id },
      include: { permission: true },
    });

    const allPerms = [...rolePerms.map(r => r.permission), ...customPerms.map(u => u.permission)]
      .filter(p => !!p && p.active);

    // 4️⃣ Filter by type (warehouse/store/global)
    const allowedRoutes = allPerms
      .filter(p => {
        if (!p.type) return true;
        return p.type.toLowerCase() === loginType;
      })
      .map(p => normalizePath(p.route));

    // 5️⃣ Strict match check
    const url = new URL(req.url);
    const reqPath = normalizePath(url.searchParams.get('path'));
    const hasAccess = allowedRoutes.includes(reqPath);

    // 6️⃣ Safe user data
    const safeUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      roleId: user.roleId,
      warehouseId: user.warehouseId,
      storeId: user.storeId,
    };

    return new Response(
      JSON.stringify({
        success: true,
        user: safeUser,
        loginType,
        allowedRoutes,
        hasAccess,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: 'Unauthorized' }),
      { status: 401 }
    );
  }
}
