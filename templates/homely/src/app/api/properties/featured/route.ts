import { PropertyService } from "@/services";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Fetch featured properties
    const featuredProperties = await PropertyService.findFeatured(1);

    if (!featuredProperties || featuredProperties.length === 0) {
      return NextResponse.json({
        property: null,
        message: "No featured property found",
      });
    }

    const featuredProperty = featuredProperties[0];

    // Transform the data
    const transformedProperty = {
      ...featuredProperty,
      _id: featuredProperty._id?.toString(),
    };

    return NextResponse.json({
      property: transformedProperty,
    });
  } catch (error) {
    console.error("Featured property GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
