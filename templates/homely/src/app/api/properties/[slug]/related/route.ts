import connectDB from "@/lib/mongodb";
import { PropertyService } from "@/services";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "4");

    if (!slug) {
      return NextResponse.json(
        { error: "Property slug is required" },
        { status: 400 }
      );
    }

    // First, get the current property to find its type
    const currentProperty = await PropertyService.findBySlug(slug);

    if (!currentProperty) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    // Find related properties with same property type, excluding current property
    const { db } = await connectDB();
    const collection = db.collection("properties");

    const relatedProperties = await collection
      .find({
        propertyType: currentProperty.propertyType,
        isActive: true,
        _id: { $ne: new ObjectId(currentProperty._id?.toString()) }, // Exclude current property
      })
      .sort({ isFeatured: -1, createdAt: -1 })
      .limit(limit)
      .toArray();

    // Transform the data
    const transformedProperties = relatedProperties.map((property) => ({
      ...property,
      _id: property._id.toString(),
    }));

    return NextResponse.json(transformedProperties);
  } catch (error) {
    console.error("Error fetching related properties:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
