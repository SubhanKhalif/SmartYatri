import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

// Helper to get session user from cookie
async function getSessionUser(req) {
  const cookie = req.cookies.get('sessionToken');
  if (!cookie) return null;
  const token = cookie.value;
  const hashed = crypto.createHash('sha256').update(token).digest('hex');
  const session = await prisma.session.findUnique({
    where: { token: hashed },
    include: { user: { include: { warehouse: true, store: true } } },
  });
  if (!session || !session.user) return null;
  return session.user;
}

// Helper to send email notification
async function sendPasswordChangeEmail(user, email) {
  if (!email) return;
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  let name = user.username;
  if (user.warehouse?.name) name = user.warehouse.name;
  if (user.store?.name) name = user.store.name;

  const mailOptions = {
    from: `"Warehouse App" <${process.env.EMAIL}>`,
    to: email,
    subject: 'Your password was changed',
    text: `Hello ${name},\n\nYour password was successfully changed. If you did not perform this action, please contact support immediately.\n\nThank you.`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    // Do not throw, just log
    console.error('Failed to send password change email:', err);
  }
}

export async function POST(req) {
  try {
    const { oldPassword, newPassword } = await req.json();

    if (!oldPassword || !newPassword) {
      return NextResponse.json({ error: 'Old and new password are required.' }, { status: 400 });
    }

    // Get current user from session
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
    }

    // Check old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 401 });
    }

    // Optionally: enforce password policy (min length, etc.)
    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'New password must be at least 6 characters.' }, { status: 400 });
    }

    // Hash new password
    const hashed = await bcrypt.hash(newPassword, 10);

    // Update password in DB
    await prisma.userLogin.update({
      where: { id: user.id },
      data: { password: hashed },
    });

    // Invalidate all sessions for this user (force re-login)
    await prisma.session.deleteMany({ where: { userId: user.id } });

    // Try to send notification email if possible
    let email = user.email;
    if (!email && user.warehouse?.email) email = user.warehouse.email;
    if (!email && user.store?.email) email = user.store.email;
    if (email) {
      await sendPasswordChangeEmail(user, email);
    }

    // Return success
    return NextResponse.json({ success: true });

  } catch (err) {
    return NextResponse.json({ error: err.message || 'Failed to change password.' }, { status: 500 });
  }
}
