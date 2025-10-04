import { getCollection } from "@/lib";
import { sendWaitlistWelcomeEmail, sendWaitlistNotificationEmail } from "@/lib/email";
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

    // Send welcome email to user
    await sendWaitlistWelcomeEmail(email);

    // Send notification email to admin
    await sendWaitlistNotificationEmail(email);

    return NextResponse.json({ message: "Successfully joined waitlist" });
  } catch (error) {
    console.error("Waitlist signup error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
