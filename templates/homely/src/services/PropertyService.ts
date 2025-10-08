import connectDB from "@/lib/mongodb";
import {
  CreatePropertyInput,
  CreatePropertySchema,
  Property,
  PropertyFilters,
  PropertyFiltersSchema,
  UpdatePropertyInput,
  UpdatePropertySchema,
} from "@/schemas/Property";
import { ObjectId } from "mongodb";

export class PropertyService {
  private static async getCollection() {
    const { db } = await connectDB();
    return db.collection<Property>("properties");
  }

  // Create a new property
  static async create(data: CreatePropertyInput): Promise<Property> {
    const validatedData = CreatePropertySchema.parse(data);
    const collection = await this.getCollection();

    // Generate slug if not provided
    if (!validatedData.slug) {
      validatedData.slug = validatedData.name
        .toLowerCase()
        .replace(/[^a-zA-Z0-9 ]/g, "")
        .replace(/\s+/g, "-")
        .trim();
    }

    const propertyData = {
      ...validatedData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(propertyData);
    return {
      ...propertyData,
      _id: result.insertedId,
    };
  }

  // Find property by ID
  static async findById(id: string): Promise<Property | null> {
    const collection = await this.getCollection();
    const property = await collection.findOne({ _id: new ObjectId(id) } as any);
    return property || null;
  }

  // Find property by slug
  static async findBySlug(slug: string): Promise<Property | null> {
    const collection = await this.getCollection();
    const property = await collection.findOne({ slug, isActive: true });
    return property || null;
  }

  // Update property
  static async update(
    id: string,
    data: UpdatePropertyInput
  ): Promise<Property | null> {
    const validatedData = UpdatePropertySchema.parse(data);
    const collection = await this.getCollection();

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) } as any,
      {
        $set: {
          ...validatedData,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    return result || null;
  }

  // Delete property
  static async delete(id: string): Promise<boolean> {
    const collection = await this.getCollection();
    const result = await collection.deleteOne({ _id: new ObjectId(id) } as any);
    return result.deletedCount > 0;
  }

  // Find all properties with filters and pagination
  static async findAll(
    filters: Partial<PropertyFilters> = {}
  ): Promise<{ properties: Property[]; total: number }> {
    const validatedFilters = PropertyFiltersSchema.parse({
      limit: 10,
      skip: 0,
      ...filters,
    });
    const collection = await this.getCollection();

    const query: any = {};

    // Apply filters
    if (validatedFilters.propertyType) {
      query.propertyType = new ObjectId(validatedFilters.propertyType);
    }
    if (validatedFilters.status) {
      query.status = validatedFilters.status;
    }
    if (
      validatedFilters.minPrice !== undefined ||
      validatedFilters.maxPrice !== undefined
    ) {
      query.price = {};
      if (validatedFilters.minPrice !== undefined) {
        query.price.$gte = validatedFilters.minPrice;
      }
      if (validatedFilters.maxPrice !== undefined) {
        query.price.$lte = validatedFilters.maxPrice;
      }
    }
    if (validatedFilters.beds !== undefined) {
      query.beds = { $gte: validatedFilters.beds };
    }
    if (validatedFilters.baths !== undefined) {
      query.baths = { $gte: validatedFilters.baths };
    }
    if (validatedFilters.location) {
      query.location = { $regex: validatedFilters.location, $options: "i" };
    }
    if (validatedFilters.isFeatured !== undefined) {
      query.isFeatured = validatedFilters.isFeatured;
    }
    if (validatedFilters.isActive !== undefined) {
      query.isActive = validatedFilters.isActive;
    }

    // Handle search parameter (not in schema, added for API compatibility)
    if ((filters as any).search) {
      const searchTerm = (filters as any).search;
      query.$or = [
        { name: { $regex: searchTerm, $options: "i" } },
        { location: { $regex: searchTerm, $options: "i" } },
        { description: { $regex: searchTerm, $options: "i" } },
      ];
    }

    const [properties, total] = await Promise.all([
      collection
        .find(query)
        .sort({ isFeatured: -1, createdAt: -1 })
        .skip(validatedFilters.skip)
        .limit(validatedFilters.limit)
        .toArray(),
      collection.countDocuments(query),
    ]);

    return {
      properties,
      total,
    };
  }

  // Find featured properties
  static async findFeatured(limit: number = 10): Promise<Property[]> {
    const collection = await this.getCollection();
    const properties = await collection
      .find({ isFeatured: true, isActive: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
    return properties;
  }

  // Find properties by property type
  static async findByPropertyType(
    propertyTypeId: string,
    limit: number = 10
  ): Promise<Property[]> {
    const collection = await this.getCollection();
    const properties = await collection
      .find({
        propertyType: new ObjectId(propertyTypeId),
        isActive: true,
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
    return properties;
  }

  // Get property statistics
  static async getStats(): Promise<{
    total: number;
    forSale: number;
    forRent: number;
    sold: number;
    rented: number;
    featured: number;
  }> {
    const collection = await this.getCollection();

    const [total, forSale, forRent, sold, rented, featured] = await Promise.all(
      [
        collection.countDocuments({}),
        collection.countDocuments({ status: "for-sale", isActive: true }),
        collection.countDocuments({ status: "for-rent", isActive: true }),
        collection.countDocuments({ status: "sold" }),
        collection.countDocuments({ status: "rented" }),
        collection.countDocuments({ isFeatured: true, isActive: true }),
      ]
    );

    return {
      total,
      forSale,
      forRent,
      sold,
      rented,
      featured,
    };
  }

  // Toggle featured status
  static async toggleFeatured(id: string): Promise<Property | null> {
    const collection = await this.getCollection();
    const property = await collection.findOne({ _id: new ObjectId(id) } as any);

    if (!property) return null;

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) } as any,
      {
        $set: {
          isFeatured: !property.isFeatured,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    return result || null;
  }

  // Toggle active status
  static async toggleActive(id: string): Promise<Property | null> {
    const collection = await this.getCollection();
    const property = await collection.findOne({ _id: new ObjectId(id) } as any);

    if (!property) return null;

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) } as any,
      {
        $set: {
          isActive: !property.isActive,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    return result || null;
  }
}
