import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

/**
 * Signup API for user creation.
 *
 * Supports: STUDENT, STAFF, OFFICER, ADMIN, CONDUCTOR, etc. (see loginType).
 * Requires: username, password, email, roleId or roleType.
 * Optionally takes "profile" { fullName, schoolName, roleType, idNumber, classOrPosition }
 * 
 * Does NOT handle warehouse/store users; legacy warehouses are ignored.
 */
export async function POST(req) {
  try {
    const body = await req.json();

    const {
      username,
      password,
      email,
      roleId,
      loginType,
      profile
    } = body;

    // Core validation
    if (
      !username ||
      !password ||
      !loginType ||
      !email
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'Username, password, email, and loginType are required.'
        },
        { status: 400 }
      );
    }

    // Reject if user with this username already exists
    const existingUser = await prisma.userLogin.findUnique({
      where: { username }
    });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Username already exists.' },
        { status: 409 }
      );
    }

    // Reject if user with this email already exists
    if (email) {
      const existingEmail = await prisma.userLogin.findFirst({
        where: { email }
      });
      if (existingEmail) {
        return NextResponse.json(
          { success: false, error: 'Email already exists.' },
          { status: 409 }
        );
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    let roleToConnect = undefined;
    if (roleId) {
      // ensure role exists
      const foundRole = await prisma.role.findUnique({ where: { id: Number(roleId) } });
      if (!foundRole) {
        return NextResponse.json(
          { success: false, error: 'Role not found.' },
          { status: 404 }
        );
      }
      roleToConnect = Number(roleId);
    }

    // Compose user data
    let createUserData = {
      username,
      password: hashedPassword,
      email,
      loginType,
      roleId: roleToConnect ?? undefined,
    };

    // Compose profile create data (optional)
    let createProfileData = null;
    if (profile && typeof profile === 'object') {
      // Enforce profile.fullName if present
      if (!profile.fullName) {
        return NextResponse.json(
          { success: false, error: 'Full name is required in profile.' },
          { status: 400 }
        );
      }
      createProfileData = {
        fullName: profile.fullName,
        schoolName: profile.schoolName ?? null,
        roleType: profile.roleType ?? loginType, // fallback to loginType as roleType
        idNumber: profile.idNumber ?? null,
        classOrPosition: profile.classOrPosition ?? null,
      };
    }

    // Create user + profile (one-to-one)
    let user;
    if (createProfileData) {
      user = await prisma.userLogin.create({
        data: {
          ...createUserData,
          profile: {
            create: createProfileData,
          },
        },
        select: {
          id: true,
          username: true,
          email: true,
          loginType: true,
          roleId: true,
          assignedRole: { select: { id: true, name: true, type: true } },
          profile: true,
        }
      });
    } else {
      user = await prisma.userLogin.create({
        data: createUserData,
        select: {
          id: true,
          username: true,
          email: true,
          loginType: true,
          roleId: true,
          assignedRole: { select: { id: true, name: true, type: true } },
        }
      });
    }

    return NextResponse.json({ success: true, user });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Signup failed.' },
      { status: 500 }
    );
  }
}
