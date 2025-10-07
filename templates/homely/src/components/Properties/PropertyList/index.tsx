"use client";

import PropertyCard from "@/components/Home/Properties/Card/Card";
import { PropertyHomes } from "@/types/properyHomes";
import { useCallback, useEffect, useState } from "react";

interface FilterState {
  search: string;
  propertyType: string;
  status: string;
  featured: boolean;
}

const PropertiesListing: React.FC = () => {
  const [properties, setProperties] = useState<PropertyHomes[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    propertyType: "",
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

        if (searchFilters.search) params.append("search", searchFilters.search);
        if (searchFilters.propertyType)
          params.append("type", searchFilters.propertyType);
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
    []
  );

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
  }, []);

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
  }, [filters, initialLoading]);

  const handleFilterChange = (
    key: keyof FilterState,
    value: string | boolean
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      propertyType: "",
      status: "",
      featured: false,
    });
  };

  if (initialLoading) {
    return (
      <section className="pt-0!">
        <div className="container max-w-8xl mx-auto px-5 2xl:px-0">
          {/* Loading Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-200 dark:bg-gray-700 h-64 rounded-t-2xl"></div>
                <div className="p-6 border border-t-0 border-gray-200 dark:border-gray-700 rounded-b-2xl">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-3/4"></div>
                  <div className="flex justify-between items-center">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="pt-0!">
        <div className="container max-w-8xl mx-auto px-5 2xl:px-0">
          <div className="text-center py-12">
            <div className="text-red-500 mb-4">
              <svg
                className="mx-auto h-12 w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Error Loading Properties
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="pt-0!">
      <div className="container max-w-8xl mx-auto px-5 2xl:px-0">
        {/* Filters Section */}
        <div className="mb-10 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search Properties
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Search by name or location..."
                />
                {searchLoading && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <svg
                      className="animate-spin h-5 w-5 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Property Type
              </label>
              <select
                value={filters.propertyType}
                onChange={(e) =>
                  handleFilterChange("propertyType", e.target.value)
                }
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">All Types</option>
                <option value="apartment">Apartment</option>
                <option value="villa">Villa</option>
                <option value="office">Office</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="for-sale">For Sale</option>
                <option value="for-rent">For Rent</option>
                <option value="sold">Sold</option>
                <option value="rented">Rented</option>
              </select>
            </div>

            <div className="flex items-end">
              <div className="flex flex-col w-full">
                <label className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    checked={filters.featured}
                    onChange={(e) =>
                      handleFilterChange("featured", e.target.checked)
                    }
                    className="rounded border-gray-300 text-primary shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Featured Only
                  </span>
                </label>
                <button
                  onClick={clearFilters}
                  className="w-full px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-lg transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-400">
            {searchLoading ? (
              <div className="flex items-center gap-2">
                <svg
                  className="animate-spin h-4 w-4 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Searching properties...
              </div>
            ) : (
              <>
                {properties.length}{" "}
                {properties.length === 1 ? "property" : "properties"} found
              </>
            )}
          </div>
        </div>

        {/* Results */}
        {properties.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg
                className="mx-auto h-12 w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-2M7 21h2m-2 0H3m2-18v18M9 9h6v6H9V9z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Properties Found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Try adjusting your search criteria or clear all filters.
            </p>
            <button
              onClick={clearFilters}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Show All Properties
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
            {properties.map((item) => (
              <div key={item._id || item.slug} className="">
                <PropertyCard item={item} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default PropertiesListing;
