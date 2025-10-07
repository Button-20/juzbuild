import connectDB from "@/lib/mongodb";
import {
  CreateTestimonialInput,
  CreateTestimonialSchema,
  Testimonial,
  TestimonialFilters,
  TestimonialFiltersSchema,
  UpdateTestimonialInput,
  UpdateTestimonialSchema,
} from "@/schemas/Testimonial";
import { ObjectId } from "mongodb";

export class TestimonialService {
  private static async getCollection() {
    const { db } = await connectDB();
    return db.collection<Testimonial>("testimonials");
  }

  // Create a new testimonial
  static async create(data: CreateTestimonialInput): Promise<Testimonial> {
    const validatedData = CreateTestimonialSchema.parse(data);
    const collection = await this.getCollection();

    const testimonialData = {
      ...validatedData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(testimonialData);
    return {
      ...testimonialData,
      _id: result.insertedId,
    };
  }

  // Find testimonial by ID
  static async findById(id: string): Promise<Testimonial | null> {
    const collection = await this.getCollection();
    const testimonial = await collection.findOne({
      _id: new ObjectId(id),
    } as any);
    return testimonial || null;
  }

  // Update testimonial
  static async update(
    id: string,
    data: UpdateTestimonialInput
  ): Promise<Testimonial | null> {
    const validatedData = UpdateTestimonialSchema.parse(data);
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

  // Delete testimonial
  static async delete(id: string): Promise<boolean> {
    const collection = await this.getCollection();
    const result = await collection.deleteOne({ _id: new ObjectId(id) } as any);
    return result.deletedCount > 0;
  }

  // Find all testimonials with filters and pagination
  static async findAll(
    filters: Partial<TestimonialFilters> = {}
  ): Promise<{ testimonials: Testimonial[]; total: number }> {
    const validatedFilters = TestimonialFiltersSchema.parse({
      limit: 10,
      skip: 0,
      ...filters,
    });
    const collection = await this.getCollection();

    const query: any = {};

    // Apply filters
    if (validatedFilters.isActive !== undefined) {
      query.isActive = validatedFilters.isActive;
    }
    if (validatedFilters.rating !== undefined) {
      query.rating = validatedFilters.rating;
    }

    const [testimonials, total] = await Promise.all([
      collection
        .find(query)
        .sort({ order: 1, createdAt: -1 })
        .skip(validatedFilters.skip)
        .limit(validatedFilters.limit)
        .toArray(),
      collection.countDocuments(query),
    ]);

    return {
      testimonials,
      total,
    };
  }

  // Find active testimonials
  static async findActive(limit: number = 10): Promise<Testimonial[]> {
    const collection = await this.getCollection();
    const testimonials = await collection
      .find({ isActive: true })
      .sort({ order: 1, createdAt: -1 })
      .limit(limit)
      .toArray();
    return testimonials;
  }

  // Toggle active status
  static async toggleActive(id: string): Promise<Testimonial | null> {
    const collection = await this.getCollection();
    const testimonial = await collection.findOne({
      _id: new ObjectId(id),
    } as any);

    if (!testimonial) return null;

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) } as any,
      {
        $set: {
          isActive: !testimonial.isActive,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    return result || null;
  }

  // Update order
  static async updateOrder(
    id: string,
    order: number
  ): Promise<Testimonial | null> {
    const collection = await this.getCollection();

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) } as any,
      {
        $set: {
          order,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    return result || null;
  }

  // Get testimonial statistics
  static async getStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    averageRating: number;
  }> {
    const collection = await this.getCollection();

    const [total, active, inactive, avgRatingResult] = await Promise.all([
      collection.countDocuments({}),
      collection.countDocuments({ isActive: true }),
      collection.countDocuments({ isActive: false }),
      collection
        .aggregate([
          { $group: { _id: null, averageRating: { $avg: "$rating" } } },
        ])
        .toArray(),
    ]);

    const averageRating =
      avgRatingResult.length > 0 ? avgRatingResult[0].averageRating : 0;

    return {
      total,
      active,
      inactive,
      averageRating,
    };
  }
}
