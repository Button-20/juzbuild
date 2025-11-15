import { verifyToken } from "@/lib/auth";
import { getCollection } from "@/lib/mongodb";
import { TestimonialService } from "@/lib/services";
import { testimonialSchema } from "@/types/properties";
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
      const webwebsitesCollection = await getCollection("websites");
      const { ObjectId } = require("mongodb");
      const website = await webwebsitesCollection.findOne({
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

    // Get pagination and sorting parameters
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const sortBy = searchParams.get("sortBy") || "order";
    const sortDirection = (searchParams.get("sortDirection") || "asc") as
      | "asc"
      | "desc";
    const search = searchParams.get("search") || "";
    const isActive = searchParams.get("isActive");

    // Get testimonials using TestimonialService with pagination and sorting
    const result = await TestimonialService.getTestimonials(
      {
        page,
        limit,
        sortBy,
        sortDirection,
        search,
        isActive: isActive ? isActive === "true" : undefined,
      },
      websiteDatabaseName || undefined
    );

    // Add user and domain info to each testimonial
    const formattedTestimonials = result.testimonials.map(
      (testimonial: any) => ({
        ...testimonial,
        userId: testimonial.userId || userId,
        domain: testimonial.domain || userDomain,
        company: testimonial.company || "",
      })
    );

    return NextResponse.json({
      success: true,
      testimonials: formattedTestimonials,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    });
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    return NextResponse.json(
      { error: "Failed to fetch testimonials" },
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
      const webwebsitesCollection = await getCollection("websites");
      const { ObjectId } = require("mongodb");
      const website = await webwebsitesCollection.findOne({
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

    // Validate testimonial data
    const testimonialData = testimonialSchema
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

    // Create the testimonial in the website-specific database
    const collection = websiteDatabaseName
      ? await getCollection("testimonials", websiteDatabaseName)
      : await getCollection("testimonials");

    const newTestimonial = {
      ...testimonialData,
      userId,
      domain: userDomain,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(newTestimonial);

    if (!result.insertedId) {
      throw new Error("Failed to create testimonial");
    }

    const testimonial = {
      ...newTestimonial,
      _id: result.insertedId.toString(),
    };

    return NextResponse.json(testimonial, { status: 201 });
  } catch (error) {
    console.error("Error creating testimonial:", error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Failed to create testimonial" },
      { status: 500 }
    );
  }
}
