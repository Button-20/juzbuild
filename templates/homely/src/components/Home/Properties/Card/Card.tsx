"use client";
import { formatCurrencyLegacy } from "@/lib/currency";
import { PropertyHomes } from "@/types/properyHomes";
import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const PropertyCard: React.FC<{ item: PropertyHomes }> = ({ item }) => {
  const {
    name,
    location,
    rate,
    price,
    currency,
    beds,
    baths,
    area,
    slug,
    propertyType,
    images,
  } = item;

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const hasMultipleImages = images && images.length > 1;
  const currentImage = images?.[currentImageIndex]?.src || images?.[0]?.src;

  // Format price - prioritize price with currency formatting for consistency
  const formatPrice = () => {
    // First, try to use price with currency for proper formatting
    if (price && currency) {
      return formatCurrencyLegacy(price, currency);
    }

    // Fallback to rate if no price/currency available
    if (rate) {
      // If rate doesn't have currency symbol, add the default one
      if (
        typeof rate === "string" &&
        !rate.includes("₵") &&
        !rate.includes("$")
      ) {
        return `₵${rate}`;
      }
      return rate;
    }

    return "Price on request";
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (hasMultipleImages) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  return (
    <div>
      <div className="relative rounded-2xl border border-dark/10 dark:border-white/10 group hover:shadow-3xl duration-300 dark:hover:shadow-white/20">
        <div className="overflow-hidden rounded-t-2xl">
          <Link href={`/properties/${propertyType}/${slug}`}>
            {currentImage && (
              <Image
                src={currentImage}
                alt={name}
                width={440}
                height={300}
                className="w-full h-48 sm:h-56 lg:h-64 object-cover rounded-t-2xl group-hover:brightness-50 group-hover:scale-125 transition duration-300 delay-75"
                unoptimized={true}
              />
            )}
          </Link>
          {hasMultipleImages && (
            <div className="absolute top-4 sm:top-6 right-4 sm:right-6">
              <button
                onClick={handleNextImage}
                className="cursor-pointer p-2 sm:p-3 bg-white/90 backdrop-blur-sm rounded-full hidden group-hover:flex items-center justify-center shadow-lg hover:bg-white transition-all duration-200"
                title={`View image ${currentImageIndex + 1} of ${
                  images.length
                }`}
              >
                <Icon
                  icon={"solar:arrow-right-linear"}
                  width={16}
                  height={16}
                  className="text-black sm:w-5 sm:h-5"
                />
              </button>
            </div>
          )}
        </div>
        <div className="p-4 sm:p-5 lg:p-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 lg:gap-5 justify-between mb-4 sm:mb-5 lg:mb-6">
            <div className="flex-1 min-w-0">
              <Link href={`/properties/${propertyType}/${slug}`}>
                <h3 className="text-lg sm:text-xl font-medium text-black dark:text-white duration-300 group-hover:text-primary truncate">
                  {name}
                </h3>
              </Link>
              <p className="text-sm sm:text-base font-normal text-black/50 dark:text-white/50 truncate">
                {location}
              </p>
            </div>
            <div className="flex-shrink-0 self-start sm:self-center">
              <button className="text-sm sm:text-base font-normal text-primary px-3 sm:px-4 lg:px-5 py-1.5 sm:py-2 rounded-full bg-primary/10 whitespace-nowrap">
                {formatPrice()}
              </button>
            </div>
          </div>
          <div className="flex">
            <div className="flex flex-col gap-1.5 sm:gap-2 border-e border-black/10 dark:border-white/20 pr-2 sm:pr-4 lg:pr-6 xl:pr-8 flex-1">
              <Icon
                icon={"solar:bed-linear"}
                width={16}
                height={16}
                className="sm:w-5 sm:h-5"
              />
              <p className="text-xs sm:text-sm lg:text-base font-normal text-black dark:text-white">
                {beds} Bed{beds !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex flex-col gap-1.5 sm:gap-2 border-e border-black/10 dark:border-white/20 px-2 sm:px-4 lg:px-6 xl:px-8 flex-1">
              <Icon
                icon={"solar:bath-linear"}
                width={16}
                height={16}
                className="sm:w-5 sm:h-5"
              />
              <p className="text-xs sm:text-sm lg:text-base font-normal text-black dark:text-white">
                {baths} Bath{baths !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex flex-col gap-1.5 sm:gap-2 pl-2 sm:pl-4 lg:pl-6 xl:pl-8 flex-1">
              <Icon
                icon={"lineicons:arrow-all-direction"}
                width={16}
                height={16}
                className="sm:w-5 sm:h-5"
              />
              <p className="text-xs sm:text-sm lg:text-base font-normal text-black dark:text-white">
                {area}m<sup>2</sup>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
