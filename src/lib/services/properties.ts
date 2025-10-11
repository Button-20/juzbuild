import { getCollection, getUserCollection } from "@/lib/mongodb";
import {
  CreatePropertyRequest,
  CreatePropertyTypeRequest,
  Property,
  PropertyFilter,
  PropertyType,
  UpdatePropertyRequest,
  UpdatePropertyTypeRequest,
} from "@/types/properties";
import { ObjectId } from "mongodb";

export class PropertyService {
  private static COLLECTION = "properties";

  /**
   * Create a new property
   */
  static async create(
    data: CreatePropertyRequest,
    userId: string,
    domain: string
  ): Promise<Property> {
    const collection = await getUserCollection(this.COLLECTION, userId);

    const propertyData = {
      ...data,
      _id: new ObjectId(),
      userId,
      domain,
      slug: data.slug || this.generateSlug(data.name),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(propertyData);

    if (!result.insertedId) {
      throw new Error("Failed to create property");
    }

    return {
      ...propertyData,
      _id: result.insertedId.toString(),
    } as Property;
  }

  /**
   * Find all properties with filters
   */
  static async findAll(
    filters: PropertyFilter
  ): Promise<{ properties: Property[]; total: number }> {
    const collection = await getUserCollection(
      this.COLLECTION,
      filters.userId!
    );

    const query: any = { isActive: true };

    // Add user/domain filtering
    if (filters.userId) query.userId = filters.userId;
    if (filters.domain) query.domain = filters.domain;

    // Add other filters
    if (filters.featured !== undefined) query.isFeatured = filters.featured;
    if (filters.propertyType) query.propertyType = filters.propertyType;
    if (filters.status) query.status = filters.status;

    // Add search functionality
    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: "i" } },
        { description: { $regex: filters.search, $options: "i" } },
        { location: { $regex: filters.search, $options: "i" } },
      ];
    }

    // Calculate pagination
    const limit = filters.limit || 10;
    const skip = ((filters.page || 1) - 1) * limit;

    // Get total count
    const total = await collection.countDocuments(query);

    // Get properties with pagination
    const cursor = collection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const properties = await cursor.toArray();

    return {
      properties: properties.map(this.formatDocument),
      total,
    };
  }

  /**
   * Find property by ID
   */
  static async findById(id: string, userId?: string): Promise<Property | null> {
    const collection = userId
      ? await getUserCollection(this.COLLECTION, userId)
      : await getCollection(this.COLLECTION);

    const query: any = { _id: new ObjectId(id), isActive: true };
    if (userId) query.userId = userId;

    const property = await collection.findOne(query);

    return property ? this.formatDocument(property) : null;
  }

  /**
   * Find property by slug
   */
  static async findBySlug(
    slug: string,
    domain?: string,
    userId?: string
  ): Promise<Property | null> {
    const collection = userId
      ? await getUserCollection(this.COLLECTION, userId)
      : await getCollection(this.COLLECTION);

    const query: any = { slug, isActive: true };
    if (domain) query.domain = domain;

    const property = await collection.findOne(query);

    return property ? this.formatDocument(property) : null;
  }

  /**
   * Update property
   */
  static async update(
    id: string,
    data: UpdatePropertyRequest,
    userId: string
  ): Promise<Property | null> {
    const collection = await getUserCollection(this.COLLECTION, userId);

    const { _id: _, ...dataWithoutId } = data;
    const updateData = {
      ...dataWithoutId,
      updatedAt: new Date(),
    };

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id), userId, isActive: true },
      { $set: updateData },
      { returnDocument: "after" }
    );

    return result.value ? this.formatDocument(result.value) : null;
  }

  /**
   * Soft delete property (set isActive to false)
   */
  static async delete(id: string, userId: string): Promise<boolean> {
    const collection = await getUserCollection(this.COLLECTION, userId);

    const result = await collection.updateOne(
      { _id: new ObjectId(id), userId },
      {
        $set: {
          isActive: false,
          updatedAt: new Date(),
        },
      }
    );

    return result.modifiedCount > 0;
  }

  /**
   * Get property statistics for dashboard
   */
  static async getStats(userId: string, domain: string) {
    const collection = await getUserCollection(this.COLLECTION, userId);

    const pipeline = [
      { $match: { userId, domain, isActive: true } },
      {
        $group: {
          _id: null,
          totalProperties: { $sum: 1 },
          forSale: {
            $sum: { $cond: [{ $eq: ["$status", "for-sale"] }, 1, 0] },
          },
          forRent: {
            $sum: { $cond: [{ $eq: ["$status", "for-rent"] }, 1, 0] },
          },
          sold: {
            $sum: { $cond: [{ $eq: ["$status", "sold"] }, 1, 0] },
          },
          rented: {
            $sum: { $cond: [{ $eq: ["$status", "rented"] }, 1, 0] },
          },
          featured: {
            $sum: { $cond: ["$isFeatured", 1, 0] },
          },
          averagePrice: { $avg: "$price" },
          totalValue: { $sum: "$price" },
        },
      },
    ];

    const result = await collection.aggregate(pipeline).toArray();

    return (
      result[0] || {
        totalProperties: 0,
        forSale: 0,
        forRent: 0,
        sold: 0,
        rented: 0,
        featured: 0,
        averagePrice: 0,
        totalValue: 0,
      }
    );
  }

  /**
   * Generate slug from name
   */
  private static generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
      .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
  }

  /**
   * Format MongoDB document for API response
   */
  private static formatDocument(doc: any): Property {
    return {
      ...doc,
      _id: doc._id.toString(),
    };
  }
}

export class PropertyTypeService {
  private static COLLECTION = "propertyTypes";

  /**
   * Create a new property type
   */
  static async create(
    data: CreatePropertyTypeRequest,
    userId?: string,
    domain?: string
  ): Promise<PropertyType> {
    const collection = userId
      ? await getUserCollection(this.COLLECTION, userId)
      : await getCollection(this.COLLECTION);

    const propertyTypeData = {
      ...data,
      _id: new ObjectId(),
      userId,
      domain,
      slug: data.slug || this.generateSlug(data.name),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(propertyTypeData);

    if (!result.insertedId) {
      throw new Error("Failed to create property type");
    }

    return {
      ...propertyTypeData,
      _id: result.insertedId.toString(),
    } as PropertyType;
  }

  /**
   * Find all property types
   */
  static async findAll(
    userId?: string,
    domain?: string
  ): Promise<PropertyType[]> {
    const collection = userId
      ? await getUserCollection(this.COLLECTION, userId)
      : await getCollection(this.COLLECTION);

    const query: any = { isActive: true };

    // Include both global property types (no userId/domain) and user-specific ones
    if (userId && domain) {
      query.$or = [
        { userId: null, domain: null }, // Global types
        { userId, domain }, // User-specific types
      ];
    }

    const propertyTypes = await collection
      .find(query)
      .sort({ name: 1 })
      .toArray();

    return propertyTypes.map(this.formatDocument);
  }

  /**
   * Find property type by ID
   */
  static async findById(
    id: string,
    userId?: string
  ): Promise<PropertyType | null> {
    const collection = userId
      ? await getUserCollection(this.COLLECTION, userId)
      : await getCollection(this.COLLECTION);

    const propertyType = await collection.findOne({
      _id: new ObjectId(id),
      isActive: true,
    });

    return propertyType ? this.formatDocument(propertyType) : null;
  }

  /**
   * Find property type by slug
   */
  static async findBySlug(
    slug: string,
    userId?: string
  ): Promise<PropertyType | null> {
    const collection = userId
      ? await getUserCollection(this.COLLECTION, userId)
      : await getCollection(this.COLLECTION);

    const propertyType = await collection.findOne({
      slug,
      isActive: true,
    });

    return propertyType ? this.formatDocument(propertyType) : null;
  }

  /**
   * Update property type
   */
  static async update(
    id: string,
    data: UpdatePropertyTypeRequest,
    userId?: string
  ): Promise<PropertyType | null> {
    const collection = userId
      ? await getUserCollection(this.COLLECTION, userId)
      : await getCollection(this.COLLECTION);

    const { _id: _, ...dataWithoutId } = data;
    const updateData = {
      ...dataWithoutId,
      updatedAt: new Date(),
    };

    const query: any = { _id: new ObjectId(id), isActive: true };
    if (userId) query.userId = userId;

    const result = await collection.findOneAndUpdate(
      query,
      { $set: updateData },
      { returnDocument: "after" }
    );

    return result.value ? this.formatDocument(result.value) : null;
  }

  /**
   * Soft delete property type
   */
  static async delete(id: string, userId?: string): Promise<boolean> {
    const collection = userId
      ? await getUserCollection(this.COLLECTION, userId)
      : await getCollection(this.COLLECTION);

    const query: any = { _id: new ObjectId(id) };
    if (userId) query.userId = userId;

    const result = await collection.updateOne(query, {
      $set: {
        isActive: false,
        updatedAt: new Date(),
      },
    });

    return result.modifiedCount > 0;
  }

  /**
   * Seed default property types
   */
  static async seedDefaults(): Promise<void> {
    const collection = await getCollection(this.COLLECTION);

    const defaultTypes = [
      {
        name: "House",
        slug: "house",
        description: "Single-family residential house",
        image: "/images/property-types/house.jpg",
        icon: "🏠",
      },
      {
        name: "Apartment",
        slug: "apartment",
        description: "Multi-unit apartment or flat",
        image: "/images/property-types/apartment.jpg",
        icon: "🏢",
      },
      {
        name: "Condo",
        slug: "condo",
        description: "Condominium unit",
        image: "/images/property-types/condo.jpg",
        icon: "🏘️",
      },
      {
        name: "Townhouse",
        slug: "townhouse",
        description: "Multi-story townhouse",
        image: "/images/property-types/townhouse.jpg",
        icon: "🏛️",
      },
      {
        name: "Land",
        slug: "land",
        description: "Vacant land or plot",
        image: "/images/property-types/land.jpg",
        icon: "🌍",
      },
    ];

    for (const type of defaultTypes) {
      const existing = await collection.findOne({ slug: type.slug });
      if (!existing) {
        await collection.insertOne({
          ...type,
          _id: new ObjectId(),
          userId: null, // Global type
          domain: null, // Global type
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }
  }

  /**
   * Generate slug from name
   */
  private static generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
  }

  /**
   * Format MongoDB document for API response
   */
  private static formatDocument(doc: any): PropertyType {
    return {
      ...doc,
      _id: doc._id.toString(),
    };
  }
}
