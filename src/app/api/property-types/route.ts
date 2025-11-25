import { toObjectId, verifyToken } from "@/lib/auth";
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

    const { searchParams } = new URL(request.url);
    const userId = decoded.userId;

    // Get website ID from query params (from website switcher)
    const websiteId = searchParams.get("websiteId");
    let userDomain = searchParams.get("domain");
    let websiteDatabaseName = null;

    if (websiteId) {
      // Get the specific website's database name
      const websitesCollection = await getCollection("websites");
      const { ObjectId } = require("mongodb");
      const website = await websitesCollection.findOne({
        _id: new ObjectId(websiteId),
        userId: toObjectId(userId),
      });

      if (website) {
        userDomain = website.domain;
        websiteDatabaseName = website.dbName;
      }
    }

    // Fallback to user's profile domain if no specific website selected
    if (!userDomain) {
      const usersCollection = await getCollection("users");
      const user = await usersCollection.findOne({ _id: toObjectId(userId) });
      if (user && user.domainName) {
        userDomain = user.domainName + ".juzbuild.com";
        // Generate database name from user's domain
        const websiteName = user.domainName
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "");
        websiteDatabaseName = `juzbuild_${websiteName}`;
      } else {
        // Fallback to email-based domain
        userDomain = decoded.email?.split("@")[0] + ".juzbuild.com";
        const emailPrefix = decoded.email
          ?.split("@")[0]
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "");
        websiteDatabaseName = `juzbuild_${emailPrefix}`;
      }
    }

    // Parse pagination and sorting parameters
    const options = {
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "50"),
      sortBy: searchParams.get("sortBy") || undefined,
      sortDirection:
        (searchParams.get("sortDirection") as "asc" | "desc") || "asc",
      search: searchParams.get("search") || undefined,
    };

    // Get property types from website-specific database
    const { propertyTypes, total } = await PropertyTypeService.findAll(
      userId,
      userDomain,
      websiteDatabaseName,
      options
    );

    return NextResponse.json({
      success: true,
      propertyTypes,
      total,
      page: options.page,
      limit: options.limit,
      totalPages: Math.ceil(total / options.limit),
    });
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
    const { searchParams } = new URL(request.url);
    const websiteId = searchParams.get("websiteId");

    let userDomain = body.domain;
    let websiteDatabaseName = null;

    if (websiteId) {
      // Get the specific website's database name
      const websitesCollection = await getCollection("websites");
      const { ObjectId } = require("mongodb");
      const website = await websitesCollection.findOne({
        _id: new ObjectId(websiteId),
        userId: toObjectId(userId),
      });

      if (website) {
        userDomain = website.domain;
        websiteDatabaseName = website.dbName;
      }
    }

    // Fallback to user's profile domain if no specific website selected
    if (!userDomain) {
      const usersCollection = await getCollection("users");
      const user = await usersCollection.findOne({ _id: toObjectId(userId) });
      if (user && user.domainName) {
        userDomain = user.domainName + ".juzbuild.com";
        // Generate database name from user's domain
        const websiteName = user.domainName
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "");
        websiteDatabaseName = `juzbuild_${websiteName}`;
      } else {
        // Fallback to email-based domain
        userDomain = decoded.email?.split("@")[0] + ".juzbuild.com";
        const emailPrefix = decoded.email
          ?.split("@")[0]
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "");
        websiteDatabaseName = `juzbuild_${emailPrefix}`;
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

    if (!userDomain) {
      return NextResponse.json(
        { error: "Domain is required" },
        { status: 400 }
      );
    }

    // Create the property type in the website-specific database
    const collection = websiteDatabaseName
      ? await getCollection("property-types", websiteDatabaseName)
      : await getCollection("property-types");

    const newPropertyType = {
      ...propertyTypeData,
      userId,
      domain: userDomain,
      slug:
        propertyTypeData.slug ||
        propertyTypeData.name.toLowerCase().replace(/[^a-z0-9]/g, "-"),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(newPropertyType);

    if (!result.insertedId) {
      throw new Error("Failed to create property type");
    }

    const propertyType = {
      ...newPropertyType,
      _id: result.insertedId.toString(),
    };

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
