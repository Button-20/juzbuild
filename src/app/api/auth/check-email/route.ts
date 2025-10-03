import { getCollection } from "@/lib";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Get users collection
    const usersCollection = await getCollection("users");

    const email = request.nextUrl.searchParams.get("email");
    if (!email) {
      return NextResponse.json(
        { message: "Email query parameter is required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await usersCollection.findOne({ email: email.toLowerCase() });

    return NextResponse.json({
      exists: !!user,
      message: !!user ? "Email is already registered" : "Email is available",
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
