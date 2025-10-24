import { verifyToken } from "@/lib/auth";
import { getCollection } from "@/lib/mongodb";
import { PropertyService } from "@/lib/services";
import { propertyFilterSchema, propertySchema } from "@/types/properties";
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
      const sitesCollection = await getCollection("sites");
      const { ObjectId } = require("mongodb");
      const website = await sitesCollection.findOne({
        _id: new ObjectId(websiteId),
        userId: userId,
      });

      if (website) {
        userDomain = website.domain;
        websiteDatabaseName = website.dbName;
      }
    }

    // Fallback to user's profile domain if no specific website selected
    if (!userDomain) {
      const usersCollection = await getCollection("users");
      const user = await usersCollection.findOne({ _id: userId });
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

    // Parse query parameters
    const filterData = {
      featured: searchParams.get("featured") === "true" ? true : undefined,
      propertyType: searchParams.get("type") || undefined,
      status: searchParams.get("status") || undefined,
      search: searchParams.get("search") || undefined,
      limit: parseInt(searchParams.get("limit") || "10"),
      page: parseInt(searchParams.get("page") || "1"),
      sortBy: searchParams.get("sortBy") || undefined,
      sortDirection:
        (searchParams.get("sortDirection") as "asc" | "desc") || "asc",
      userId,
      domain: userDomain,
      websiteDatabaseName, // Pass the specific website's database name
    };

    // Validate filters
    const validatedFilters = propertyFilterSchema.parse(filterData);

    const { properties, total } = await PropertyService.findAll(
      validatedFilters
    );

    return NextResponse.json({
      properties,
      total,
      page: validatedFilters.page,
      limit: validatedFilters.limit,
      totalPages: Math.ceil(total / validatedFilters.limit),
    });
  } catch (error) {
    console.error("Error fetching properties:", error);
    return NextResponse.json(
      { error: "Failed to fetch properties" },
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

    // Get website ID from query parameters (from website switcher)
    const websiteId = searchParams.get("websiteId");
    let domain = body.domain;
    let websiteDatabaseName = null;

    if (websiteId) {
      // Get the specific website's database name
      const sitesCollection = await getCollection("sites");
      const { ObjectId } = require("mongodb");
      const website = await sitesCollection.findOne({
        _id: new ObjectId(websiteId),
        userId: userId,
      });

      if (website) {
        domain = website.domain;
        websiteDatabaseName = website.dbName;
      }
    }

    // Fallback to user's profile domain if no specific website selected
    if (!domain) {
      const usersCollection = await getCollection("users");
      const user = await usersCollection.findOne({ _id: userId });
      if (user && user.domainName) {
        domain = user.domainName + ".juzbuild.com";
        // Generate database name from user's domain
        const websiteName = user.domainName
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "");
        websiteDatabaseName = `juzbuild_${websiteName}`;
      } else {
        // Fallback to email-based domain
        domain = decoded.email?.split("@")[0] + ".juzbuild.com";
        const emailPrefix = decoded.email
          ?.split("@")[0]
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "");
        websiteDatabaseName = `juzbuild_${emailPrefix}`;
      }
    }

    // Validate property data
    const propertyData = propertySchema
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

    // Create the property
    const property = await PropertyService.create(
      propertyData,
      userId,
      domain,
      websiteDatabaseName
    );

    return NextResponse.json(property, { status: 201 });
  } catch (error) {
    console.error("Error creating property:", error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Failed to create property" },
      { status: 500 }
    );
  }
}
