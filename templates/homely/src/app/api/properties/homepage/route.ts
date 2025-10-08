import { PropertyService } from "@/services";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "6");
    const featured = searchParams.get("featured");

    let properties;

    // If featured parameter is specified, get featured properties
    if (featured === "true") {
      properties = await PropertyService.findFeatured(limit);
    } else {
      // Get all properties with limit
      const result = await PropertyService.findAll({
        limit,
        skip: 0,
      });
      properties = result.properties;
    }

    // Transform the data
    const transformedProperties = properties.map((property) => ({
      ...property,
      _id: property._id?.toString(),
    }));

    return NextResponse.json({
      properties: transformedProperties,
      total: transformedProperties.length,
    });
  } catch (error) {
    console.error("Homepage properties GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
