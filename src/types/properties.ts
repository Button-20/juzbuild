import { z } from "zod";

// Property Image Schema
export const propertyImageSchema = z.object({
  src: z.string().min(1, "Image source is required"),
  alt: z.string().optional(),
  isMain: z.boolean().optional().default(false),
});

// Coordinates Schema
export const coordinatesSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

// Property Schema
export const propertySchema = z.object({
  _id: z.string().optional(),
  name: z.string().min(1, "Property name is required"),
  slug: z.string().min(1, "Property slug is required"),
  description: z.string().min(1, "Property description is required"),
  location: z.string().min(1, "Property location is required"),
  price: z.number().min(0, "Price must be positive"),
  currency: z.enum(["GHS", "USD", "EUR", "GBP", "CAD", "AUD"]).default("USD"),
  propertyType: z.string().min(1, "Property type is required"), // ObjectId string
  status: z
    .enum(["for-sale", "for-rent", "sold", "rented"])
    .default("for-sale"),
  beds: z.number().min(0, "Beds must be positive"),
  baths: z.number().min(0, "Baths must be positive"),
  area: z.number().min(0, "Area must be positive"),
  images: z.array(propertyImageSchema).default([]),
  amenities: z.array(z.string()).default([]),
  features: z.array(z.string()).default([]),
  coordinates: coordinatesSchema.optional(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  // User/Website association fields
  userId: z.string().min(1, "User ID is required"),
  websiteId: z.string().optional(), // For future multi-website support
  domain: z.string().min(1, "Domain is required"),
  // Timestamps
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Property Type Schema
export const propertyTypeSchema = z.object({
  _id: z.string().optional(),
  name: z.string().min(1, "Property type name is required"),
  slug: z.string().min(1, "Property type slug is required"),
  description: z.string().min(1, "Property type description is required"),
  image: z.string().min(1, "Property type image is required"),
  icon: z.string().optional(),
  isActive: z.boolean().default(true),
  // User association for custom property types
  userId: z.string().optional(), // Optional for global/default types
  domain: z.string().optional(), // Optional for global/default types
  // Timestamps
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Property Filter Schema for API queries
export const propertyFilterSchema = z.object({
  featured: z.boolean().optional(),
  propertyType: z.string().optional(),
  status: z.enum(["for-sale", "for-rent", "sold", "rented"]).optional(),
  search: z.string().optional(),
  limit: z.number().min(1).max(100).default(10),
  page: z.number().min(1).default(1),
  userId: z.string().optional(),
  domain: z.string().optional(),
  websiteDatabaseName: z.string().optional(),
});

// Inferred Types
export type Property = z.infer<typeof propertySchema>;
export type PropertyType = z.infer<typeof propertyTypeSchema>;
export type PropertyImage = z.infer<typeof propertyImageSchema>;
export type PropertyCoordinates = z.infer<typeof coordinatesSchema>;
export type PropertyFilter = z.infer<typeof propertyFilterSchema>;

// Property for API responses (with populated property type)
export type PropertyWithType = Omit<Property, "propertyType"> & {
  propertyType: PropertyType;
};

// Property for display in UI (with formatted values)
export type PropertyDisplay = Property & {
  rate: string; // Formatted price string
  propertyTypeName: string;
  formattedArea: string;
  mainImage?: PropertyImage;
};

// Property creation/update DTOs
export type CreatePropertyRequest = Omit<
  Property,
  "_id" | "createdAt" | "updatedAt" | "userId" | "domain"
>;
export type UpdatePropertyRequest = Partial<CreatePropertyRequest> & {
  _id: string;
};

export type CreatePropertyTypeRequest = Omit<
  PropertyType,
  "_id" | "createdAt" | "updatedAt" | "userId" | "domain"
>;
export type UpdatePropertyTypeRequest = Partial<CreatePropertyTypeRequest> & {
  _id: string;
};

// Property status options for UI
export const PROPERTY_STATUSES = [
  {
    value: "for-sale",
    label: "For Sale",
    variant: "for-sale",
    color: "bg-emerald-100 text-emerald-800 border border-emerald-200",
  },
  {
    value: "for-rent",
    label: "For Rent",
    variant: "for-rent",
    color: "bg-blue-100 text-blue-800 border border-blue-200",
  },
  {
    value: "sold",
    label: "Sold",
    variant: "sold",
    color: "bg-slate-100 text-slate-700 border border-slate-200",
  },
  {
    value: "rented",
    label: "Rented",
    variant: "rented",
    color: "bg-violet-100 text-violet-800 border border-violet-200",
  },
] as const;

// Currency options for UI
export const CURRENCY_OPTIONS = [
  { value: "USD", label: "USD ($)", symbol: "$" },
  { value: "EUR", label: "EUR (€)", symbol: "€" },
  { value: "GBP", label: "GBP (£)", symbol: "£" },
  { value: "CAD", label: "CAD (C$)", symbol: "C$" },
  { value: "AUD", label: "AUD (A$)", symbol: "A$" },
  { value: "GHS", label: "GHS (₵)", symbol: "₵" },
] as const;

export type PropertyStatus = (typeof PROPERTY_STATUSES)[number]["value"];
export type Currency = (typeof CURRENCY_OPTIONS)[number]["value"];

// Testimonial Schema
export const testimonialSchema = z.object({
  _id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  role: z.string().min(1, "Role is required"),
  company: z.string().optional(),
  message: z.string().min(1, "Message is required"),
  image: z.string().url("Valid image URL required").optional(),
  rating: z.number().min(1).max(5).optional(),
  isActive: z.boolean().default(true),
  order: z.number().min(0).default(0),
  // User/Website association fields
  userId: z.string().optional(), // Made optional for existing data
  websiteId: z.string().optional(),
  domain: z.string().optional(), // Made optional for existing data
  // Timestamps
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Testimonial Types
export type Testimonial = z.infer<typeof testimonialSchema>;
export type CreateTestimonialRequest = Omit<
  Testimonial,
  "_id" | "userId" | "domain" | "createdAt" | "updatedAt"
>;
export type UpdateTestimonialRequest = Partial<CreateTestimonialRequest>;
