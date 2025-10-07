"use client";
import PropertyCard from "@/components/Home/Properties/Card/Card";
import { PropertyType } from "@/types/propertyType";
import { PropertyHomes } from "@/types/properyHomes";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

interface FilterState {
  search: string;
  status: string;
  featured: boolean;
}

const PropertyTypePage: React.FC = () => {
  const { type } = useParams() as { type: string };
  const [properties, setProperties] = useState<PropertyHomes[]>([]);
  const [propertyType, setPropertyType] = useState<PropertyType | null>(null);
  const [allPropertyTypes, setAllPropertyTypes] = useState<PropertyType[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    status: "",
    featured: false,
  });

  // Debounce search function
  const debounce = useCallback(
    <T extends unknown[]>(func: (...args: T) => void, delay: number) => {
      let timeoutId: NodeJS.Timeout;
      return (...args: T) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
      };
    },
    []
  );

  const fetchProperties = useCallback(
    async (isInitial = false, searchFilters = filters) => {
      try {
        if (isInitial) {
          setInitialLoading(true);
        } else {
          setSearchLoading(true);
        }

        const params = new URLSearchParams();
        params.append("type", type);

        if (searchFilters.search) params.append("search", searchFilters.search);
        if (searchFilters.status) params.append("status", searchFilters.status);
        if (searchFilters.featured) params.append("featured", "true");

        const response = await fetch(`/api/properties?${params.toString()}`);

        if (!response.ok) {
          throw new Error("Failed to fetch properties");
        }

        const data = await response.json();
        setProperties(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        if (isInitial) {
          setInitialLoading(false);
        } else {
          setSearchLoading(false);
        }
      }
    },
    [type, filters]
  );

  const fetchPropertyType = useCallback(async () => {
    try {
      const response = await fetch("/api/property-types");
      if (response.ok) {
        const data = await response.json();
        setAllPropertyTypes(data.propertyTypes);
        const foundType = data.propertyTypes.find(
          (pt: PropertyType) => pt.slug === type
        );
        setPropertyType(foundType || null);
      }
    } catch (error) {
      console.error("Error fetching property type:", error);
    }
  }, [type]);

  // Debounced fetch for search
  const debouncedFetch = useCallback(
    debounce(
      (searchFilters: FilterState) => fetchProperties(false, searchFilters),
      500
    ),
    [fetchProperties]
  );

  // Initial load
  useEffect(() => {
    fetchProperties(true);
    fetchPropertyType();
  }, [fetchProperties, fetchPropertyType]);

  // Handle filter changes
  useEffect(() => {
    if (!initialLoading) {
      if (filters.search) {
        // For search, use debounced fetch
        debouncedFetch(filters);
      } else {
        // For other filters, fetch immediately
        fetchProperties(false, filters);
      }
    }
  }, [filters, initialLoading, debouncedFetch, fetchProperties]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, search: e.target.value }));
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters((prev) => ({ ...prev, status: e.target.value }));
  };

  const handleFeaturedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, featured: e.target.checked }));
  };

  const capitalizeFirst = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  if (initialLoading) {
    return (
      <div className="!pt-44 pb-20">
        <div className="container mx-auto max-w-8xl px-5 2xl:px-0">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400">
              Loading {capitalizeFirst(type)} properties...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="!pt-44 pb-20">
      <div className="container mx-auto max-w-8xl px-5 2xl:px-0">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10 lg:mb-12 px-4 sm:px-0">
          <h1 className="text-2xl md:text-44 lg:text-52 font-semibold text-dark dark:text-white mb-3 sm:mb-4 leading-tight">
            {propertyType?.name || capitalizeFirst(type)} Properties
          </h1>
          {propertyType?.description && (
            <p className="text-dark/50 dark:text-white/50 text-base sm:text-lg max-w-3xl mx-auto px-2 sm:px-0">
              {propertyType.description}
            </p>
          )}
          {properties.length > 0 && (
            <p className="text-primary text-sm sm:text-base mt-3 sm:mt-4 font-medium">
              {properties.length}{" "}
              {properties.length === 1 ? "property" : "properties"} found
            </p>
          )}
        </div>

        {/* Property Types Navigation */}
        {allPropertyTypes.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-dark dark:text-white mb-4">
              Browse by Property Type
            </h2>
            <div className="flex flex-wrap gap-3">
              {allPropertyTypes.map((propType) => (
                <Link
                  key={propType._id}
                  href={`/properties/${propType.slug}`}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    propType.slug === type
                      ? "bg-primary text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-dark dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  {propType.name}
                  {propType.propertyCount !== undefined && (
                    <span className="ml-1 opacity-75">
                      ({propType.propertyCount})
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search properties..."
                value={filters.search}
                onChange={handleSearchChange}
                className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:border-primary"
              />
              <Icon
                icon="ph:magnifying-glass"
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
              />
              {searchLoading && (
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                </div>
              )}
            </div>

            {/* Status Filter */}
            <select
              value={filters.status}
              onChange={handleStatusChange}
              className="px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:border-primary"
            >
              <option value="">All Status</option>
              <option value="for-sale">For Sale</option>
              <option value="for-rent">For Rent</option>
              <option value="sold">Sold</option>
              <option value="rented">Rented</option>
            </select>

            {/* Featured Filter */}
            <label className="flex items-center space-x-3 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.featured}
                onChange={handleFeaturedChange}
                className="text-primary focus:ring-primary"
              />
              <span className="text-sm text-dark dark:text-white">
                Featured Only
              </span>
            </label>

            {/* Clear Filters */}
            <button
              onClick={() =>
                setFilters({ search: "", status: "", featured: false })
              }
              className="px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-600 text-dark dark:text-white hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="text-center py-16">
            <Icon
              icon="ph:warning-circle"
              className="text-6xl text-red-400 mx-auto mb-4"
            />
            <p className="text-lg text-red-500 mb-4">{error}</p>
            <button
              onClick={() => fetchProperties(true)}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Properties Grid */}
        {!error && (
          <>
            {properties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {properties.map((property) => (
                  <PropertyCard key={property._id} item={property} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Icon
                  icon="ph:house"
                  className="text-6xl text-gray-400 dark:text-gray-600 mx-auto mb-4"
                />
                <h3 className="text-xl font-semibold text-dark dark:text-white mb-2">
                  No {capitalizeFirst(type)} Properties Found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  {filters.search || filters.status || filters.featured
                    ? "Try adjusting your filters to see more results."
                    : `We don't have any ${type} properties available at the moment.`}
                </p>
                {(filters.search || filters.status || filters.featured) && (
                  <button
                    onClick={() =>
                      setFilters({ search: "", status: "", featured: false })
                    }
                    className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default PropertyTypePage;
