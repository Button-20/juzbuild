import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { message: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    
    // Check if email already exists
    const existingEntry = await db.collection("waitlist").findOne({ email });
    
    if (existingEntry) {
      return NextResponse.json(
        { message: "This email is already on our list!" },
        { status: 400 }
      );
    }

    // Add email to waitlist
    await db.collection("waitlist").insertOne({
      email,
      createdAt: new Date(),
    });

    return NextResponse.json(
      { message: "Successfully added to waitlist!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Waitlist error:", error);
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
