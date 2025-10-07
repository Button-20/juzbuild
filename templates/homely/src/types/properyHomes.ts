import { PropertyType } from "./propertyType";

export type PropertyHomes = {
  _id?: string;
  name: string;
  slug: string;
  description?: string;
  location: string;
  rate: string; // Primary price field
  price?: number; // Optional for compatibility
  currency?: string;
  propertyType?: PropertyType | string;
  status?: "for-sale" | "for-rent" | "sold" | "rented";
  beds: number;
  baths: number;
  area: number;
  images: PropertyImage[];
  amenities?: string[];
  features?: string[];
  coordinates?: {
    lat: number;
    lng: number;
  };
  createdAt?: string;
  updatedAt?: string;
  isActive?: boolean;
  isFeatured?: boolean;
};

export interface PropertyImage {
  src: string;
  alt?: string;
  isMain?: boolean;
}
