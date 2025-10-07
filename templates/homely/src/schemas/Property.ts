import { ObjectId } from "mongodb";
import { z } from "zod";

// Property Image Schema
const PropertyImageSchema = z.object({
  src: z.string(),
  alt: z.string().default(""),
  isMain: z.boolean().default(false),
});

// Property Coordinates Schema
const PropertyCoordinatesSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

// Property Schema
export const PropertySchema = z.object({
  _id: z.instanceof(ObjectId).optional(),
  name: z.string().min(1, "Name is required").trim(),
  slug: z.string().min(1, "Slug is required").toLowerCase().trim(),
  description: z.string().min(1, "Description is required"),
  location: z.string().min(1, "Location is required").trim(),
  price: z.number().min(0, "Price must be positive"),
  currency: z.enum(["GHS", "USD", "EUR", "GBP", "CAD", "AUD"]).default("GHS"),
  propertyType: z.instanceof(ObjectId), // ObjectId reference
  status: z
    .enum(["for-sale", "for-rent", "sold", "rented"])
    .default("for-sale"),
  beds: z.number().min(0, "Beds must be non-negative"),
  baths: z.number().min(0, "Baths must be non-negative"),
  area: z.number().min(0, "Area must be positive"),
  images: z.array(PropertyImageSchema).default([]),
  amenities: z.array(z.string().trim()).default([]),
  features: z.array(z.string().trim()).default([]),
  coordinates: PropertyCoordinatesSchema.optional(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

// Property input schemas
export const CreatePropertySchema = PropertySchema.omit({
  _id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdatePropertySchema = PropertySchema.omit({
  _id: true,
  createdAt: true,
}).partial();

export const PropertyFiltersSchema = z.object({
  propertyType: z.string().optional(),
  status: z.enum(["for-sale", "for-rent", "sold", "rented"]).optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  beds: z.number().min(0).optional(),
  baths: z.number().min(0).optional(),
  location: z.string().optional(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
  limit: z.number().min(1).max(100).default(10),
  skip: z.number().min(0).default(0),
});

// Type exports
export type Property = z.infer<typeof PropertySchema>;
export type CreatePropertyInput = z.infer<typeof CreatePropertySchema>;
export type UpdatePropertyInput = z.infer<typeof UpdatePropertySchema>;
export type PropertyFilters = z.infer<typeof PropertyFiltersSchema>;
export type PropertyImage = z.infer<typeof PropertyImageSchema>;
export type PropertyCoordinates = z.infer<typeof PropertyCoordinatesSchema>;
