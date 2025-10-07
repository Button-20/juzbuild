import connectDB from "@/lib/mongodb";
import Blog from "@/models/Blog";
import { NextRequest, NextResponse } from "next/server";

// GET /api/admin/blogs/[id] - Get single blog by ID for editing
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const blog = await Blog.findById(id).lean();

    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    return NextResponse.json(blog);
  } catch (error: any) {
    console.error("Blog fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/blogs/[id] - Update blog
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

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

    // Check if slug already exists (excluding current blog)
    if (slug) {
      const existingBlog = await Blog.findOne({ slug, _id: { $ne: id } });
      if (existingBlog) {
        return NextResponse.json(
          { error: "A blog with this slug already exists" },
          { status: 400 }
        );
      }
    }

    // Update blog
    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      {
        title,
        slug,
        excerpt,
        content,
        coverImage,
        author,
        authorImage,
        tags: tags || [],
        isPublished: isPublished || false,
      },
      { new: true, runValidators: true }
    );

    if (!updatedBlog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Blog updated successfully",
      blog: updatedBlog,
    });
  } catch (error: any) {
    console.error("Blog update error:", error);

    if (error.code === 11000) {
      return NextResponse.json(
        { error: "A blog with this slug already exists" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update blog" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/blogs/[id] - Delete blog
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const deletedBlog = await Blog.findByIdAndDelete(id);

    if (!deletedBlog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Blog deleted successfully",
    });
  } catch (error: any) {
    console.error("Blog deletion error:", error);
    return NextResponse.json(
      { error: "Failed to delete blog" },
      { status: 500 }
    );
  }
}
