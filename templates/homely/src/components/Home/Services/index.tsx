"use client";
import { PropertyType } from "@/types/propertyType";
import { Icon } from "@iconify/react/dist/iconify.js";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const Services = () => {
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPropertyTypes = async () => {
      try {
        const response = await fetch("/api/property-types/public");
        if (response.ok) {
          const data = await response.json();
          setPropertyTypes(data.propertyTypes);
        } else {
          console.error("Failed to fetch property types");
        }
      } catch (error) {
        console.error("Error fetching property types:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyTypes();
  }, []);

  if (loading) {
    return (
      <section className="relative overflow-hidden">
        <div className="absolute left-0 top-0">
          <Image
            src="/images/categories/Vector.svg"
            alt="vector"
            width={800}
            height={1050}
            className="dark:hidden"
            unoptimized={true}
          />
          <Image
            src="/images/categories/Vector-dark.svg"
            alt="vector"
            width={800}
            height={1050}
            className="hidden dark:block"
            unoptimized={true}
          />
        </div>
        <div className="container max-w-8xl mx-auto px-5 2xl:px-0 relative z-10">
          <div className="grid grid-cols-12 items-center gap-10">
            <div className="lg:col-span-6 col-span-12">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-32"></div>
                <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded mb-8"></div>
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
              </div>
            </div>
            <div className="lg:col-span-6 md:col-span-6 col-span-12">
              <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-2xl h-64 sm:h-80 md:h-96"></div>
            </div>
            <div className="lg:col-span-6 md:col-span-6 col-span-12">
              <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-2xl h-64 sm:h-80 md:h-96"></div>
            </div>
            <div className="lg:col-span-3 md:col-span-6 col-span-12">
              <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-2xl h-64 sm:h-80 md:h-96"></div>
            </div>
            <div className="lg:col-span-3 md:col-span-6 col-span-12">
              <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-2xl h-64 sm:h-80 md:h-96"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Define the grid layout classes for each category
  const getGridClass = (index: number) => {
    if (index === 0) return "lg:col-span-6 md:col-span-6 col-span-12";
    if (index === 1) return "lg:col-span-6 md:col-span-6 col-span-12";
    return "lg:col-span-3 md:col-span-6 col-span-12";
  };

  return (
    <section className="relative overflow-hidden">
      <div className="absolute left-0 top-0">
        <Image
          src="/images/categories/Vector.svg"
          alt="vector"
          width={800}
          height={1050}
          className="dark:hidden"
          unoptimized={true}
        />
        <Image
          src="/images/categories/Vector-dark.svg"
          alt="vector"
          width={800}
          height={1050}
          className="hidden dark:block"
          unoptimized={true}
        />
      </div>
      <div className="container max-w-8xl mx-auto px-5 2xl:px-0 relative z-10">
        <div className="grid grid-cols-12 items-start gap-6 lg:gap-10">
          <div className="lg:col-span-6 col-span-12 lg:sticky lg:top-24">
            <p className="text-dark/75 dark:text-white/75 text-base font-semibold flex gap-2.5">
              <Icon
                icon="ph:house-simple-fill"
                className="text-2xl text-primary "
              />
              Categories
            </p>
            <h2 className="lg:text-52 text-32 sm:text-40 mt-4 mb-2 lg:max-w-full font-medium leading-[1.2] text-dark dark:text-white">
              Explore best properties with expert services.
            </h2>
            <p className="text-dark/50 dark:text-white/50 text-base sm:text-lg lg:max-w-full leading-[1.3] md:max-w-3/4">
              Discover a diverse range of premium properties, from luxurious
              apartments to spacious villas, tailored to your needs
            </p>
            <Link
              href="/properties"
              className="py-3 sm:py-4 px-6 sm:px-8 bg-primary text-sm sm:text-base leading-4 block w-fit text-white rounded-full font-semibold mt-6 sm:mt-8 hover:bg-dark duration-300"
            >
              View properties
            </Link>
          </div>{" "}
          {propertyTypes.length > 0 ? (
            propertyTypes.map((propertyType, index) => (
              <div key={propertyType._id} className={getGridClass(index)}>
                <div className="relative rounded-2xl overflow-hidden group">
                  <Link href={`/properties/${propertyType.slug}`}>
                    <Image
                      src={propertyType.image}
                      alt={propertyType.name}
                      width={index < 2 ? 680 : 320}
                      height={386}
                      className="w-full object-cover h-64 sm:h-80 md:h-96"
                      unoptimized={true}
                    />
                  </Link>
                  <Link
                    href={`/properties/${propertyType.slug}`}
                    className="absolute w-full h-full bg-gradient-to-b from-black/0 to-black/80 top-full flex flex-col justify-between pl-6 sm:pl-8 md:pl-10 pb-6 sm:pb-8 md:pb-10 pr-4 sm:pr-6 group-hover:top-0 duration-500"
                  >
                    <div className="flex justify-end mt-4 sm:mt-6">
                      <div className="bg-white text-dark rounded-full w-fit p-3 sm:p-4">
                        <Icon
                          icon="ph:arrow-right"
                          width={20}
                          height={20}
                          className="sm:w-6 sm:h-6"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <h3 className="text-white text-lg sm:text-xl md:text-2xl font-medium">
                        {propertyType.name}
                      </h3>
                      <p className="text-white/80 text-sm sm:text-base leading-5 sm:leading-6">
                        {propertyType.description}
                      </p>
                      {propertyType.propertyCount !== undefined && (
                        <p className="text-white/60 text-xs sm:text-sm">
                          {propertyType.propertyCount}{" "}
                          {propertyType.propertyCount === 1
                            ? "property"
                            : "properties"}
                        </p>
                      )}
                    </div>
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="lg:col-span-6 col-span-12 text-center py-16">
              <Icon
                icon="ph:squares-four"
                className="text-6xl text-gray-400 dark:text-gray-600 mx-auto mb-4"
              />
              <p className="text-lg text-gray-500 dark:text-gray-400">
                No property types available at the moment.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Services;
