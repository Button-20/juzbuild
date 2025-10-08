import { ObjectId } from "mongodb";
import { z } from "zod";

// Blog Schema
export const BlogSchema = z.object({
  _id: z.instanceof(ObjectId).optional(),
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title cannot exceed 200 characters")
    .trim(),
  slug: z
    .string()
    .min(1, "Slug is required")
    .toLowerCase()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be URL-friendly"),
  excerpt: z
    .string()
    .min(1, "Excerpt is required")
    .max(500, "Excerpt cannot exceed 500 characters"),
  content: z.string().min(1, "Content is required"),
  coverImage: z.string().min(1, "Cover image is required"),
  author: z.string().min(1, "Author is required").trim(),
  authorImage: z.string().default(""),
  tags: z.array(z.string().trim().toLowerCase()).default([]),
  isPublished: z.boolean().default(false),
  publishedAt: z.date().nullable().default(null),
  readTime: z.number().default(0),
  views: z.number().default(0),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

// Blog input schemas
export const CreateBlogSchema = BlogSchema.omit({
  _id: true,
  createdAt: true,
  updatedAt: true,
  readTime: true,
  publishedAt: true,
});

export const UpdateBlogSchema = BlogSchema.omit({
  _id: true,
  createdAt: true,
}).partial();

export const BlogFiltersSchema = z.object({
  isPublished: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  author: z.string().optional(),
  limit: z.number().min(1).max(100).default(10),
  skip: z.number().min(0).default(0),
});

// Type exports
export type Blog = z.infer<typeof BlogSchema>;
export type CreateBlogInput = z.infer<typeof CreateBlogSchema>;
export type UpdateBlogInput = z.infer<typeof UpdateBlogSchema>;
export type BlogFilters = z.infer<typeof BlogFiltersSchema>;
