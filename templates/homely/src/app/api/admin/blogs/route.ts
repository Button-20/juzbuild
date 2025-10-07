import connectDB from "@/lib/mongodb";
import Blog from "@/models/Blog";
import { NextRequest, NextResponse } from "next/server";

// GET /api/admin/blogs - Get all blogs for admin (including unpublished)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status"); // published, draft, all
    const search = searchParams.get("search");
    const author = searchParams.get("author");
    const sortBy = searchParams.get("sortBy") || "-createdAt";

    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};

    if (status === "published") {
      query.isPublished = true;
    } else if (status === "draft") {
      query.isPublished = false;
    }
    // For 'all' or no status, don't filter by isPublished

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { excerpt: { $regex: search, $options: "i" } },
        { author: { $regex: search, $options: "i" } },
      ];
    }

    if (author) {
      query.author = { $regex: author, $options: "i" };
    }

    // Build sort object
    const sortObject: any = {};

    if (sortBy.startsWith("-")) {
      // Descending order
      const field = sortBy.substring(1);
      sortObject[field] = -1;
    } else {
      // Ascending order
      sortObject[sortBy] = 1;
    }

    // Default fallback sort
    if (!sortObject.createdAt) {
      sortObject.createdAt = -1;
    }

    // Get blogs
    const blogs = await Blog.find(query)
      .sort(sortObject)
      .skip(skip)
      .limit(limit)
      .select("-content") // Exclude full content for list view
      .lean();

    // Get total count for pagination
    const total = await Blog.countDocuments(query);

    // Get statistics
    const stats = {
      total: await Blog.countDocuments(),
      published: await Blog.countDocuments({ isPublished: true }),
      draft: await Blog.countDocuments({ isPublished: false }),
    };

    return NextResponse.json({
      blogs,
      pagination: {
        page: page,
        limit: limit,
        total: total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
        // Legacy support
        current: page,
        pages: Math.ceil(total / limit),
      },
      stats,
    });
  } catch (error: any) {
    console.error("Admin blog fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch blogs" },
      { status: 500 }
    );
  }
}

// POST /api/admin/blogs - Create new blog
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      title,
      slug,
      excerpt,
      content,
      coverImage,
      author,
      authorImage,
      tags,
      isPublished,
    } = body;

    // Validate required fields
    if (!title || !excerpt || !content || !coverImage || !author) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if slug already exists
    if (slug) {
      const existingBlog = await Blog.findOne({ slug });
      if (existingBlog) {
        return NextResponse.json(
          { error: "A blog with this slug already exists" },
          { status: 400 }
        );
      }
    }

    // Create new blog
    const newBlog = new Blog({
      title,
      slug,
      excerpt,
      content,
      coverImage,
      author,
      authorImage,
      tags: tags || [],
      isPublished: isPublished || false,
    });

    const savedBlog = await newBlog.save();

    return NextResponse.json({
      message: "Blog created successfully",
      blog: savedBlog,
    });
  } catch (error: any) {
    console.error("Blog creation error:", error);

    if (error.code === 11000) {
      return NextResponse.json(
        { error: "A blog with this slug already exists" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create blog" },
      { status: 500 }
    );
  }
}
