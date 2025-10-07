import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Property from "@/models/Property";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Get basic property stats
    const totalProperties = await Property.countDocuments();
    const activeProperties = await Property.countDocuments({ isActive: true });
    const featuredProperties = await Property.countDocuments({
      isFeatured: true,
    });
    const soldProperties = await Property.countDocuments({ status: "sold" });

    return NextResponse.json({
      totalProperties,
      activeProperties,
      featuredProperties,
      soldProperties,
    });
  } catch (error) {
    console.error("Stats API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
