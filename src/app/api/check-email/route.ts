import { getCollection } from "@/lib";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const emailSchema = z.object({
  email: z.string().email("Valid email is required"),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { message: "Email parameter is required" },
        { status: 400 }
      );
    }

    // Validate email format
    const validation = emailSchema.safeParse({ email });
    if (!validation.success) {
      return NextResponse.json(
        { message: "Invalid email format", exists: false },
        { status: 400 }
      );
    }

    // Check if email exists in users collection
    const usersCollection = await getCollection("users");
    const existingUser = await usersCollection.findOne({
      email: email.toLowerCase(),
    });

    return NextResponse.json({
      exists: !!existingUser,
      message: existingUser ? "Email already registered" : "Email available",
    });
  } catch (error) {
    console.error("Email check error:", error);
    return NextResponse.json(
      { message: "Internal server error", exists: false },
      { status: 500 }
    );
  }
}
