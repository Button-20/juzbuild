import { z } from "zod";

export const propertyTypeSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().min(1),
  image: z.string().min(1),
  icon: z.string().optional(),
  isActive: z.boolean().default(true),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type PropertyType = z.infer<typeof propertyTypeSchema>;

