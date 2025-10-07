import connectDB from "@/lib/mongodb";
import Property from "@/models/Property";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();


    // Fetch featured properties
    const featuredProperty = await Property.findOne({ isFeatured: true })
      .populate("propertyType", "name slug")
      .sort({ createdAt: -1 })
      .select(
        "name description location price currency propertyType beds baths area images slug isFeatured"
      )
      .lean();

    if (!featuredProperty) {
      return NextResponse.json({
        property: null,
        message: "No featured property found",
      });
    }

    // Transform the data to ensure propertyType is a slug string
    const transformedProperty = {
      ...featuredProperty,
      _id: featuredProperty._id.toString(),
      propertyType:
        (featuredProperty.propertyType as any)?.slug ||
        featuredProperty.propertyType,
    };

    return NextResponse.json({
      property: transformedProperty,
    });
  } catch (error) {
    console.error("Featured property GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
