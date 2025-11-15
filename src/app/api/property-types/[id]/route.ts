import { verifyToken } from "@/lib/auth";
import { getCollection } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const PropertyTypeUpdateSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  slug: z.string().min(1, "Slug is required").optional(),
  description: z.string().optional(),
  image: z.string().url().optional().or(z.literal("")),
  icon: z.string().min(1, "Icon is required").optional(),
  isActive: z.boolean().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const token = request.cookies.get("auth-token")?.value;
    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const resolvedParams = await params;
    const body = await request.json();
    const validatedData = PropertyTypeUpdateSchema.parse(body);

    if (!ObjectId.isValid(resolvedParams.id)) {
      return NextResponse.json(
        { error: "Invalid property type ID" },
        { status: 400 }
      );
    }

    // Get website ID from query params to determine which database to use
    const { searchParams } = new URL(request.url);
    const websiteId = searchParams.get("websiteId");
    let websiteDatabaseName: string | undefined = undefined;

    if (websiteId) {
      // Get the specific website's database name
      const webwebsitesCollection = await getCollection("websites");
      const website = await webwebsitesCollection.findOne({
        _id: new ObjectId(websiteId),
        userId: decoded.userId,
      });

      if (website && website.dbName) {
        websiteDatabaseName = website.dbName;
      }
    }

    const propertyTypesCollection = websiteDatabaseName
      ? await getCollection("property-types", websiteDatabaseName)
      : await getCollection("property-types");

    // Check if property type exists
    const existingType = await propertyTypesCollection.findOne({
      _id: new ObjectId(resolvedParams.id),
    });

    if (!existingType) {
      return NextResponse.json(
        { error: "Property type not found" },
        { status: 404 }
      );
    }

    // If updating slug, check for conflicts
    if (validatedData.slug && validatedData.slug !== existingType.slug) {
      const conflictingType = await propertyTypesCollection.findOne({
        slug: validatedData.slug,
        _id: { $ne: new ObjectId(resolvedParams.id) },
      });

      if (conflictingType) {
        return NextResponse.json(
          { error: "A property type with this slug already exists" },
          { status: 400 }
        );
      }
    }

    // Update property type
    const updateData = {
      ...validatedData,
      updatedAt: new Date(),
    };

    const result = await propertyTypesCollection.updateOne(
      { _id: new ObjectId(resolvedParams.id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Property type not found" },
        { status: 404 }
      );
    }

    // Get updated property type
    const updatedPropertyType = await propertyTypesCollection.findOne({
      _id: new ObjectId(resolvedParams.id),
    });

    return NextResponse.json({
      success: true,
      propertyType: {
        ...updatedPropertyType,
        _id: updatedPropertyType!._id.toString(),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 }
      );
    }

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
    // Verify authentication
    const token = request.cookies.get("auth-token")?.value;
    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const resolvedParams = await params;

    if (!ObjectId.isValid(resolvedParams.id)) {
      return NextResponse.json(
        { error: "Invalid property type ID" },
        { status: 400 }
      );
    }

    // Get website ID from query params to determine which database to use
    const { searchParams } = new URL(request.url);
    const websiteId = searchParams.get("websiteId");
    let websiteDatabaseName: string | undefined = undefined;

    if (websiteId) {
      // Get the specific website's database name
      const webwebsitesCollection = await getCollection("websites");
      const website = await webwebsitesCollection.findOne({
        _id: new ObjectId(websiteId),
        userId: decoded.userId,
      });

      if (website && website.dbName) {
        websiteDatabaseName = website.dbName;
      }
    }

    const propertyTypesCollection = websiteDatabaseName
      ? await getCollection("property-types", websiteDatabaseName)
      : await getCollection("property-types");
    const propertiesCollection = websiteDatabaseName
      ? await getCollection("properties", websiteDatabaseName)
      : await getCollection("properties");

    // Check if any properties are using this property type
    const propertiesUsingType = await propertiesCollection.countDocuments({
      propertyType: resolvedParams.id,
    });

    if (propertiesUsingType > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete property type. ${propertiesUsingType} properties are using this type.`,
          canDelete: false,
        },
        { status: 400 }
      );
    }

    // Delete property type
    const result = await propertyTypesCollection.deleteOne({
      _id: new ObjectId(resolvedParams.id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Property type not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
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
