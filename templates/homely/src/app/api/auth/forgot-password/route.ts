import { UserService } from "@/services/UserService";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await UserService.findByEmail(email);
    if (!user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json({
        success: true,
        message:
          "If an account with that email exists, we've sent you a reset link.",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour

    // Save token to user
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    await UserService.setPasswordResetToken(
      user._id!.toString(),
      hashedToken,
      new Date(resetTokenExpiry)
    );

    // Create reset URL
    const resetURL = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`;

    // Send email
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      to: user.email,
      from: process.env.CONTACT_EMAIL_FROM,
      subject: "Password Reset Request",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Password Reset</title>
          <style>
            .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
            .header { background: #3b82f6; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px; }
            .button { 
              display: inline-block; 
              background: #3b82f6; 
              color: white !important; 
              padding: 12px 24px; 
              text-decoration: none; 
              border-radius: 5px;
              margin: 20px 0;
            }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <p>Hello ${user.name},</p>
              <p>You requested a password reset for your account. Click the button below to reset your password:</p>
              <a href="${resetURL}" class="button">Reset Password</a>
              <p>This link will expire in 1 hour.</p>
              <p>If you didn't request this reset, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Real Estate Agency. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({
      success: true,
      message:
        "If an account with that email exists, we've sent you a reset link.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
