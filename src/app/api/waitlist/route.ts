import {
  sendWaitlistNotificationEmail,
  sendWaitlistWelcomeEmail,
} from "@/lib/email";
import { getCollection } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const emailSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = emailSchema.parse(body);

    // Get the waitlist collection
    const collection = await getCollection("waitlist");

    // Check if email already exists
    const existing = await collection.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { message: "Email already in waitlist" },
        { status: 400 }
      );
    }

    // Insert email
    await collection.insertOne({ email, createdAt: new Date() });

    // Send emails - continue even if one fails
    try {
      await sendWaitlistWelcomeEmail(email);
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
      // Don't fail the request if welcome email fails
    }

    try {
      await sendWaitlistNotificationEmail(email);
    } catch (emailError) {
      console.error("Failed to send notification email:", emailError);
      // Don't fail the request if notification email fails
    }

    return NextResponse.json({ message: "Successfully joined waitlist" });
  } catch (error) {
    console.error("Waitlist signup error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { message: "Internal server error", error: errorMessage },
      { status: 500 }
    );
  }
}
