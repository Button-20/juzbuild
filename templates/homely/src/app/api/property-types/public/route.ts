import { PropertyService, PropertyTypeService } from "@/services";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Get only active property types for public display
    const propertyTypes = await PropertyTypeService.findActive();

    // Get property counts for each type
    const propertyTypesWithCounts = await Promise.all(
      propertyTypes.map(async (type: any) => {
        const { total } = await PropertyService.findAll({
          propertyType: type._id?.toString(),
          isActive: true,
          limit: 1,
          skip: 0,
        });
        return {
          ...type,
          _id: type._id?.toString(),
          propertyCount: total,
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
