import connectDB from "@/lib/mongodb";
import Blog from "@/models/Blog";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Aggregate unique authors with their images
    const authors = await Blog.aggregate([
      {
        $match: {
          author: { $exists: true, $ne: "" },
        },
      },
      {
        $group: {
          _id: "$author",
          authorImage: { $first: "$authorImage" },
          blogCount: { $sum: 1 },
          lastUsed: { $max: "$createdAt" },
        },
      },
      {
        $project: {
          _id: 0,
          name: "$_id",
          authorImage: 1,
          blogCount: 1,
          lastUsed: 1,
        },
      },
      {
        $sort: { lastUsed: -1 },
      },
    ]);

    return NextResponse.json({
      success: true,
      authors,
    });
  } catch (error) {
    console.error("Error fetching authors:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch authors" },
      { status: 500 }
    );
  }
}
