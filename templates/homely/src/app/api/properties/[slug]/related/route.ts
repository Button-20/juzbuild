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
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "4");

    if (!slug) {
      return NextResponse.json(
        { error: "Property slug is required" },
        { status: 400 }
      );
    }

    // First, get the current property to find its type
    // Ensure PropertyType schema is registered
    if (!Property.db.models.PropertyType) {
      await import("@/models/PropertyType");
    }

    const currentProperty = await Property.findOne({
      slug: slug,
      isActive: true,
    }).lean();

    if (!currentProperty) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    // Find related properties with same property type, excluding current property
    const relatedProperties = await Property.find({
      propertyType: currentProperty.propertyType,
      isActive: true,
      _id: { $ne: currentProperty._id }, // Exclude current property
    })
      .populate("propertyType", "name slug")
      .sort({ isFeatured: -1, createdAt: -1 })
      .limit(limit)
      .lean();

    // Transform the data
    const transformedProperties = relatedProperties.map((property) => ({
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
      images: property.images || [],
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
