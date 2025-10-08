import { PropertyService, PropertyTypeService } from "@/services";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, icon, image, isActive } = body;

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

    // Check if another property type with the same slug exists (excluding current)
    const existingWithSlug = await PropertyTypeService.findBySlug(slug);
    if (existingWithSlug && existingWithSlug._id!.toString() !== id) {
      return NextResponse.json(
        { error: "A property type with this name already exists" },
        { status: 400 }
      );
    }

    const updatedPropertyType = await PropertyTypeService.update(id, {
      name,
      slug,
      description,
      icon,
      image,
      isActive,
    });

    if (!updatedPropertyType) {
      return NextResponse.json(
        { error: "Property type not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Property type updated successfully",
      propertyType: {
        ...updatedPropertyType,
        _id: updatedPropertyType._id!.toString(),
      },
    });
  } catch (error) {
    console.error("Error updating property type:", error);
    return NextResponse.json(
      { error: "Failed to update property type" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if property type exists
    const propertyType = await PropertyTypeService.findById(id);
    if (!propertyType) {
      return NextResponse.json(
        { error: "Property type not found" },
        { status: 404 }
      );
    }

    // Check if any properties are using this property type
    const { total } = await PropertyService.findAll({
      propertyType: id,
      limit: 1,
    });

    if (total > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete property type. ${total} properties are using this type.`,
        },
        { status: 400 }
      );
    }

    const deleted = await PropertyTypeService.delete(id);

    if (!deleted) {
      return NextResponse.json(
        { error: "Failed to delete property type" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Property type deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting property type:", error);
    return NextResponse.json(
      { error: "Failed to delete property type" },
      { status: 500 }
    );
  }
}
