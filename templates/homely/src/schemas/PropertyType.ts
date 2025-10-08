import { ObjectId } from "mongodb";
import { z } from "zod";

// PropertyType Schema
export const PropertyTypeSchema = z.object({
  _id: z.instanceof(ObjectId).optional(),
  name: z.string().min(1, "Name is required").trim(),
  slug: z.string().min(1, "Slug is required").toLowerCase().trim(),
  description: z.string().min(1, "Description is required").trim(),
  image: z.string().min(1, "Image is required"),
  icon: z.string().optional(),
  isActive: z.boolean().default(true),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

// PropertyType input schemas
export const CreatePropertyTypeSchema = PropertyTypeSchema.omit({
  _id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdatePropertyTypeSchema = PropertyTypeSchema.omit({
  _id: true,
  createdAt: true,
}).partial();

// Type exports
export type PropertyType = z.infer<typeof PropertyTypeSchema>;
export type CreatePropertyTypeInput = z.infer<typeof CreatePropertyTypeSchema>;
export type UpdatePropertyTypeInput = z.infer<typeof UpdatePropertyTypeSchema>;
