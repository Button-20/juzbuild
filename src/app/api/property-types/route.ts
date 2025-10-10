import { verifyToken } from "@/lib/auth";
import { getCollection } from "@/lib/mongodb";
import { PropertyTypeService } from "@/lib/services";
import { propertyTypeSchema } from "@/types/properties";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
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
    const { searchParams } = new URL(request.url);

    // Get user's domain from their profile
    let domain = searchParams.get("domain");
    if (!domain) {
      const usersCollection = await getCollection("users");
      const user = await usersCollection.findOne({ _id: userId });
      if (user && user.domainName) {
        domain = user.domainName + ".juzbuild.com";
      } else {
        // Fallback to email-based domain
        domain = decoded.email?.split("@")[0] + ".juzbuild.com";
      }
    }

    // Seed default property types if none exist
    await PropertyTypeService.seedDefaults();

    // Get property types (includes both global and user-specific)
    const propertyTypes = await PropertyTypeService.findAll(userId, domain);

    return NextResponse.json(propertyTypes);
  } catch (error) {
    console.error("Error fetching property types:", error);
    return NextResponse.json(
      { error: "Failed to fetch property types" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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
    const body = await request.json();

    // Get user's domain from their profile
    let domain = body.domain;
    if (!domain) {
      const usersCollection = await getCollection("users");
      const user = await usersCollection.findOne({ _id: userId });
      if (user && user.domainName) {
        domain = user.domainName + ".juzbuild.com";
      } else {
        // Fallback to email-based domain
        domain = decoded.email?.split("@")[0] + ".juzbuild.com";
      }
    }

    // Validate property type data
    const propertyTypeData = propertyTypeSchema
      .omit({
        _id: true,
        userId: true,
        domain: true,
        createdAt: true,
        updatedAt: true,
      })
      .parse(body);

    if (!domain) {
      return NextResponse.json(
        { error: "Domain is required" },
        { status: 400 }
      );
    }

    // Create the property type
    const propertyType = await PropertyTypeService.create(
      propertyTypeData,
      userId,
      domain
    );

    return NextResponse.json(propertyType, { status: 201 });
  } catch (error) {
    console.error("Error creating property type:", error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Failed to create property type" },
      { status: 500 }
    );
  }
}
