import prisma from './prisma';
import crypto from 'crypto';
import { NextResponse } from 'next/server';

/**
 * Validate session token from cookie
 * @param {NextRequest} req
 * @returns {Promise<{user: object, session: object}>} - throws NextResponse on failure
 */
export async function validateSession(req) {
  const cookieToken = req.cookies.get('sessionToken')?.value;

  if (!cookieToken) {
    throw NextResponse.json(
      { success: false, error: 'Unauthorized: No session token.' },
      { status: 401 }
    );
  }

  // Hash token to match DB storage
  const hashedToken = crypto.createHash('sha256').update(cookieToken).digest('hex');

  const session = await prisma.session.findUnique({
    where: { token: hashedToken },
    include: { user: { include: { assignedRole: true } } },
  });

  if (!session || !session.user) {
    throw NextResponse.json(
      { success: false, error: 'Unauthorized: Invalid session.' },
      { status: 401 }
    );
  }

  return { session, user: session.user };
}
