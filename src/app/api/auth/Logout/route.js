import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(req) {
  try {
    // Get session token from cookie
    const cookieToken = req.cookies.get('sessionToken')?.value;

    if (!cookieToken) {
      // No session token, but logout should still clear cookie
      const res = NextResponse.json({ success: true, message: 'Logged out.' });
      res.cookies.set('sessionToken', '', {
        httpOnly: true,
        path: '/',
        sameSite: 'lax',
        secure: true,
        maxAge: 0,
      });
      return res;
    }

    // Hash token to match DB storage
    const hashedToken = crypto.createHash('sha256').update(cookieToken).digest('hex');

    // Delete session from DB
    await prisma.session.deleteMany({
      where: { token: hashedToken }
    });

    // Clear the cookie
    const res = NextResponse.json({ success: true, message: 'Logged out.' });
    res.cookies.set('sessionToken', '', {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secure: true,
      maxAge: 0,
    });

    return res;
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message || 'Logout failed.' },
      { status: 500 }
    );
  }
}
