import connectDB from "@/lib/mongodb";
import Property from "@/models/Property";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB();

    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { error: "Property slug is required" },
        { status: 400 }
      );
    }

    // Ensure PropertyType schema is registered
    if (!Property.db.models.PropertyType) {
      await import("@/models/PropertyType");
    }

    // Find the property by slug and ensure it's active
    const property = await Property.findOne({
      slug: slug,
      isActive: true,
    })
      .populate("propertyType", "name slug")
      .lean();

    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    // Transform the data to match the expected format
    const transformedProperty = {
      _id: property._id.toString(),
      name: property.name,
      slug: property.slug,
      description: property.description,
      location: property.location,
      price: property.price,
      currency: property.currency,
      propertyType:
        (property.propertyType as any)?.slug || property.propertyType,
      status: property.status,
      beds: property.beds,
      baths: property.baths,
      area: property.area,
      isFeatured: property.isFeatured,
      isActive: property.isActive,
      images: property.images || [],
      features: property.features || [],
      amenities: property.amenities || [],
      coordinates: property.coordinates,
      createdAt: property.createdAt,
      updatedAt: property.updatedAt,
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
