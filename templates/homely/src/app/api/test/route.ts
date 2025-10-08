import { PropertyService } from "@/services";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    console.log("Testing PropertyService...");

    console.log("Testing Property findAll...");
    const { properties, total } = await PropertyService.findAll({
      limit: 3,
      skip: 0,
    });
    console.log(`Found ${properties.length} properties, total: ${total}`);
    console.log("Sample property:", JSON.stringify(properties[0], null, 2));

    return NextResponse.json({
      message: "PropertyService working",
      count: properties.length,
      total,
      sampleProperty: properties[0],
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("PropertyService API error:", error);
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : "Unknown error"
    );
    return NextResponse.json(
      {
        error: "PropertyService API error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
