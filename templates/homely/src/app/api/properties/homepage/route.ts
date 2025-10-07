import connectDB from "@/lib/mongodb";
import Property from "@/models/Property";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "6");
    const featured = searchParams.get("featured");

    // Build query
    const query: any = {};

    // Ensure PropertyType schema is registered
    if (!Property.db.models.PropertyType) {
      await import("@/models/PropertyType");
    }

    // If featured parameter is specified, filter by featured properties
    if (featured === "true") {
      query.isFeatured = true;
    }

    // Fetch properties for homepage
    const properties = await Property.find(query)
      .populate("propertyType", "name slug")
      .sort({ createdAt: -1 })
      .limit(limit)
      .select(
        "name description location price currency propertyType beds baths area images slug isFeatured"
      )
      .lean();

    // Transform the data to ensure propertyType is a slug string
    const transformedProperties = properties.map((property) => ({
      ...property,
      _id: property._id.toString(),
      propertyType:
        (property.propertyType as any)?.slug || property.propertyType,
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
