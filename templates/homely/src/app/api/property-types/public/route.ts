import connectDB from "@/lib/mongodb";
import Property from "@/models/Property";
import PropertyType from "@/models/PropertyType";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();

    // Get only active property types for public display
    const propertyTypes = await PropertyType.find({ isActive: true })
      .sort({ name: 1 })
      .lean();

    // Get property counts for each type using ObjectId
    const propertyTypesWithCounts = await Promise.all(
      propertyTypes.map(async (type: any) => {
        const count = await Property.countDocuments({
          propertyType: type._id, // Use ObjectId instead of slug
          isActive: true,
        });
        return {
          ...type,
          _id: type._id.toString(),
          propertyCount: count,
        };
      })
    );

    return NextResponse.json({
      success: true,
      propertyTypes: propertyTypesWithCounts,
    });
  } catch (error) {
    console.error("Error fetching public property types:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch property types" },
      { status: 500 }
    );
  }
}
