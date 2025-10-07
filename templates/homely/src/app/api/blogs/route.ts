import { BlogService } from "@/services/BlogService";
import { NextRequest, NextResponse } from "next/server";

// GET /api/blogs - Get all published blogs with pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const tag = searchParams.get("tag");
    const search = searchParams.get("search");
    const featured = searchParams.get("featured");

    const skip = (page - 1) * limit;

    // Build filters
    const filters: any = { isPublished: true };

    if (tag) {
      filters.tags = [tag.toLowerCase()];
    }

    if (search) {
      filters.search = search; // We'll handle this in the service
    }

    // Get blogs
    const { blogs, total } = await BlogService.findAll({
      ...filters,
      skip,
      limit,
    });

    // Transform blogs to exclude full content for list view
    const transformedBlogs = blogs.map((blog) => ({
      _id: blog._id!.toString(),
      title: blog.title,
      slug: blog.slug,
      excerpt: blog.excerpt,
      coverImage: blog.coverImage,
      author: blog.author,
      authorImage: blog.authorImage,
      tags: blog.tags,
      isPublished: blog.isPublished,
      publishedAt: blog.publishedAt,
      readTime: blog.readTime,
      views: blog.views,
      createdAt: blog.createdAt,
      updatedAt: blog.updatedAt,
    }));

    const response = {
      blogs: transformedBlogs,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit,
      },
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Blog fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch blogs" },
      { status: 500 }
    );
  }
}
