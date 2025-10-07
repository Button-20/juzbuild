import { z } from "zod";

export const testimonialSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  company: z.string().optional(),
  message: z.string().min(1),
  image: z.string().min(1),
  rating: z.number().min(1).max(5).default(5),
  isActive: z.boolean().default(true),
  order: z.number().default(0),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type Testimonial = z.infer<typeof testimonialSchema>;
