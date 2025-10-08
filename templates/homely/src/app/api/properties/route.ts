import { PropertyService, PropertyTypeService } from "@/services";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const featured = searchParams.get("featured");
    const limit = parseInt(searchParams.get("limit") || "10");
    const propertyType = searchParams.get("type");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    // Build filters for active properties only
    const filters: any = { isActive: true };

    if (featured === "true") {
      filters.isFeatured = true;
    }

    // Handle propertyType - convert slug to ObjectId if needed
    if (propertyType) {
      // Check if it's already an ObjectId or if it's a slug
      if (propertyType.match(/^[0-9a-fA-F]{24}$/)) {
        // It's an ObjectId
        filters.propertyType = propertyType;
      } else {
        // It's a slug, need to find the PropertyType ObjectId
        const typeDoc = await PropertyTypeService.findBySlug(propertyType);
        if (typeDoc) {
          filters.propertyType = typeDoc._id!.toString();
        } else {
          // If property type not found, return empty array
          return NextResponse.json([]);
        }
      }
    }

    if (status) {
      filters.status = status;
    }

    // Add search functionality
    if (search) {
      filters.search = search; // We'll handle this in the service
    }

    const { properties } = await PropertyService.findAll({
      ...filters,
      limit,
    });

    // Get property types for population
    const propertyTypeIds = [
      ...new Set(properties.map((p) => p.propertyType.toString())),
    ];
    const propertyTypes = await Promise.all(
      propertyTypeIds.map((id) => PropertyTypeService.findById(id))
    );
    const propertyTypeMap = new Map(
      propertyTypes.filter(Boolean).map((pt) => [pt!._id!.toString(), pt])
    );

    // Transform the data to match the existing PropertyHomes type
    const transformedProperties = properties.map((property) => {
      const propertyTypeData = propertyTypeMap.get(
        property.propertyType.toString()
      );
      return {
        _id: property._id!.toString(),
        name: property.name,
        slug: property.slug,
        description: property.description,
        location: property.location,
        price: property.price,
        currency: property.currency || "USD",
        propertyType:
          propertyTypeData?.slug || property.propertyType.toString(),
        status: property.status,
        beds: property.beds,
        baths: property.baths,
        area: property.area,
        images: property.images || [],
        amenities: property.amenities || [],
        features: property.features || [],
        coordinates: property.coordinates,
        createdAt: property.createdAt,
        updatedAt: property.updatedAt,
        isActive: property.isActive,
        isFeatured: property.isFeatured,
        // For backwards compatibility with existing PropertyCard component
        rate: new Intl.NumberFormat("en-US", {
          style: "decimal",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(property.price),
      };
    });

    return NextResponse.json(transformedProperties);
  } catch (error) {
    console.error("Public Properties API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
