import connectDB from "@/lib/mongodb";
import Property from "@/models/Property";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    console.log("Testing MongoDB connection...");
    await connectDB();
    console.log("MongoDB connected successfully");

    console.log("Testing Property model with population...");
    const properties = await Property.find()
      .populate("propertyType", "name slug")
      .limit(3)
      .lean();
    console.log(
      `Found ${properties.length} properties with populated propertyType`
    );
    console.log("Sample property:", JSON.stringify(properties[0], null, 2));

    return NextResponse.json({
      message: "Population working",
      count: properties.length,
      sampleProperty: properties[0],
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Population API error:", error);
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : "Unknown error"
    );
    return NextResponse.json(
      {
        error: "Population API error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
