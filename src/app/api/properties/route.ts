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

    // Get user's domain from their profile
    let userDomain = searchParams.get("domain");
    if (!userDomain) {
      const usersCollection = await getCollection("users");
      const user = await usersCollection.findOne({ _id: userId });
      if (user && user.domainName) {
        userDomain = user.domainName + ".juzbuild.com";
      } else {
        // Fallback to email-based domain
        userDomain = decoded.email?.split("@")[0] + ".juzbuild.com";
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
      userId,
      domain: userDomain,
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
    const property = await PropertyService.create(propertyData, userId, domain);

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
