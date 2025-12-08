import prisma from '../../../lib/prisma.js';
import crypto from 'crypto';

export async function logoutHandler(req, res) {
  try {
    // Get session token from cookie
    const cookieToken = req.cookies?.sessionToken;
    
    // eslint-disable-next-line no-undef
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieOptions = {
      httpOnly: true,
      path: '/',
      sameSite: isProduction ? 'none' : 'lax',
      secure: true,
    };

    if (!cookieToken) {
      // No session token, but logout should still clear cookie
      res.clearCookie('sessionToken', cookieOptions);
      return res.json({ success: true, message: 'Logged out.' });
    }

    // Hash token to match DB storage
    const hashedToken = crypto.createHash('sha256').update(cookieToken).digest('hex');

    // Delete session from DB
    await prisma.session.deleteMany({
      where: { token: hashedToken }
    });

    // Clear the cookie
    res.clearCookie('sessionToken', cookieOptions);

    return res.json({ success: true, message: 'Logged out.' });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message || 'Logout failed.'
    });
  }
}
