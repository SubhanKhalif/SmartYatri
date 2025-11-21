import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET all active permissions (catalog)
export async function GET(req) {
  try {
    const url = req?.nextUrl || (typeof req === 'object' && 'url' in req ? new URL(req.url, 'http://localhost') : null);
    let type = null;
    if (url) {
      type = url.searchParams.get('type');
    }
    const where = { active: true };
    if (type) where.type = type;
    const items = await prisma.PermissionCatalog.findMany({
      where,
      orderBy: [{ category: 'asc' }, { title: 'asc' }],
    });
    return NextResponse.json({
      success: true,
      permissions: items.map(i => ({
        key: i.code,
        title: i.title,
        category: i.category,
        route: i.route,
        active: i.active,
        type: i.type,
      })),
    });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

// Optional: seed/update catalog in bulk
export async function POST(req) {
  try {
    const { permissions } = await req.json(); // [{ key|code, title, category, route, active? }]
    if (!Array.isArray(permissions)) {
      return NextResponse.json({ success: false, error: 'permissions must be an array' }, { status: 400 });
    }
    const ops = permissions.map(p => prisma.PermissionCatalog.upsert({
      where: { code: p.code ?? p.key },
      update: {
        title: p.title, category: p.category, route: p.route, active: p.active ?? true,
      },
      create: {
        code: p.code ?? p.key, title: p.title, category: p.category, route: p.route, active: p.active ?? true,
      },
    }));
    await prisma.$transaction(ops);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}