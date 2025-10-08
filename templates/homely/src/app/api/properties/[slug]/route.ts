import { PropertyService } from "@/services";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { error: "Property slug is required" },
        { status: 400 }
      );
    }

    // Find the property by slug
    const property = await PropertyService.findBySlug(slug);

    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    // Transform the data to match the expected format
    const transformedProperty = {
      ...property,
      _id: property._id?.toString(),
    };

    return NextResponse.json(transformedProperty);
  } catch (error) {
    console.error("Error fetching property:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
