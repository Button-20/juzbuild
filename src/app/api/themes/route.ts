import { getCollection } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Get themes collection
    const themesCollection = await getCollection("themes");

    // Fetch only active themes, sorted by name
    const themes = await themesCollection
      .find({ isActive: true })
      .sort({ category: 1, name: 1 })
      .toArray();

    // Transform themes to include only necessary data for frontend
    const transformedThemes = themes.map((theme: any) => ({
      id: theme._id.toString(),
      name: theme.name,
      description: theme.description,
      previewImage: theme.previewImage,
      thumbnailImage: theme.thumbnailImage,
      category: theme.category,
      features: theme.features || [],
    }));

    return NextResponse.json({
      themes: transformedThemes,
      count: transformedThemes.length,
    });
  } catch (error) {
    console.error("Error fetching themes:", error);
    return NextResponse.json(
      { message: "Failed to fetch themes" },
      { status: 500 }
    );
  }
}
