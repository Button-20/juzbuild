"use client";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { formatCurrencyLegacy } from "@/lib/currency";
import { PropertyHomes } from "@/types/properyHomes";
import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";

const FeaturedProperty: React.FC = () => {
  const [api, setApi] = React.useState<CarouselApi | undefined>(undefined);
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);
  const [featuredProperty, setFeaturedProperty] =
    React.useState<PropertyHomes | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchFeaturedProperty = async () => {
      try {
        const response = await fetch("/api/properties/featured");
        if (response.ok) {
          const data = await response.json();
          setFeaturedProperty(data.property);
        } else {
          console.error("Failed to fetch featured property");
        }
      } catch (error) {
        console.error("Error fetching featured property:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProperty();
  }, []);

  React.useEffect(() => {
    if (!api || !featuredProperty?.images) {
      return;
    }
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api, featuredProperty]);

  const handleDotClick = (index: number) => {
    if (api) {
      api.scrollTo(index);
    }
  };

  const formatPrice = (property: PropertyHomes) => {
    if (property.rate) {
      return `$${property.rate}`;
    }
    if (property.price && property.currency) {
      // Use our new currency formatting utility for consistent Ghana Cedis display
      return formatCurrencyLegacy(property.price, property.currency);
    }
    return "Price on request";
  };

  if (loading) {
    return (
      <section>
        <div className="container max-w-8xl mx-auto px-5 2xl:px-0">
          <div className="grid lg:grid-cols-2 gap-10">
            <div className="relative">
              <div className="animate-pulse">
                <div className="bg-gray-200 dark:bg-gray-700 rounded-2xl w-full h-540"></div>
              </div>
            </div>
            <div className="flex flex-col gap-10">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-8"></div>
                <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!featuredProperty) {
    return (
      <section>
        <div className="container max-w-8xl mx-auto px-5 2xl:px-0">
          <div className="text-center py-16">
            <Icon
              icon="ph:house-simple"
              className="text-6xl text-gray-400 dark:text-gray-600 mx-auto mb-4"
            />
            <p className="text-lg text-gray-500 dark:text-gray-400">
              No featured property available at the moment.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 sm:py-16 lg:py-20">
      <div className="container max-w-8xl mx-auto px-4 sm:px-5 2xl:px-0">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-10 items-center">
          <div className="relative order-2 lg:order-1">
            <Carousel
              setApi={setApi}
              opts={{
                loop: true,
              }}
            >
              <CarouselContent>
                {featuredProperty.images?.map((image, index) => (
                  <CarouselItem key={index}>
                    <Image
                      src={image.src}
                      alt={image.alt || featuredProperty.name}
                      width={680}
                      height={530}
                      className="rounded-2xl w-full h-64 sm:h-80 lg:h-540 object-cover"
                      unoptimized={true}
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
            {featuredProperty.images && featuredProperty.images.length > 1 && (
              <div className="absolute left-1/2 transform -translate-x-1/2 lg:left-2/5 lg:transform-none bg-dark/50 rounded-full py-2 sm:py-2.5 bottom-4 sm:bottom-6 lg:bottom-10 flex justify-center mt-4 gap-2 sm:gap-2.5 px-2 sm:px-2.5">
                {Array.from({ length: count }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleDotClick(index)}
                    className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${
                      current === index + 1 ? "bg-white" : "bg-white/50"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-6 sm:gap-8 lg:gap-10 order-1 lg:order-2">
            <div>
              <p className="text-dark/75 dark:text-white/75 text-sm sm:text-base font-semibold flex gap-2 mb-3 sm:mb-4">
                <Icon
                  icon="ph:house-simple-fill"
                  className="text-xl sm:text-2xl text-primary"
                />
                Featured property
              </p>
              <h2 className="text-2xl sm:text-3xl lg:text-52 font-medium text-dark dark:text-white mb-3 sm:mb-4">
                {featuredProperty.name}
              </h2>
              <div className="flex items-center gap-2.5">
                <Icon
                  icon="ph:map-pin"
                  width={20}
                  height={20}
                  className="text-dark/50 dark:text-white/50 sm:w-7 sm:h-7 flex-shrink-0"
                />
                <p className="text-dark/50 dark:text-white/50 text-sm sm:text-base">
                  {featuredProperty.location}
                </p>
              </div>
            </div>
            <p className="text-sm sm:text-base text-dark/50 dark:text-white/50 leading-relaxed">
              {featuredProperty.description ||
                `Experience luxury living at ${
                  featuredProperty.name
                }, located at ${featuredProperty.location}. This beautiful ${
                  typeof featuredProperty.propertyType === "object"
                    ? featuredProperty.propertyType?.name
                    : featuredProperty.propertyType || "property"
                } offers ${featuredProperty.beds} bedrooms, ${
                  featuredProperty.baths
                } bathrooms, and ${
                  featuredProperty.area
                } sq ft of spacious living space.`}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-10">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="bg-dark/5 dark:bg-white/5 p-2 sm:p-2.5 rounded-[6px] flex-shrink-0">
                  <Image
                    src={"/images/hero/sofa.svg"}
                    alt="sofa"
                    width={20}
                    height={20}
                    className="block dark:hidden sm:w-6 sm:h-6"
                    unoptimized={true}
                  />
                  <Image
                    src={"/images/hero/dark-sofa.svg"}
                    alt="sofa"
                    width={20}
                    height={20}
                    className="hidden dark:block sm:w-6 sm:h-6"
                    unoptimized={true}
                  />
                </div>
                <h6 className="text-sm sm:text-base text-dark dark:text-white">
                  {featuredProperty.beds} Bedroom
                  {featuredProperty.beds !== 1 ? "s" : ""}
                </h6>
              </div>
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="bg-dark/5 dark:bg-white/5 p-2 sm:p-2.5 rounded-[6px] flex-shrink-0">
                  <Image
                    src={"/images/hero/tube.svg"}
                    alt="tube"
                    width={20}
                    height={20}
                    className="block dark:hidden sm:w-6 sm:h-6"
                    unoptimized={true}
                  />
                  <Image
                    src={"/images/hero/dark-tube.svg"}
                    alt="tube"
                    width={20}
                    height={20}
                    className="hidden dark:block sm:w-6 sm:h-6"
                    unoptimized={true}
                  />
                </div>
                <h6 className="text-sm sm:text-base text-dark dark:text-white">
                  {featuredProperty.baths} Bathroom
                  {featuredProperty.baths !== 1 ? "s" : ""}
                </h6>
              </div>
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="bg-dark/5 dark:bg-white/5 p-2 sm:p-2.5 rounded-[6px] flex-shrink-0">
                  <Image
                    src={"/images/hero/parking.svg"}
                    alt="parking"
                    width={20}
                    height={20}
                    className="block dark:hidden sm:w-6 sm:h-6"
                    unoptimized={true}
                  />
                  <Image
                    src={"/images/hero/dark-parking.svg"}
                    alt="parking"
                    width={20}
                    height={20}
                    className="hidden dark:block sm:w-6 sm:h-6"
                    unoptimized={true}
                  />
                </div>
                <h6 className="text-sm sm:text-base text-dark dark:text-white">
                  {featuredProperty.area} sq ft
                </h6>
              </div>
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="bg-dark/5 dark:bg-white/5 p-2 sm:p-2.5 rounded-[6px] flex-shrink-0">
                  <Icon
                    icon="ph:house-simple-fill"
                    width={20}
                    height={20}
                    className="text-dark/50 dark:text-white/50 sm:w-6 sm:h-6"
                  />
                </div>
                <h6 className="capitalize text-sm sm:text-base text-dark dark:text-white">
                  {typeof featuredProperty.propertyType === "object"
                    ? featuredProperty.propertyType?.name
                    : featuredProperty.propertyType || "Property"}
                </h6>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 lg:gap-10 items-start sm:items-center">
              <Link
                href="/contactus"
                className="py-3 sm:py-4 px-6 sm:px-8 bg-primary hover:bg-dark duration-300 rounded-full text-white text-sm sm:text-base font-medium inline-block text-center"
              >
                Get in touch
              </Link>
              <div>
                <h4 className="text-xl sm:text-2xl lg:text-3xl text-dark dark:text-white font-medium">
                  {formatPrice(featuredProperty)}
                </h4>
                <p className="text-sm sm:text-base text-dark/50 dark:text-white/50">
                  {featuredProperty.status === "for-sale"
                    ? "For Sale"
                    : "For Rent"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProperty;
