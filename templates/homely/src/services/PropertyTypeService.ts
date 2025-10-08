import connectDB from "@/lib/mongodb";
import {
  CreatePropertyTypeInput,
  CreatePropertyTypeSchema,
  PropertyType,
  UpdatePropertyTypeInput,
  UpdatePropertyTypeSchema,
} from "@/schemas/PropertyType";
import { ObjectId } from "mongodb";

export class PropertyTypeService {
  private static async getCollection() {
    const { db } = await connectDB();
    return db.collection<PropertyType>("propertytypes");
  }

  // Create a new property type
  static async create(data: CreatePropertyTypeInput): Promise<PropertyType> {
    const validatedData = CreatePropertyTypeSchema.parse(data);
    const collection = await this.getCollection();

    // Generate slug if not provided
    if (!validatedData.slug) {
      validatedData.slug = validatedData.name
        .toLowerCase()
        .replace(/[^a-zA-Z0-9 ]/g, "")
        .replace(/\s+/g, "-")
        .trim();
    }

    const propertyTypeData = {
      ...validatedData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(propertyTypeData);
    return {
      ...propertyTypeData,
      _id: result.insertedId,
    };
  }

  // Find property type by ID
  static async findById(id: string): Promise<PropertyType | null> {
    const collection = await this.getCollection();
    const propertyType = await collection.findOne({
      _id: new ObjectId(id),
    } as any);
    return propertyType || null;
  }

  // Find property type by slug
  static async findBySlug(slug: string): Promise<PropertyType | null> {
    const collection = await this.getCollection();
    const propertyType = await collection.findOne({ slug, isActive: true });
    return propertyType || null;
  }

  // Update property type
  static async update(
    id: string,
    data: UpdatePropertyTypeInput
  ): Promise<PropertyType | null> {
    const validatedData = UpdatePropertyTypeSchema.parse(data);
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

  // Delete property type
  static async delete(id: string): Promise<boolean> {
    const collection = await this.getCollection();
    const result = await collection.deleteOne({ _id: new ObjectId(id) } as any);
    return result.deletedCount > 0;
  }

  // Find all property types
  static async findAll(
    options: {
      limit?: number;
      skip?: number;
      filter?: Record<string, any>;
    } = {}
  ): Promise<{ propertyTypes: PropertyType[]; total: number }> {
    const { limit = 10, skip = 0, filter = {} } = options;
    const collection = await this.getCollection();

    const [propertyTypes, total] = await Promise.all([
      collection
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      collection.countDocuments(filter),
    ]);

    return {
      propertyTypes,
      total,
    };
  }

  // Find active property types
  static async findActive(): Promise<PropertyType[]> {
    const collection = await this.getCollection();
    const propertyTypes = await collection
      .find({ isActive: true })
      .sort({ createdAt: -1 })
      .toArray();
    return propertyTypes;
  }

  // Toggle active status
  static async toggleActive(id: string): Promise<PropertyType | null> {
    const collection = await this.getCollection();
    const propertyType = await collection.findOne({
      _id: new ObjectId(id),
    } as any);

    if (!propertyType) return null;

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) } as any,
      {
        $set: {
          isActive: !propertyType.isActive,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    return result || null;
  }

  // Get property type statistics
  static async getStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
  }> {
    const collection = await this.getCollection();

    const [total, active, inactive] = await Promise.all([
      collection.countDocuments({}),
      collection.countDocuments({ isActive: true }),
      collection.countDocuments({ isActive: false }),
    ]);

    return {
      total,
      active,
      inactive,
    };
  }
}
