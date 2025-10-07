import connectDB from "@/lib/mongodb";
import Property from "@/models/Property";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Get session (you might want to implement proper session checking)
    // const session = await getServerSession();
    // if (!session || session.user.role !== 'admin') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    await connectDB();

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalProperties,
      activeProperties,
      featuredProperties,
      recentProperties,
    ] = await Promise.all([
      Property.countDocuments(),
      Property.countDocuments({ isActive: true }),
      Property.countDocuments({ isFeatured: true }),
      Property.countDocuments({
        createdAt: { $gte: thirtyDaysAgo },
      }),
    ]);

    return NextResponse.json({
      totalProperties,
      activeProperties,
      featuredProperties,
      recentProperties,
    });
  } catch (error) {
    console.error("Stats API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
