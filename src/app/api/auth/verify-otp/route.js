import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * POST /api/auth/verify-otp
 * Verifies the OTP sent for password reset using Prisma and PasswordResetOtp.
 *
 * Requirements from schema.prisma:
 *   - Looks up OTP by email + not used + not expired (PasswordResetOtp model)
 *   - Does NOT mark OTP as used here (will be marked used only after password is reset)
 */
export async function POST(req) {
  try {
    const body = await req.json();
    const { email, otp } = body ?? {};

    if (!email || !otp) {
      return NextResponse.json(
        { success: false, message: "Email and OTP are required" },
        { status: 400 }
      );
    }

    // Normalize email to match how it's stored (see forgot-password logic)
    const normalizedEmail = email.trim().toLowerCase();

    // Find the most recent unused and unexpired OTP for this email
    const otpRecord = await prisma.passwordResetOtp.findFirst({
      where: {
        email: normalizedEmail,
        used: false,
        expiresAt: { gt: new Date() }
      },
      orderBy: { createdAt: "desc" },
    });

    if (!otpRecord) {
      return NextResponse.json(
        { success: false, message: "No valid OTP found. It may have expired, been used, or was never requested." },
        { status: 404 }
      );
    }

    // Compare as string (OTP is numeric, usually case-insensitive, but consistent with generator)
    if (!otpRecord.otp || otpRecord.otp !== otp) {
      return NextResponse.json(
        { success: false, message: "Invalid OTP" },
        { status: 400 }
      );
    }

    // Do NOT mark OTP as used here, only confirm it's valid
    return NextResponse.json(
      { success: true, message: "OTP verified successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in verify-otp route:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}
