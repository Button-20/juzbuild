import connectDB from "@/lib/mongodb";
import Property from "@/models/Property";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    // Ensure PropertyType schema is registered
    if (!Property.db.models.PropertyType) {
      await import("@/models/PropertyType");
    }

    const { id } = await params;
    const property = await Property.findById(id).populate(
      "propertyType",
      "name slug"
    );

    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(property);
  } catch (error) {
    console.error("Property GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();

    // Ensure PropertyType schema is registered
    if (!Property.db.models.PropertyType) {
      await import("@/models/PropertyType");
    }

    const body = await request.json();

    // Validate required fields
    const {
      name,
      description,
      location,
      price,
      propertyType,
      status,
      beds,
      baths,
      area,
      images,
      amenities,
      features,
      coordinates,
      isFeatured,
      currency,
    } = body;

    if (
      !name ||
      !description ||
      !location ||
      price === undefined ||
      !propertyType ||
      !status
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Find the property
    const existingProperty = await Property.findById(id);
    if (!existingProperty) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    // Check if slug already exists (excluding current property)
    const existingSlug = await Property.findOne({
      slug,
      _id: { $ne: id },
    });
    if (existingSlug) {
      return NextResponse.json(
        { error: "Property with this name already exists" },
        { status: 400 }
      );
    }

    const updatedProperty = await Property.findByIdAndUpdate(
      id,
      {
        name,
        slug,
        description,
        location,
        price: parseFloat(price),
        propertyType,
        status,
        beds: parseInt(beds) || 0,
        baths: parseInt(baths) || 0,
        area: parseFloat(area) || 0,
        currency: currency || "GHS",
        images: images || [],
        amenities: amenities || [],
        features: features || [],
        coordinates: coordinates || null,
        isFeatured: Boolean(isFeatured),
        isActive: true,
      },
      { new: true, runValidators: true }
    ).populate("propertyType", "name slug");

    return NextResponse.json({
      message: "Property updated successfully",
      property: updatedProperty,
    });
  } catch (error) {
    console.error("Property PUT error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;
    const property = await Property.findById(id);

    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    await Property.findByIdAndDelete(id);

    return NextResponse.json({
      message: "Property deleted successfully",
    });
  } catch (error) {
    console.error("Property DELETE error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
