import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { sendContactEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const origin = request.headers.get("origin") || "https://juzbuild.com";
    const token = request.cookies.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    const { name, email, subject, message } = await request.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: "Invalid email address" },
        { status: 400 }
      );
    }

    // Send support email using existing email service
    await sendContactEmail(
      {
        name,
        email,
        subject: `[Support] ${subject} (User ID: ${decoded.userId})`,
        message: `Support request from ${name} (${email})\n\nUser ID: ${decoded.userId}\n\nMessage:\n${message}`,
      },
      origin
    );

    return NextResponse.json({
      success: true,
      message:
        "Your message has been sent successfully. We'll get back to you within 24 hours.",
    });
  } catch (error) {
    console.error("Support contact error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to send message. Please try again or contact us directly.",
      },
      { status: 500 }
    );
  }
}
