import { getCollection } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

// Sample themes for initial setup
const sampleThemes = [
  {
    name: "Homely",
    description:
      "Warm and inviting theme perfect for residential real estate agents focusing on homes and family-friendly properties.",
    previewImage: "/themes/homely.png",
    thumbnailImage: "/themes/homely.png",
    category: "classic",
    features: [
      "Family-Friendly Design",
      "Neighborhood Focus",
      "Home Showcases",
      "Community Feel",
    ],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export async function POST(request: NextRequest) {
  try {
    // This is for admin setup - in production, add authentication
    const themesCollection = await getCollection("themes");

    // Clear existing themes first
    await themesCollection.deleteMany({});

    // Insert sample themes (now only Homely)
    const result = await themesCollection.insertMany(sampleThemes);

    return NextResponse.json({
      message: `Sample themes created successfully (${
        sampleThemes.length
      } theme${sampleThemes.length > 1 ? "s" : ""})`,
      insertedCount: result.insertedCount,
      themes: result.insertedIds,
    });
  } catch (error) {
    console.error("Error creating sample themes:", error);
    return NextResponse.json(
      { message: "Failed to create sample themes" },
      { status: 500 }
    );
  }
}
