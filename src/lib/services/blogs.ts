import { getCollection } from "@/lib/mongodb";
import { Blog } from "@/types/properties";

export interface BlogQueryParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  search?: string;
  status?: "all" | "published" | "draft";
  authorId?: string;
}

export interface BlogsResponse {
  blogs: Blog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class BlogService {
  static async getBlogs(
    params: BlogQueryParams = {},
    websiteDatabaseName?: string
  ): Promise<BlogsResponse> {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortDirection = "desc",
      search = "",
      status = "all",
      authorId,
    } = params;

    const skip = (page - 1) * limit;

    // Get the collection
    const collection = websiteDatabaseName
      ? await getCollection("blogs", websiteDatabaseName)
      : await getCollection("blogs");

    // Build filter query
    const filter: any = {};

    // Search filter
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { excerpt: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    // Status filter
    if (status === "published") {
      filter.isPublished = true;
    } else if (status === "draft") {
      filter.isPublished = false;
    }

    // Author filter
    if (authorId) {
      filter.authorId = authorId;
    }

    // Build sort object
    const sortObject: any = {};
    if (sortBy) {
      sortObject[sortBy] = sortDirection === "asc" ? 1 : -1;
    }

    // Get total count for pagination
    const total = await collection.countDocuments(filter);

    // Get blogs with pagination and sorting
    const blogs = await collection
      .find(filter)
      .sort(sortObject)
      .skip(skip)
      .limit(limit)
      .toArray();

    // Format blogs
    const formattedBlogs = blogs.map((blog: any) => ({
      ...blog,
      _id: blog._id.toString(),
      tags: blog.tags || [],
      readTime: blog.readTime || 0,
      views: blog.views || 0,
    }));

    const totalPages = Math.ceil(total / limit);

    return {
      blogs: formattedBlogs,
      total,
      page,
      limit,
      totalPages,
    };
  }

  static async getBlogById(
    blogId: string,
    websiteDatabaseName?: string
  ): Promise<Blog | null> {
    const collection = websiteDatabaseName
      ? await getCollection("blogs", websiteDatabaseName)
      : await getCollection("blogs");

    const { ObjectId } = require("mongodb");
    const blog = await collection.findOne({ _id: new ObjectId(blogId) });

    if (!blog) return null;

    return {
      ...blog,
      _id: blog._id.toString(),
      tags: blog.tags || [],
      readTime: blog.readTime || 0,
      views: blog.views || 0,
    };
  }

  static async createBlog(
    blogData: any,
    websiteDatabaseName?: string
  ): Promise<Blog> {
    const collection = websiteDatabaseName
      ? await getCollection("blogs", websiteDatabaseName)
      : await getCollection("blogs");

    const now = new Date();
    const newBlog = {
      ...blogData,
      createdAt: now,
      updatedAt: now,
      tags: blogData.tags || [],
      readTime: blogData.readTime || 0,
      views: 0,
    };

    const result = await collection.insertOne(newBlog);

    return {
      ...newBlog,
      _id: result.insertedId.toString(),
    };
  }

  static async updateBlog(
    blogId: string,
    updateData: any,
    websiteDatabaseName?: string
  ): Promise<Blog | null> {
    const collection = websiteDatabaseName
      ? await getCollection("blogs", websiteDatabaseName)
      : await getCollection("blogs");

    const { ObjectId } = require("mongodb");
    const now = new Date();

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(blogId) },
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
      tags: result.tags || [],
      readTime: result.readTime || 0,
      views: result.views || 0,
    };
  }

  static async deleteBlog(
    blogId: string,
    websiteDatabaseName?: string
  ): Promise<boolean> {
    const collection = websiteDatabaseName
      ? await getCollection("blogs", websiteDatabaseName)
      : await getCollection("blogs");

    const { ObjectId } = require("mongodb");
    const result = await collection.deleteOne({ _id: new ObjectId(blogId) });

    return result.deletedCount === 1;
  }
}
