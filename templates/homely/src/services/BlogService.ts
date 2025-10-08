import connectDB from "@/lib/mongodb";
import {
  Blog,
  BlogFilters,
  BlogFiltersSchema,
  CreateBlogInput,
  CreateBlogSchema,
  UpdateBlogInput,
  UpdateBlogSchema,
} from "@/schemas/Blog";
import { ObjectId } from "mongodb";

export class BlogService {
  private static async getCollection() {
    const { db } = await connectDB();
    return db.collection<Blog>("blogs");
  }

  // Create a new blog post
  static async create(data: CreateBlogInput): Promise<Blog> {
    const validatedData = CreateBlogSchema.parse(data);
    const collection = await this.getCollection();

    // Generate slug if not provided
    if (!validatedData.slug) {
      validatedData.slug = validatedData.title
        .toLowerCase()
        .replace(/[^a-zA-Z0-9 ]/g, "")
        .replace(/\s+/g, "-")
        .trim();
    }

    // Calculate read time (average 200 words per minute)
    const wordCount = validatedData.content.split(/\s+/).length;
    const readTime = Math.ceil(wordCount / 200);

    const blogData = {
      ...validatedData,
      readTime,
      publishedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(blogData);
    return {
      ...blogData,
      _id: result.insertedId,
    };
  }

  // Find blog by ID
  static async findById(id: string): Promise<Blog | null> {
    const collection = await this.getCollection();
    const blog = await collection.findOne({ _id: new ObjectId(id) } as any);
    return blog || null;
  }

  // Find blog by slug
  static async findBySlug(slug: string): Promise<Blog | null> {
    const collection = await this.getCollection();
    const blog = await collection.findOne({ slug, isPublished: true });
    return blog || null;
  }

  // Update blog
  static async update(id: string, data: UpdateBlogInput): Promise<Blog | null> {
    const validatedData = UpdateBlogSchema.parse(data);
    const collection = await this.getCollection();

    // Recalculate read time if content changed
    const updateData: any = {
      ...validatedData,
      updatedAt: new Date(),
    };

    if (validatedData.content) {
      const wordCount = validatedData.content.split(/\s+/).length;
      updateData.readTime = Math.ceil(wordCount / 200);
    }

    // Set publishedAt when publishing
    if (validatedData.isPublished && !validatedData.publishedAt) {
      updateData.publishedAt = new Date();
    }

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) } as any,
      { $set: updateData },
      { returnDocument: "after" }
    );

    return result || null;
  }

  // Delete blog
  static async delete(id: string): Promise<boolean> {
    const collection = await this.getCollection();
    const result = await collection.deleteOne({ _id: new ObjectId(id) } as any);
    return result.deletedCount > 0;
  }

  // Find all blogs with filters and pagination
  static async findAll(
    filters: Partial<BlogFilters> = {}
  ): Promise<{ blogs: Blog[]; total: number }> {
    const validatedFilters = BlogFiltersSchema.parse({
      limit: 10,
      skip: 0,
      ...filters,
    });
    const collection = await this.getCollection();

    const query: any = {};

    // Apply filters
    if (validatedFilters.isPublished !== undefined) {
      query.isPublished = validatedFilters.isPublished;
    }
    if (validatedFilters.author) {
      query.author = { $regex: validatedFilters.author, $options: "i" };
    }
    if (validatedFilters.tags && validatedFilters.tags.length > 0) {
      query.tags = { $in: validatedFilters.tags };
    }

    // Handle search parameter (not in schema, added for API compatibility)
    if ((filters as any).search) {
      const searchTerm = (filters as any).search;
      query.$or = [
        { title: { $regex: searchTerm, $options: "i" } },
        { excerpt: { $regex: searchTerm, $options: "i" } },
        { content: { $regex: searchTerm, $options: "i" } },
      ];
    }

    const [blogs, total] = await Promise.all([
      collection
        .find(query)
        .sort({ createdAt: -1 })
        .skip(validatedFilters.skip)
        .limit(validatedFilters.limit)
        .toArray(),
      collection.countDocuments(query),
    ]);

    return {
      blogs,
      total,
    };
  }

  // Find published blogs
  static async findPublished(limit: number = 10): Promise<Blog[]> {
    const collection = await this.getCollection();
    const blogs = await collection
      .find({ isPublished: true })
      .sort({ publishedAt: -1 })
      .limit(limit)
      .toArray();
    return blogs;
  }

  // Find blogs by tag
  static async findByTag(tag: string, limit: number = 10): Promise<Blog[]> {
    const collection = await this.getCollection();
    const blogs = await collection
      .find({
        tags: tag.toLowerCase(),
        isPublished: true,
      })
      .sort({ publishedAt: -1 })
      .limit(limit)
      .toArray();
    return blogs;
  }

  // Increment view count
  static async incrementViews(id: string): Promise<void> {
    const collection = await this.getCollection();
    await collection.updateOne({ _id: new ObjectId(id) } as any, {
      $inc: { views: 1 },
    });
  }

  // Toggle published status
  static async togglePublished(id: string): Promise<Blog | null> {
    const collection = await this.getCollection();
    const blog = await collection.findOne({ _id: new ObjectId(id) } as any);

    if (!blog) return null;

    const updateData: any = {
      isPublished: !blog.isPublished,
      updatedAt: new Date(),
    };

    // Set publishedAt when publishing
    if (!blog.isPublished && !blog.publishedAt) {
      updateData.publishedAt = new Date();
    }

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) } as any,
      { $set: updateData },
      { returnDocument: "after" }
    );

    return result || null;
  }

  // Get blog statistics
  static async getStats(): Promise<{
    total: number;
    published: number;
    draft: number;
    totalViews: number;
  }> {
    const collection = await this.getCollection();

    const [total, published, draft, totalViewsResult] = await Promise.all([
      collection.countDocuments({}),
      collection.countDocuments({ isPublished: true }),
      collection.countDocuments({ isPublished: false }),
      collection
        .aggregate([{ $group: { _id: null, totalViews: { $sum: "$views" } } }])
        .toArray(),
    ]);

    const totalViews =
      totalViewsResult.length > 0 ? totalViewsResult[0].totalViews : 0;

    return {
      total,
      published,
      draft,
      totalViews,
    };
  }

  // Get all unique tags
  static async getAllTags(): Promise<string[]> {
    const collection = await this.getCollection();
    const result = await collection.distinct("tags");
    return result;
  }
}
