import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

/**
 * Login API: Accepts username & password. 
 * - On success: issues session cookie and returns user+role info.
 * - Session is single-use: removes previous sessions.
 * 
 * User fields sourced from Prisma schema:
 *   - id, username, password, email, lastLogin, loginType, roleId, assignedRole, profile, etc.
 *   - Profile and permissions not included in default payload (customize as needed)
 */
export async function POST(req) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username and password are required.' }, 
        { status: 400 }
      );
    }

    // Find user by username
    const user = await prisma.userLogin.findUnique({
      where: { username },
      include: {
        assignedRole: true,   // include the related role
        profile: true,        // include the related profile
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials.' }, 
        { status: 401 }
      );
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials.' }, 
        { status: 401 }
      );
    }

    // Update lastLogin timestamp
    await prisma.userLogin.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    // Clean up previous sessions (allow only one active login)
    await prisma.session.deleteMany({ where: { userId: user.id } });

    // Create secure session token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    await prisma.session.create({
      data: {
        token: tokenHash,
        userId: user.id,
        // Set lastUsed/createdAt/updatedAt use defaults
      }
    });

    // Compose the safe user info to send in response
    const safeUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      loginType: user.loginType,
      roleId: user.roleId,
      role: user.assignedRole
        ? { id: user.assignedRole.id, name: user.assignedRole.name, type: user.assignedRole.type }
        : null,
      profile: user.profile
        ? {
            fullName: user.profile.fullName,
            schoolName: user.profile.schoolName,
            roleType: user.profile.roleType,
            idNumber: user.profile.idNumber,
            classOrPosition: user.profile.classOrPosition,
            photo: user.profile.photo
          }
        : null,
      // Add additional info here if needed (e.g., permissions later)
    };

    // Issue session cookie (secure, httpOnly, 1hr expiry)
    const res = NextResponse.json({
      success: true,
      user: safeUser,
    });
    res.cookies.set('sessionToken', rawToken, {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secure: true,
      maxAge: 60 * 60, // 1 hour
    });

    return res;

  } catch (err) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Login failed.' }, 
      { status: 500 }
    );
  }
}
