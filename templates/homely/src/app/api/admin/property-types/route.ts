import connectDB from "@/lib/mongodb";
import PropertyType from "@/models/PropertyType";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();

    const propertyTypes = await PropertyType.find().sort({ name: 1 });

    return NextResponse.json({ propertyTypes });
  } catch (error) {
    console.error("Property types GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
