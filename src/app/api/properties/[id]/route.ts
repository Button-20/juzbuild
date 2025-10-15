import { verifyToken } from "@/lib/auth";
import { PropertyService } from "@/lib/services";
import { propertySchema } from "@/types/properties";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
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

    const userId = decoded.userId;
    const resolvedParams = await params;
    const propertyId = resolvedParams.id;
    const { searchParams } = new URL(request.url);

    // Get website ID from query parameters (from website switcher)
    const websiteId = searchParams.get("websiteId");
    let websiteDatabaseName = null;

    if (websiteId) {
      // Get the specific website's database name
      const { getCollection } = await import("@/lib/mongodb");
      const { ObjectId } = require("mongodb");
      const sitesCollection = await getCollection("sites");
      const website = await sitesCollection.findOne({
        _id: new ObjectId(websiteId),
        userId: userId,
      });

      if (website) {
        websiteDatabaseName = website.dbName;
      }
    }

    // Get the property
    const property = await PropertyService.findById(propertyId, userId, websiteDatabaseName);

    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(property);
  } catch (error) {
    console.error("Error fetching property:", error);
    return NextResponse.json(
      { error: "Failed to fetch property" },
      { status: 500 }
    );
  }
}

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

    const userId = decoded.userId;
    const resolvedParams = await params;
    const propertyId = resolvedParams.id;
    const body = await request.json();
    const { searchParams } = new URL(request.url);

    // Get website ID from query parameters (from website switcher)
    const websiteId = searchParams.get("websiteId");
    let websiteDatabaseName = null;

    if (websiteId) {
      // Get the specific website's database name
      const { getCollection } = await import("@/lib/mongodb");
      const { ObjectId } = require("mongodb");
      const sitesCollection = await getCollection("sites");
      const website = await sitesCollection.findOne({
        _id: new ObjectId(websiteId),
        userId: userId,
      });

      if (website) {
        websiteDatabaseName = website.dbName;
      }
    }

    // Validate property data (allow partial updates)
    const propertyData = propertySchema
      .omit({
        _id: true,
        userId: true,
        domain: true,
        createdAt: true,
        updatedAt: true,
      })
      .partial()
      .parse(body);

    // Update the property
    const property = await PropertyService.update(
      propertyId,
      { ...propertyData, _id: propertyId },
      userId,
      websiteDatabaseName
    );

    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(property);
  } catch (error) {
    console.error("Error updating property:", error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Failed to update property" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const userId = decoded.userId;
    const propertyId = params.id;

    // Delete the property
    const success = await PropertyService.delete(propertyId, userId);

    if (!success) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Property deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting property:", error);
    return NextResponse.json(
      { error: "Failed to delete property" },
      { status: 500 }
    );
  }
}
