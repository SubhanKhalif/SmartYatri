import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

// Unified list of locations for filtering users
export async function GET() {
  try {
    const [warehouses, stores] = await Promise.all([
      prisma.Warehouse.findMany({ select: { id: true, name: true }, orderBy: { id: 'asc' } }),
      prisma.Store.findMany({ select: { id: true, name: true }, orderBy: { id: 'asc' } }),
    ]);
    const locations = [
      ...warehouses.map(w => ({ id: `w:${w.id}`, type: 'warehouse', refId: w.id, name: w.name })),
      ...stores.map(s => ({ id: `s:${s.id}`, type: 'store', refId: s.id, name: s.name })),
    ];
    return NextResponse.json({ success: true, locations });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}