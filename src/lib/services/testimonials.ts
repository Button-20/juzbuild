import { getCollection } from "@/lib/mongodb";
import { Testimonial } from "@/types/properties";

export interface TestimonialQueryParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  search?: string;
  isActive?: boolean;
}

export interface TestimonialsResponse {
  testimonials: Testimonial[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class TestimonialService {
  static async getTestimonials(
    params: TestimonialQueryParams = {},
    websiteDatabaseName?: string
  ): Promise<TestimonialsResponse> {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortDirection = "desc",
      search = "",
      isActive,
    } = params;

    const skip = (page - 1) * limit;

    // Get the collection
    const collection = websiteDatabaseName
      ? await getCollection("testimonials", websiteDatabaseName)
      : await getCollection("testimonials");

    // Build filter query
    const filter: any = {};

    // Search filter
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { role: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
        { message: { $regex: search, $options: "i" } },
      ];
    }

    // Status filter
    if (typeof isActive === "boolean") {
      filter.isActive = isActive;
    }

    // Build sort object
    const sortObject: any = {};
    if (sortBy) {
      sortObject[sortBy] = sortDirection === "asc" ? 1 : -1;
    }

    // Get total count for pagination
    const total = await collection.countDocuments(filter);

    // Get testimonials with pagination and sorting
    const testimonials = await collection
      .find(filter)
      .sort(sortObject)
      .skip(skip)
      .limit(limit)
      .toArray();

    // Format testimonials
    const formattedTestimonials = testimonials.map((testimonial: any) => ({
      ...testimonial,
      _id: testimonial._id.toString(),
      rating: testimonial.rating || 5,
      order: testimonial.order || 0,
    }));

    const totalPages = Math.ceil(total / limit);

    return {
      testimonials: formattedTestimonials,
      total,
      page,
      limit,
      totalPages,
    };
  }

  static async getTestimonialById(
    testimonialId: string,
    websiteDatabaseName?: string
  ): Promise<Testimonial | null> {
    const collection = websiteDatabaseName
      ? await getCollection("testimonials", websiteDatabaseName)
      : await getCollection("testimonials");

    const { ObjectId } = require("mongodb");
    const testimonial = await collection.findOne({
      _id: new ObjectId(testimonialId),
    });

    if (!testimonial) return null;

    return {
      ...testimonial,
      _id: testimonial._id.toString(),
      rating: testimonial.rating || 5,
      order: testimonial.order || 0,
    };
  }

  static async createTestimonial(
    testimonialData: any,
    websiteDatabaseName?: string
  ): Promise<Testimonial> {
    const collection = websiteDatabaseName
      ? await getCollection("testimonials", websiteDatabaseName)
      : await getCollection("testimonials");

    const now = new Date();
    const newTestimonial = {
      ...testimonialData,
      createdAt: now,
      updatedAt: now,
      rating: testimonialData.rating || 5,
      order: testimonialData.order || 0,
    };

    const result = await collection.insertOne(newTestimonial);

    return {
      ...newTestimonial,
      _id: result.insertedId.toString(),
    };
  }

  static async updateTestimonial(
    testimonialId: string,
    updateData: any,
    websiteDatabaseName?: string
  ): Promise<Testimonial | null> {
    const collection = websiteDatabaseName
      ? await getCollection("testimonials", websiteDatabaseName)
      : await getCollection("testimonials");

    const { ObjectId } = require("mongodb");
    const now = new Date();

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(testimonialId) },
      {
        $set: {
          ...updateData,
          updatedAt: now,
        },
      },
      { returnDocument: "after" }
    );

    if (!result) return null;

    return {
      ...result,
      _id: result._id.toString(),
      rating: result.rating || 5,
      order: result.order || 0,
    };
  }

  static async deleteTestimonial(
    testimonialId: string,
    websiteDatabaseName?: string
  ): Promise<boolean> {
    const collection = websiteDatabaseName
      ? await getCollection("testimonials", websiteDatabaseName)
      : await getCollection("testimonials");

    const { ObjectId } = require("mongodb");
    const result = await collection.deleteOne({
      _id: new ObjectId(testimonialId),
    });

    return result.deletedCount === 1;
  }
}
