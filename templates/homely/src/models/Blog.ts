import { z } from "zod";

export const blogSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be URL-friendly"),
  excerpt: z.string().min(1).max(500),
  content: z.string().min(1),
  coverImage: z.string().min(1),
  author: z.string().min(1),
  authorImage: z.string().optional(),
  tags: z.array(z.string().min(1)),
  isPublished: z.boolean().default(false),
  publishedAt: z.date().optional().nullable(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  readTime: z.number().int().min(0).optional(),
  views: z.number().int().min(0).default(0),
});

export type Blog = z.infer<typeof blogSchema>;
