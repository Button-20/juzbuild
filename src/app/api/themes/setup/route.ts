import { getCollection } from "@/lib";
import { NextRequest, NextResponse } from "next/server";

// Sample themes for initial setup
const sampleThemes = [
  {
    name: "Modern Estate",
    description:
      "Clean, contemporary design perfect for luxury real estate with large property showcases and elegant typography.",
    previewImage: "/themes/modern-estate-preview.jpg",
    thumbnailImage: "/themes/modern-estate-thumb.jpg",
    category: "modern",
    features: [
      "Property Gallery",
      "Virtual Tours",
      "Advanced Search",
      "Mobile Optimized",
    ],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "Classic Realty",
    description:
      "Traditional real estate theme with professional layout, perfect for established agencies and corporate brands.",
    previewImage: "/themes/classic-realty-preview.jpg",
    thumbnailImage: "/themes/classic-realty-thumb.jpg",
    category: "classic",
    features: [
      "Agent Profiles",
      "Neighborhood Info",
      "Mortgage Calculator",
      "Contact Forms",
    ],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "Minimal Properties",
    description:
      "Clean, minimalist design that puts your properties front and center with distraction-free browsing.",
    previewImage: "/themes/minimal-properties-preview.jpg",
    thumbnailImage: "/themes/minimal-properties-thumb.jpg",
    category: "minimal",
    features: [
      "Clean Layout",
      "Fast Loading",
      "Property Focus",
      "Simple Navigation",
    ],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "Luxury Estates",
    description:
      "Premium theme designed for high-end properties with sophisticated design and premium features.",
    previewImage: "/themes/luxury-estates-preview.jpg",
    thumbnailImage: "/themes/luxury-estates-thumb.jpg",
    category: "luxury",
    features: [
      "Premium Gallery",
      "Video Backgrounds",
      "Exclusive Listings",
      "Concierge Contact",
    ],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "Corporate Plus",
    description:
      "Professional corporate theme ideal for large real estate firms and commercial property specialists.",
    previewImage: "/themes/corporate-plus-preview.jpg",
    thumbnailImage: "/themes/corporate-plus-thumb.jpg",
    category: "corporate",
    features: [
      "Team Directory",
      "Office Locations",
      "Investment Tools",
      "Market Reports",
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

    // Check if themes already exist
    const existingThemes = await themesCollection.countDocuments();

    if (existingThemes > 0) {
      return NextResponse.json({
        message: "Themes already exist in database",
        count: existingThemes,
      });
    }

    // Insert sample themes
    const result = await themesCollection.insertMany(sampleThemes);

    return NextResponse.json({
      message: "Sample themes created successfully",
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
