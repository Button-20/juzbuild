import { sendPasswordResetEmail } from "@/lib/email";
import { getCollection } from "@/lib/mongodb";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    const usersCollection = await getCollection("users");

    // Check if user exists
    const user = await usersCollection.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json(
        {
          message:
            "If an account with this email exists, a password reset link has been sent.",
        },
        { status: 200 }
      );
    }

    // Generate reset token (expires in 24 hours)
    const resetToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: "24h" }
    );

    // Create reset URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://juzbuild.com";
    const resetUrl = `${baseUrl}/auth/reset-password?token=${resetToken}`;

    // Send password reset email
    try {
      // Check if email configuration is available
      if (
        !process.env.EMAIL_HOST ||
        !process.env.EMAIL_USER ||
        !process.env.EMAIL_PASS
      ) {
        console.error(
          "Email configuration missing - EMAIL_HOST, EMAIL_USER, and EMAIL_PASS must be set"
        );
        // Still return success for security, but log the error
      } else {
        await sendPasswordResetEmail({
          email: user.email,
          resetUrl,
        });
      }
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      // Don't fail the request if email sending fails - still return success for security
      // In production, you might want to log this to an error tracking service
      // like Sentry or LogRocket for monitoring email delivery issues
    }

    return NextResponse.json(
      {
        message:
          "If an account with this email exists, a password reset link has been sent.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot password error:", error);

    // Check if it's an email configuration error
    if (error instanceof Error && error.message.includes("socket")) {
      console.error(
        "Email configuration issue - check EMAIL_HOST, EMAIL_USER, EMAIL_PASS environment variables"
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
