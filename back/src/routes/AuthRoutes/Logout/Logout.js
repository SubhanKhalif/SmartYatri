import prisma from '../../../lib/prisma.js';
import crypto from 'crypto';

export async function logoutHandler(req, res) {
  try {
    // Get session token from cookie or Authorization header
    let rawToken = req.cookies?.sessionToken;
    
    // If no cookie, check Authorization header (Bearer token)
    if (!rawToken) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        rawToken = authHeader.substring(7); // Remove 'Bearer ' prefix
      }
    }

    // eslint-disable-next-line no-undef
    const isProduction = process.env.NODE_ENV === 'production';

    if (!rawToken) {
      // No session token, but logout should still clear cookie
      res.clearCookie('sessionToken', {
        httpOnly: true,
        path: '/',
        sameSite: 'lax',
        secure: isProduction,
      });
      return res.json({ success: true, message: 'Logged out.' });
    }

    // Hash token to match DB storage
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    // Delete session from DB
    await prisma.session.deleteMany({
      where: { token: hashedToken }
    });

    // Clear the cookie
    res.clearCookie('sessionToken', {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secure: isProduction,
    });

    return res.json({ success: true, message: 'Logged out.' });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message || 'Logout failed.'
    });
  }
}
