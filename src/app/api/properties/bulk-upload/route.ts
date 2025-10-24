import { verifyToken } from "@/lib/auth";
import { getCollection } from "@/lib/mongodb";
import { PropertyService, PropertyTypeService } from "@/lib/services";
import { propertySchema } from "@/types/properties";
import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";

// Helper function to generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get("auth-token")?.value;
    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = decoded.userId;
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const websiteId = formData.get("websiteId") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Get website information
    let userDomain = null;
    let websiteDatabaseName = null;

    if (websiteId) {
      const sitesCollection = await getCollection("sites");
      const { ObjectId } = require("mongodb");
      const website = await sitesCollection.findOne({
        _id: new ObjectId(websiteId),
        userId: userId,
      });

      if (website) {
        userDomain = website.domain;
        websiteDatabaseName = website.dbName;
      }
    }

    if (!userDomain) {
      const usersCollection = await getCollection("users");
      const user = await usersCollection.findOne({ _id: userId });
      if (user?.domain) {
        userDomain = user.domain;
      }
    }

    if (!userDomain) {
      return NextResponse.json(
        { error: "User domain not found" },
        { status: 400 }
      );
    }

    // Read and parse Excel file
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);

    if (data.length === 0) {
      return NextResponse.json(
        { error: "Excel file is empty" },
        { status: 400 }
      );
    }

    // Get existing property types for validation
    const propertyTypes = await PropertyTypeService.findAll(
      userId,
      userDomain,
      websiteDatabaseName
    );

    const propertyTypeMap = new Map();
    propertyTypes.forEach((type) => {
      propertyTypeMap.set(type.name.toLowerCase(), type._id);
      propertyTypeMap.set(type.slug.toLowerCase(), type._id);
    });

    const results = {
      success: 0,
      failed: 0,
      errors: [] as Array<{ row: number; errors: string[] }>,
    };

    // Process each row
    for (let i = 0; i < data.length; i++) {
      const row = data[i] as any;
      const rowNumber = i + 2; // Excel row (accounting for header)

      try {
        // Map Excel columns to property fields
        const propertyName = row.name || row.Name || row.title || row.Title || "";
        const propertyData = {
          name: propertyName,
          slug: row.slug || row.Slug || generateSlug(propertyName),
          description: row.description || row.Description || "",
          location:
            row.location || row.Location || row.address || row.Address || "",
          price: parseFloat(row.price || row.Price || "0"),
          currency: row.currency || row.Currency || "USD",
          propertyType: "", // Will be resolved below
          status: (row.status || row.Status || "for-sale").toLowerCase(),
          beds: parseInt(
            row.beds || row.Beds || row.bedrooms || row.Bedrooms || "0"
          ),
          baths: parseInt(
            row.baths || row.Baths || row.bathrooms || row.Bathrooms || "0"
          ),
          area: parseFloat(row.area || row.Area || row.sqft || row.SQFT || "0"),
          amenities:
            row.amenities || row.Amenities
              ? String(row.amenities || row.Amenities)
                  .split(",")
                  .map((a: string) => a.trim())
              : [],
          features:
            row.features || row.Features
              ? String(row.features || row.Features)
                  .split(",")
                  .map((f: string) => f.trim())
              : [],
          images:
            row.images || row.Images
              ? String(row.images || row.Images)
                  .split(",")
                  .map((img: string) => ({
                    src: img.trim(),
                    alt: "",
                    isMain: false,
                  }))
              : [],
          isActive: row.isActive !== undefined ? Boolean(row.isActive) : true,
          isFeatured:
            row.isFeatured !== undefined ? Boolean(row.isFeatured) : false,
          coordinates:
            row.lat && row.lng
              ? {
                  lat: parseFloat(row.lat),
                  lng: parseFloat(row.lng),
                }
              : undefined,
        };

        // Resolve property type
        const propertyTypeName =
          row.propertyType || row.PropertyType || row.type || row.Type || "";
        const propertyTypeId = propertyTypeMap.get(
          propertyTypeName.toLowerCase()
        );

        if (!propertyTypeId) {
          results.failed++;
          results.errors.push({
            row: rowNumber,
            errors: [`Property type "${propertyTypeName}" not found`],
          });
          continue;
        }

        propertyData.propertyType = propertyTypeId;

        // Generate slug if not provided
        if (!propertyData.name) {
          results.failed++;
          results.errors.push({
            row: rowNumber,
            errors: ["Property name is required"],
          });
          continue;
        }

        // Validate the property data
        const validationResult = propertySchema
          .omit({
            _id: true,
            userId: true,
            domain: true,
            createdAt: true,
            updatedAt: true,
          })
          .safeParse(propertyData);

        if (!validationResult.success) {
          results.failed++;
          results.errors.push({
            row: rowNumber,
            errors: validationResult.error.errors.map(
              (e) => `${e.path.join(".")}: ${e.message}`
            ),
          });
          continue;
        }

        // Create the property
        await PropertyService.create(
          validationResult.data,
          userId,
          userDomain,
          websiteDatabaseName
        );

        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          row: rowNumber,
          errors: [error instanceof Error ? error.message : "Unknown error"],
        });
      }
    }

    return NextResponse.json({
      success: true,
      results,
      message: `Successfully imported ${results.success} properties. ${results.failed} failed.`,
    });
  } catch (error) {
    console.error("Error in bulk upload:", error);
    return NextResponse.json(
      {
        error: "Failed to process bulk upload",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
