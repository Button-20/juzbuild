"use client";

import { formatCurrencyLegacy } from "@/lib/currency";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

interface PropertyData {
  _id: string;
  name: string;
  description?: string;
  location: string;
  price?: number;
  currency?: string;
  propertyType?: string | { name: string; slug: string };
  beds: number;
  baths: number;
  area: number;
  images: Array<{
    src: string;
    alt?: string;
    isMain?: boolean;
  }>;
  slug: string;
  isFeatured?: boolean;
}

const Hero: React.FC = () => {
  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [fadeClass, setFadeClass] = useState("opacity-100");

  useEffect(() => {
    // Fetch featured properties from API
    const fetchFeaturedProperties = async () => {
      try {
        const response = await fetch("/api/properties?featured=true&limit=5");
        const data = await response.json();

        if (data && data.length > 0) {
          setProperties(data);
        } else {
          // Fallback to static data if no properties found
          setProperties([
            {
              _id: "1",
              name: "Futuristic Haven",
              location: "Palm Springs, CA",
              price: 4750000,
              currency: "USD",
              beds: 4,
              baths: 4,
              area: 3500,
              images: [
                {
                  src: "/images/hero/heroBanner.png",
                  alt: "Property Image",
                  isMain: true,
                },
              ],
              slug: "futuristic-haven",
            },
          ]);
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching properties:", error);
        // Fallback to static data
        setProperties([
          {
            _id: "1",
            name: "Futuristic Haven",
            location: "Palm Springs, CA",
            price: 4750000,
            currency: "USD",
            beds: 4,
            baths: 4,
            area: 3500,
            images: [
              {
                src: "/images/hero/heroBanner.png",
                alt: "Property Image",
                isMain: true,
              },
            ],
            slug: "futuristic-haven",
          },
        ]);
        setIsLoading(false);
      }
    };

    fetchFeaturedProperties();
  }, []);

  useEffect(() => {
    if (properties.length > 1) {
      const interval = setInterval(() => {
        setFadeClass("opacity-0");

        setTimeout(() => {
          setCurrentIndex((prevIndex) =>
            prevIndex === properties.length - 1 ? 0 : prevIndex + 1
          );
          setFadeClass("opacity-100");
        }, 500);
      }, 4000); // Change every 4 seconds

      return () => clearInterval(interval);
    }
  }, [properties.length]);

  if (isLoading) {
    return (
      <section className="!py-0">
        <div className="bg-gradient-to-b from-skyblue via-lightskyblue dark:via-[#4298b0] to-white/10 dark:to-black/10 overflow-hidden relative">
          <div className="container max-w-8xl mx-auto px-5 2xl:px-0 pt-32 md:pt-60 md:pb-68">
            <div className="relative text-white dark:text-dark text-center md:text-start z-10 animate-pulse">
              <div className="h-6 bg-white/20 rounded w-32 mb-4"></div>
              <div className="h-20 bg-white/20 rounded w-3/4 mb-6"></div>
              <div className="flex gap-4">
                <div className="h-12 bg-white/20 rounded-full w-32"></div>
                <div className="h-12 bg-white/20 rounded-full w-32"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const currentProperty = properties[currentIndex];
  const mainImage =
    currentProperty?.images?.find((img) => img.isMain) ||
    currentProperty?.images?.[0];

  return (
    <section className="!py-0">
      <div className="bg-gradient-to-b from-skyblue via-lightskyblue dark:via-[#4298b0] to-white/10 dark:to-black/10 overflow-hidden relative">
        <div className="container max-w-8xl mx-auto px-5 2xl:px-0 pt-32 md:pt-60 md:pb-68">
          <div
            className={`relative text-white dark:text-dark text-center md:text-start z-10 transition-opacity duration-500 ${fadeClass}`}
          >
            <p className="text-inherit text-xm font-medium">
              {currentProperty?.location || "Location not available"}
            </p>
            <h1 className="text-inherit text-6xl sm:text-9xl font-semibold -tracking-wider md:max-w-45p mt-4 mb-6">
              {currentProperty?.name || "Property Name"}
            </h1>
            <div className="flex flex-col xs:flex-row justify-center md:justify-start gap-4">
              <Link
                href="/contactus"
                className="px-8 py-4 border border-white dark:border-dark bg-white dark:bg-dark text-dark dark:text-white duration-300 dark:hover:text-dark hover:bg-transparent hover:text-white text-base font-semibold rounded-full hover:cursor-pointer"
              >
                Get in touch
              </Link>
              <Link
                href={`/properties/${
                  (typeof currentProperty?.propertyType === "string"
                    ? currentProperty.propertyType
                    : currentProperty?.propertyType?.slug) || "property"
                }/${currentProperty?.slug}`}
                className="px-8 py-4 border border-white dark:border-dark bg-transparent text-white dark:text-dark hover:bg-white dark:hover:bg-dark dark:hover:text-white hover:text-dark duration-300 text-base font-semibold rounded-full hover:cursor-pointer"
              >
                View Details
              </Link>
            </div>
          </div>
          <div className="hidden md:block absolute -top-2 -right-68 w-[1082px] h-[1016px]">
            {mainImage && (
              <div
                className={`w-full h-full transition-opacity duration-500 ${fadeClass}`}
              >
                <Image
                  src={mainImage.src}
                  alt={mainImage.alt || currentProperty?.name || "Property"}
                  width={1082}
                  height={1016}
                  priority={false}
                  unoptimized={true}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </div>
        <div className="md:absolute bottom-0 md:-right-68 xl:right-0 bg-white dark:bg-black py-12 px-8 mobile:px-16 md:pl-16 md:pr-[295px] rounded-2xl md:rounded-none md:rounded-tl-2xl mt-24">
          <div
            className={`grid grid-cols-2 sm:grid-cols-4 md:flex gap-10 md:gap-24 sm:text-center dark:text-white text-black transition-opacity duration-500 ${fadeClass}`}
          >
            <div className="flex flex-col sm:items-center gap-3">
              <Image
                src={"/images/hero/sofa.svg"}
                alt="sofa"
                width={32}
                height={32}
                className="block dark:hidden"
                unoptimized={true}
              />
              <Image
                src={"/images/hero/dark-sofa.svg"}
                alt="sofa"
                width={32}
                height={32}
                className="hidden dark:block"
                unoptimized={true}
              />
              <p className="text-sm sm:text-base font-normal text-inherit">
                {currentProperty?.beds || 4} Bedrooms
              </p>
            </div>
            <div className="flex flex-col sm:items-center gap-3">
              <Image
                src={"/images/hero/tube.svg"}
                alt="bathroom"
                width={32}
                height={32}
                className="block dark:hidden"
                unoptimized={true}
              />
              <Image
                src={"/images/hero/dark-tube.svg"}
                alt="bathroom"
                width={32}
                height={32}
                className="hidden dark:block"
                unoptimized={true}
              />
              <p className="text-sm sm:text-base font-normal text-inherit">
                {currentProperty?.baths || 4} Restrooms
              </p>
            </div>
            <div className="flex flex-col sm:items-center gap-3">
              <Image
                src={"/images/hero/parking.svg"}
                alt="parking"
                width={32}
                height={32}
                className="block dark:hidden"
                unoptimized={true}
              />
              <Image
                src={"/images/hero/dark-parking.svg"}
                alt="parking"
                width={32}
                height={32}
                className="hidden dark:block"
                unoptimized={true}
              />
              <p className="text-sm sm:text-base font-normal text-inherit">
                {currentProperty?.area
                  ? `${currentProperty.area} sqft`
                  : "Parking space"}
              </p>
            </div>
            <div className="flex flex-col sm:items-center gap-3">
              <p className="text-2xl sm:text-3xl font-medium text-inherit">
                {currentProperty?.price
                  ? formatCurrencyLegacy(
                      currentProperty.price,
                      currentProperty.currency || "GHS"
                    )
                  : "₵4,750,000"}
              </p>
              <p className="text-sm sm:text-base font-normal text-black/50 dark:text-white/50">
                For selling price
              </p>
            </div>
          </div>

          {/* Property Indicators */}
          {properties.length > 1 && (
            <div className="flex justify-center mt-6 gap-2">
              {properties.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setFadeClass("opacity-0");
                    setTimeout(() => {
                      setCurrentIndex(index);
                      setFadeClass("opacity-100");
                    }, 250);
                  }}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? "bg-primary scale-125"
                      : "bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
                  }`}
                  aria-label={`Go to property ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Hero;
