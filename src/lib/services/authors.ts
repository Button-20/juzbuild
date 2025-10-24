import { getCollection } from "@/lib/mongodb";
import { Author } from "@/types/properties";

export interface AuthorQueryParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  search?: string;
}

export interface AuthorsResponse {
  authors: Author[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class AuthorService {
  static async getAuthors(
    params: AuthorQueryParams = {},
    websiteDatabaseName?: string
  ): Promise<AuthorsResponse> {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortDirection = "desc",
      search = "",
    } = params;

    const skip = (page - 1) * limit;

    // Get the collection
    const collection = websiteDatabaseName
      ? await getCollection("authors", websiteDatabaseName)
      : await getCollection("authors");

    // Build filter query
    const filter: any = {};

    // Search filter
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { bio: { $regex: search, $options: "i" } },
      ];
    }

    // Build sort object
    const sortObject: any = {};
    if (sortBy) {
      sortObject[sortBy] = sortDirection === "asc" ? 1 : -1;
    }

    // Get total count for pagination
    const total = await collection.countDocuments(filter);

    // Get authors with pagination and sorting
    const authors = await collection
      .find(filter)
      .sort(sortObject)
      .skip(skip)
      .limit(limit)
      .toArray();

    // Format authors
    const formattedAuthors = authors.map((author: any) => ({
      ...author,
      _id: author._id.toString(),
    }));

    const totalPages = Math.ceil(total / limit);

    return {
      authors: formattedAuthors,
      total,
      page,
      limit,
      totalPages,
    };
  }

  static async getAuthorById(
    authorId: string,
    websiteDatabaseName?: string
  ): Promise<Author | null> {
    const collection = websiteDatabaseName
      ? await getCollection("authors", websiteDatabaseName)
      : await getCollection("authors");

    const { ObjectId } = require("mongodb");
    const author = await collection.findOne({ _id: new ObjectId(authorId) });

    if (!author) return null;

    return {
      ...author,
      _id: author._id.toString(),
    };
  }

  static async createAuthor(
    authorData: any,
    websiteDatabaseName?: string
  ): Promise<Author> {
    const collection = websiteDatabaseName
      ? await getCollection("authors", websiteDatabaseName)
      : await getCollection("authors");

    const now = new Date();
    const newAuthor = {
      ...authorData,
      createdAt: now,
      updatedAt: now,
    };

    const result = await collection.insertOne(newAuthor);

    return {
      ...newAuthor,
      _id: result.insertedId.toString(),
    };
  }

  static async updateAuthor(
    authorId: string,
    updateData: any,
    websiteDatabaseName?: string
  ): Promise<Author | null> {
    const collection = websiteDatabaseName
      ? await getCollection("authors", websiteDatabaseName)
      : await getCollection("authors");

    const { ObjectId } = require("mongodb");
    const now = new Date();

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(authorId) },
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
    };
  }

  static async deleteAuthor(
    authorId: string,
    websiteDatabaseName?: string
  ): Promise<boolean> {
    const collection = websiteDatabaseName
      ? await getCollection("authors", websiteDatabaseName)
      : await getCollection("authors");

    const { ObjectId } = require("mongodb");
    const result = await collection.deleteOne({ _id: new ObjectId(authorId) });

    return result.deletedCount === 1;
  }
}
