import { prisma }        from "@/lib/db";
import { createSession } from "@/lib/session";
import { NextResponse }  from "next/server";

/**
 * POST /api/auth/verify-code
 *
 * Verifies the 6-digit OTP the user received by email.
 * If the code matches and hasn't expired:
 *   1. Clears the code from the DB (one-time use)
 *   2. Marks the user as verified
 *   3. Writes a session cookie with their email and role
 *   4. Returns the role so the frontend knows where to redirect
 */
export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: "Email and code are required" },
        { status: 400 }
      );
    }

    // Look up the user and check their verification code
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "No account found for this email" },
        { status: 404 }
      );
    }

    // Check code matches
    if (user.verification_code !== code) {
      return NextResponse.json(
        { error: "Incorrect code. Please check your email and try again." },
        { status: 401 }
      );
    }

    // Check code hasn't expired
    if (user.verification_expires && user.verification_expires < new Date()) {
      return NextResponse.json(
        { error: "This code has expired. Please request a new one." },
        { status: 401 }
      );
    }

    // Code is valid — clear it from the DB (one-time use only)
    await prisma.user.update({
      where: { email },
      data: {
        verification_code:    null,
        verification_expires: null,
        is_verified:          true,
      },
    });

    // Write the session cookie — this is what protects the dashboard
    await createSession(email, user.role);

    // Return the role so the auth page knows where to redirect
    return NextResponse.json({ role: user.role });

  } catch (err) {
    console.error("verify-code error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}