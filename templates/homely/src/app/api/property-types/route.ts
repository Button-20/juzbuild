import { PropertyService, PropertyTypeService } from "@/services";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    // Get all property types
    const { propertyTypes } = await PropertyTypeService.findAll({
      limit: 1000, // Get all property types
    });

    // Get property counts for each type
    const propertyTypesWithCounts = await Promise.all(
      propertyTypes.map(async (type) => {
        const { total } = await PropertyService.findAll({
          propertyType: type._id!.toString(),
          isActive: true,
          limit: 1,
        });
        return {
          ...type,
          _id: type._id!.toString(),
          propertyCount: total,
        };
      })
    );

    return NextResponse.json({
      success: true,
      propertyTypes: propertyTypesWithCounts,
    });
  } catch (error) {
    console.error("Error fetching property types:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch property types" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, icon, image, isActive = true } = body;

    // Validate required fields
    if (!name || !description || !image) {
      return NextResponse.json(
        { error: "Name, description, and image are required" },
        { status: 400 }
      );
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Check if property type with this slug already exists
    const existingPropertyType = await PropertyTypeService.findBySlug(slug);
    if (existingPropertyType) {
      return NextResponse.json(
        { error: "A property type with this name already exists" },
        { status: 400 }
      );
    }

    // Create new property type
    const newPropertyType = await PropertyTypeService.create({
      name,
      slug,
      description,
      icon,
      image,
      isActive,
    });

    return NextResponse.json({
      message: "Property type created successfully",
      propertyType: {
        ...newPropertyType,
        _id: newPropertyType._id!.toString(),
      },
    });
  } catch (error) {
    console.error("Error creating property type:", error);
    return NextResponse.json(
      { error: "Failed to create property type" },
      { status: 500 }
    );
  }
}
