"use client";

import { formatCurrencyLegacy } from "@/lib/currency";
import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";

import { PropertyType } from "@/types/propertyType";

interface PropertyCardProps {
  property: {
    _id?: string;
    name: string;
    slug: string;
    location: string;
    price?: number;
    currency?: string;
    propertyType?: PropertyType | string;
    status?: string;
    beds: number;
    baths: number;
    area: number;
    images: Array<{
      src: string;
      alt?: string;
      isMain?: boolean;
    }>;
    isFeatured?: boolean;
  };
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const mainImage =
    property.images.find((img) => img.isMain) || property.images[0];

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "for-sale":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "for-rent":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "sold":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      case "rented":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 group">
      <Link
        href={`/properties/${
          typeof property.propertyType === "object"
            ? property.propertyType?.slug
            : property.propertyType || "property"
        }/${property.slug}`}
      >
        <div className="relative">
          {mainImage && (
            <Image
              src={mainImage.src}
              alt={mainImage.alt || property.name}
              width={400}
              height={250}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              unoptimized={true}
            />
          )}

          <div className="absolute top-3 left-3 flex gap-2">
            <span
              className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                property.status
              )}`}
            >
              {property.status?.replace("-", " ") || "Available"}
            </span>
            {property.isFeatured && (
              <span className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 px-2 py-1 rounded-full text-xs font-semibold">
                Featured
              </span>
            )}
          </div>

          <div className="absolute top-3 right-3">
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full p-2">
              <Icon
                icon="ph:heart"
                className="w-5 h-5 text-gray-600 dark:text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
              />
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="mb-2">
            <h3 className="text-lg font-semibold text-dark dark:text-white mb-1 group-hover:text-primary transition-colors line-clamp-1">
              {property.name}
            </h3>
            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400 text-sm">
              <Icon icon="ph:map-pin" className="w-4 h-4" />
              <span className="line-clamp-1">{property.location}</span>
            </div>
          </div>

          <div className="mb-3">
            <div className="text-2xl font-bold text-primary">
              {property.price
                ? formatCurrencyLegacy(
                    property.price,
                    property.currency || "GHS"
                  )
                : "Price on request"}
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Icon icon="solar:bed-linear" className="w-4 h-4" />
                <span>{property.beds}</span>
              </div>
              <div className="flex items-center gap-1">
                <Icon icon="solar:bath-linear" className="w-4 h-4" />
                <span>{property.baths}</span>
              </div>
              <div className="flex items-center gap-1">
                <Icon
                  icon="lineicons:arrow-all-direction"
                  className="w-4 h-4"
                />
                <span>{property.area}m²</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
