import connectDB from "@/lib/mongodb";
import Property from "@/models/Property";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Ensure PropertyType schema is registered
    if (!Property.db.models.PropertyType) {
      await import("@/models/PropertyType");
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const propertyType = searchParams.get("propertyType") || "";
    const featured = searchParams.get("featured") || "";

    // Build query
    const query: any = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (status) {
      query.status = status;
    }

    if (propertyType) {
      query.propertyType = propertyType;
    }

    if (featured) {
      query.isFeatured = featured === "true";
    }

    const skip = (page - 1) * limit;

    const [properties, total] = await Promise.all([
      Property.find(query)
        .populate("propertyType", "name slug")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Property.countDocuments(query),
    ]);

    return NextResponse.json({
      properties,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit,
      },
    });
  } catch (error) {
    console.error("Properties GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

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
    } = body;

    if (
      !name ||
      !description ||
      !location ||
      !price ||
      !propertyType ||
      !status
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    // Check if slug already exists
    const existingProperty = await Property.findOne({ slug });
    if (existingProperty) {
      return NextResponse.json(
        { error: "Property with this name already exists" },
        { status: 400 }
      );
    }

    const newProperty = new Property({
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
      images: images || [],
      amenities: amenities || [],
      features: features || [],
      coordinates: coordinates || null,
      isFeatured: Boolean(isFeatured),
      isActive: true,
    });

    await newProperty.save();

    return NextResponse.json(
      {
        message: "Property created successfully",
        property: newProperty,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Properties POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
