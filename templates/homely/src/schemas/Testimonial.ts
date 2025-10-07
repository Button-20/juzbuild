import { ObjectId } from "mongodb";
import { z } from "zod";

// Testimonial Schema
export const TestimonialSchema = z.object({
  _id: z.instanceof(ObjectId).optional(),
  name: z.string().min(1, "Name is required").trim(),
  role: z.string().min(1, "Role is required").trim(),
  company: z.string().trim().optional(),
  message: z.string().min(1, "Message is required").trim(),
  image: z.string().min(1, "Image is required"),
  rating: z.number().min(1).max(5).default(5),
  isActive: z.boolean().default(true),
  order: z.number().default(0),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

// Testimonial input schemas
export const CreateTestimonialSchema = TestimonialSchema.omit({
  _id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateTestimonialSchema = TestimonialSchema.omit({
  _id: true,
  createdAt: true,
}).partial();

export const TestimonialFiltersSchema = z.object({
  isActive: z.boolean().optional(),
  rating: z.number().min(1).max(5).optional(),
  limit: z.number().min(1).max(100).default(10),
  skip: z.number().min(0).default(0),
});

// Type exports
export type Testimonial = z.infer<typeof TestimonialSchema>;
export type CreateTestimonialInput = z.infer<typeof CreateTestimonialSchema>;
export type UpdateTestimonialInput = z.infer<typeof UpdateTestimonialSchema>;
export type TestimonialFilters = z.infer<typeof TestimonialFiltersSchema>;
