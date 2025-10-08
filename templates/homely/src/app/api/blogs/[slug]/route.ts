import { BlogService } from "@/services/BlogService";
import { NextRequest, NextResponse } from "next/server";

// GET /api/blogs/[slug] - Get a single blog by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const blog = await BlogService.findBySlug(slug);

    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    // Increment views
    await BlogService.incrementViews(blog._id!.toString());

    // Get related blogs (same tags, excluding current blog)
    let relatedBlogs: any[] = [];
    if (blog.tags && blog.tags.length > 0) {
      // Get blogs with same tags
      for (const tag of blog.tags) {
        const tagBlogs = await BlogService.findByTag(tag, 5);
        relatedBlogs.push(
          ...tagBlogs.filter(
            (rb) => rb._id!.toString() !== blog._id!.toString()
          )
        );
      }
      // Remove duplicates and limit to 3
      const uniqueBlogs = relatedBlogs
        .filter(
          (blog, index, self) =>
            index ===
            self.findIndex((b) => b._id!.toString() === blog._id!.toString())
        )
        .slice(0, 3);
      relatedBlogs = uniqueBlogs;
    }

    // Transform blog to exclude content for related blogs
    const transformedRelatedBlogs = relatedBlogs.map((rb) => ({
      _id: rb._id!.toString(),
      title: rb.title,
      slug: rb.slug,
      excerpt: rb.excerpt,
      coverImage: rb.coverImage,
      author: rb.author,
      authorImage: rb.authorImage,
      tags: rb.tags,
      isPublished: rb.isPublished,
      publishedAt: rb.publishedAt,
      readTime: rb.readTime,
      views: rb.views,
      createdAt: rb.createdAt,
      updatedAt: rb.updatedAt,
    }));

    return NextResponse.json({
      blog: {
        _id: blog._id!.toString(),
        ...blog,
      },
      relatedBlogs: transformedRelatedBlogs,
    });
  } catch (error: any) {
    console.error("Blog fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog" },
      { status: 500 }
    );
  }
}
