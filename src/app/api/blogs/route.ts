import { verifyToken } from "@/lib/auth";
import { getCollection } from "@/lib/mongodb";
import { BlogService } from "@/lib/services";
import { blogSchema } from "@/types/properties";
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

    // Get pagination and sorting parameters
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortDirection = (searchParams.get("sortDirection") || "desc") as
      | "asc"
      | "desc";
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "all";
    const authorId = searchParams.get("authorId") || "";

    // Get blogs using BlogService with pagination and sorting
    const result = await BlogService.getBlogs(
      {
        page,
        limit,
        sortBy,
        sortDirection,
        search,
        status: status as "all" | "published" | "draft",
        authorId: authorId || undefined,
      },
      websiteDatabaseName || undefined
    );

    // Add user and domain info to each blog
    const formattedBlogs = result.blogs.map((blog: any) => ({
      ...blog,
      userId: blog.userId || userId,
      domain: blog.domain || userDomain,
    }));

    return NextResponse.json({
      success: true,
      blogs: formattedBlogs,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return NextResponse.json(
      { error: "Failed to fetch blogs" },
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

    const { searchParams } = new URL(request.url);
    const userId = decoded.userId;

    // Get website ID from query params
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
        const websiteName = user.domainName
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "");
        websiteDatabaseName = `juzbuild_${websiteName}`;
      } else {
        userDomain = decoded.email?.split("@")[0] + ".juzbuild.com";
        const emailPrefix = decoded.email
          ?.split("@")[0]
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "");
        websiteDatabaseName = `juzbuild_${emailPrefix}`;
      }
    }

    const body = await request.json();

    // Calculate read time (rough estimate: 200 words per minute)
    const wordCount = body.content.split(/\s+/).length;
    const readTime = Math.ceil(wordCount / 200);

    // Create blog data with required fields
    const blogData = {
      ...body,
      userId,
      domain: userDomain,
      websiteId,
      readTime,
      views: 0,
      publishedAt: body.isPublished ? new Date() : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Validate the blog data
    const validatedBlog = blogSchema.parse(blogData);

    // Insert into website-specific database
    const collection = websiteDatabaseName
      ? await getCollection("blogs", websiteDatabaseName)
      : await getCollection("blogs");

    const result = await collection.insertOne(validatedBlog);

    return NextResponse.json({
      success: true,
      blog: {
        ...validatedBlog,
        _id: result.insertedId.toString(),
      },
    });
  } catch (error) {
    console.error("Error creating blog:", error);
    return NextResponse.json(
      { error: "Failed to create blog" },
      { status: 500 }
    );
  }
}
