"use client";
import { PropertyHomes } from "@/types/properyHomes";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import PropertyCard from "./Card/Card";

const Properties: React.FC = () => {
  const [properties, setProperties] = useState<PropertyHomes[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await fetch("/api/properties/homepage?limit=6");
        if (response.ok) {
          const data = await response.json();
          setProperties(data.properties);
        } else {
          console.error("Failed to fetch properties");
        }
      } catch (error) {
        console.error("Error fetching properties:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  if (loading) {
    return (
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container max-w-8xl mx-auto px-4 sm:px-5 2xl:px-0">
          <div className="mb-12 sm:mb-14 lg:mb-16 flex flex-col gap-3 sm:gap-4">
            <div className="flex gap-2.5 items-center justify-center">
              <span>
                <Icon
                  icon={"ph:house-simple-fill"}
                  width={18}
                  height={18}
                  className="text-primary sm:w-5 sm:h-5"
                />
              </span>
              <p className="text-sm sm:text-base font-semibold text-dark/75 dark:text-white/75">
                Properties
              </p>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-40 xl:text-52 font-medium text-black dark:text-white text-center tracking-tight leading-tight mb-2 sm:mb-3">
              Discover inspiring designed homes.
            </h2>
            <p className="text-sm sm:text-base font-normal text-black/50 dark:text-white/50 text-center max-w-2xl mx-auto">
              Curated homes where elegance, style, and comfort unite.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-200 dark:bg-gray-700 h-48 sm:h-56 lg:h-64 rounded-t-2xl"></div>
                <div className="border border-dark/10 dark:border-white/10 rounded-b-2xl p-4 sm:p-6">
                  <div className="h-4 sm:h-5 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-3/4"></div>
                  <div className="flex justify-between items-center mb-4">
                    <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                  </div>
                  <div className="flex gap-4">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-18"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-14"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 sm:py-16 lg:py-20">
      <div className="container max-w-8xl mx-auto px-4 sm:px-5 2xl:px-0">
        <div className="mb-12 sm:mb-14 lg:mb-16 flex flex-col gap-3 sm:gap-4">
          <div className="flex gap-2.5 items-center justify-center">
            <span>
              <Icon
                icon={"ph:house-simple-fill"}
                width={18}
                height={18}
                className="text-primary sm:w-5 sm:h-5"
              />
            </span>
            <p className="text-sm sm:text-base font-semibold text-dark/75 dark:text-white/75">
              Properties
            </p>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-40 xl:text-52 font-medium text-black dark:text-white text-center tracking-tight leading-tight mb-2 sm:mb-3">
            Discover inspiring designed homes.
          </h2>
          <p className="text-sm sm:text-base font-normal text-black/50 dark:text-white/50 text-center max-w-2xl mx-auto">
            Curated homes where elegance, style, and comfort unite.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
          {properties.length > 0 ? (
            properties.map((item) => (
              <div key={item._id} className="">
                <PropertyCard item={item} />
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12 sm:py-16">
              <Icon
                icon="ph:house-simple"
                className="text-4xl sm:text-5xl lg:text-6xl text-gray-400 dark:text-gray-600 mx-auto mb-3 sm:mb-4"
              />
              <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400">
                No properties available at the moment.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Properties;
