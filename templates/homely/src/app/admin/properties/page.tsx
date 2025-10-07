"use client";

import AdminSidebar from "@/components/Admin/AdminSidebar";
import TableSkeleton from "@/components/Admin/TableSkeleton";
import { formatCurrencyLegacy } from "@/lib/currency";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  FiChevronLeft,
  FiChevronRight,
  FiEdit2,
  FiEye,
  FiFilter,
  FiHome,
  FiMapPin,
  FiPlus,
  FiSearch,
  FiStar,
  FiTrash2,
} from "react-icons/fi";

import { PropertyType } from "@/types/propertyType";

interface Property {
  _id: string;
  name: string;
  slug: string;
  location: string;
  price: number;
  currency: string;
  propertyType: PropertyType | string;
  status: string;
  beds: number;
  baths: number;
  area: number;
  isFeatured: boolean;
  isActive: boolean;
  createdAt: string;
  images: Array<{
    src: string;
    alt: string;
    isMain: boolean;
  }>;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function ManagePropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [loading, setLoading] = useState(true);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [propertyTypeFilter, setPropertyTypeFilter] = useState("");
  const [featuredFilter, setFeaturedFilter] = useState("");

  const fetchProperties = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { status: statusFilter }),
        ...(propertyTypeFilter && { propertyType: propertyTypeFilter }),
        ...(featuredFilter && { featured: featuredFilter }),
      });

      const response = await fetch(`/api/admin/properties?${params}`);

      if (response.ok) {
        const data = await response.json();
        setProperties(data.properties);
        setPagination({
          page: data.pagination.current,
          limit: data.pagination.limit,
          total: data.pagination.total,
          totalPages: data.pagination.pages,
          hasNext: data.pagination.current < data.pagination.pages,
          hasPrev: data.pagination.current > 1,
        });
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to fetch properties");
      }
    } catch (error) {
      toast.error("An error occurred while fetching properties");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [searchTerm, statusFilter, propertyTypeFilter, featuredFilter]);

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setPropertyTypeFilter("");
    setFeaturedFilter("");
  };

  const handleDeleteProperty = async (propertyId: string) => {
    if (!confirm("Are you sure you want to delete this property?")) return;

    try {
      const response = await fetch(`/api/admin/properties/${propertyId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Property deleted successfully");
        fetchProperties(pagination.page);
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to delete property");
      }
    } catch (error) {
      toast.error("Failed to delete property");
    }
  };

  const getMainImage = (property: Property) => {
    const mainImage = property.images?.find((img) => img.isMain);
    return (
      mainImage?.src || property.images?.[0]?.src || "/images/placeholder.jpg"
    );
  };

  const formatCurrency = (amount: number, currency: string) => {
    return formatCurrencyLegacy(amount, currency);
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      "for-sale":
        "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      "for-rent":
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      sold: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
      rented:
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    };

    return (
      <span
        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          statusColors[status as keyof typeof statusColors] ||
          "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
        }`}
      >
        {status.replace("-", " ").toUpperCase()}
      </span>
    );
  };

  return (
    <AdminSidebar>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-black shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold leading-7 text-gray-900 dark:text-white">
                  Property Management
                </h1>
                <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                  Manage all properties, their details, and status
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-black shadow overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              <FiFilter className="inline mr-2 h-5 w-5" />
              Filters
            </h3>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label
                  htmlFor="search"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Search Properties
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="search"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 block w-full text-sm border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 pl-3 pr-10 py-2"
                    placeholder="Search by name, location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <FiSearch className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="status-filter"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Filter by Status
                </label>
                <select
                  id="status-filter"
                  className="block w-full pl-3 pr-10 py-2 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="for-sale">For Sale</option>
                  <option value="for-rent">For Rent</option>
                  <option value="sold">Sold</option>
                  <option value="rented">Rented</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="type-filter"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Filter by Type
                </label>
                <select
                  id="type-filter"
                  className="block w-full pl-3 pr-10 py-2 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={propertyTypeFilter}
                  onChange={(e) => setPropertyTypeFilter(e.target.value)}
                >
                  <option value="">All Types</option>
                  <option value="apartment">Apartments</option>
                  <option value="villa">Villas</option>
                  <option value="office">Offices</option>
                  <option value="commercial">Commercial</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="featured-filter"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Filter by Featured
                </label>
                <select
                  id="featured-filter"
                  className="block w-full pl-3 pr-10 py-2 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={featuredFilter}
                  onChange={(e) => setFeaturedFilter(e.target.value)}
                >
                  <option value="">All Properties</option>
                  <option value="true">Featured Only</option>
                  <option value="false">Not Featured</option>
                </select>
              </div>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
              <button
                onClick={resetFilters}
                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-colors duration-200"
              >
                <FiFilter className="mr-2 h-4 w-4" />
                Clear Filters
              </button>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Showing {properties.length} of {pagination.total} properties
              </span>
            </div>
          </div>
        </div>

        {/* Properties Table */}
        <div className="bg-white dark:bg-black shadow overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                Properties
              </h3>
              <div className="flex items-center space-x-3">
                <Link
                  href="/admin/properties/add"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-colors duration-200"
                >
                  <FiPlus className="mr-2 h-4 w-4" />
                  Add Property
                </Link>
              </div>
            </div>
          </div>
          <div>
            {loading ? (
              <TableSkeleton rows={5} />
            ) : properties.length === 0 ? (
              <div className="py-8 sm:py-12">
                <div className="text-center px-4 sm:px-6">
                  <FiHome className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400 dark:text-gray-500" />
                  <h3 className="mt-2 text-sm sm:text-base font-medium text-gray-900 dark:text-white">
                    No properties found
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    Get started by adding a new property.
                  </p>
                  <div className="mt-4 sm:mt-6">
                    <Link
                      href="/admin/properties/add"
                      className="inline-flex items-center px-3 sm:px-4 py-2 border border-transparent shadow-sm text-xs sm:text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-colors duration-200"
                    >
                      <FiPlus className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                      Add First Property
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                        >
                          Property
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                        >
                          Details
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                        >
                          Status
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                        >
                          Featured
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                        >
                          Created
                        </th>
                        <th scope="col" className="relative px-6 py-3">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-black divide-y divide-gray-200 dark:divide-gray-700">
                      {properties.map((property) => (
                        <tr
                          key={property._id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-16 w-16">
                                <img
                                  className="h-16 w-16 rounded-lg object-cover border border-gray-200 dark:border-gray-600"
                                  src={getMainImage(property)}
                                  alt={property.name}
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {property.name}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                                  <FiMapPin className="mr-1 h-3 w-3" />
                                  {property.location}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white font-medium">
                              {formatCurrency(
                                property.price,
                                property.currency
                              )}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {typeof property.propertyType === "string"
                                ? property.propertyType
                                : property.propertyType?.name || "Unknown"}{" "}
                              • {property.beds} beds • {property.baths} baths
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {property.area} sq ft
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(property.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {property.isFeatured ? (
                              <div className="flex items-center text-yellow-600 dark:text-yellow-400">
                                <FiStar className="h-4 w-4 mr-1 fill-current" />
                                Featured
                              </div>
                            ) : (
                              <span className="text-gray-400 dark:text-gray-500">
                                Not Featured
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {new Date(property.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <Link
                                href={`/admin/properties/edit/${property._id}`}
                                className="p-2 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors duration-200"
                                title="Edit property"
                              >
                                <FiEdit2 className="h-4 w-4" />
                              </Link>
                              <Link
                                href={`/properties/${property.slug}`}
                                target="_blank"
                                className="p-2 text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-full transition-colors duration-200"
                                title="View property"
                              >
                                <FiEye className="h-4 w-4" />
                              </Link>
                              <button
                                onClick={() =>
                                  handleDeleteProperty(property._id)
                                }
                                className="p-2 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors duration-200"
                                title="Delete property"
                              >
                                <FiTrash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden">
                  <div className="space-y-3 p-3 sm:p-4">
                    {properties.map((property) => (
                      <div
                        key={property._id}
                        className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 sm:p-4 shadow-sm border border-gray-200 dark:border-gray-700"
                      >
                        {/* Property Image and Basic Info */}
                        <div className="flex items-start space-x-3 mb-3">
                          <div className="flex-shrink-0">
                            <img
                              className="h-14 w-14 sm:h-20 sm:w-20 rounded-lg object-cover border border-gray-200 dark:border-gray-600"
                              src={getMainImage(property)}
                              alt={property.name}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white truncate pr-2">
                              {property.name}
                            </h3>
                            <div className="flex items-center text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                              <FiMapPin className="mr-1 h-3 w-3 flex-shrink-0" />
                              <span className="truncate">
                                {property.location}
                              </span>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex-shrink-0">
                                {getStatusBadge(property.status)}
                              </div>
                              {property.isFeatured && (
                                <div className="flex items-center text-yellow-600 dark:text-yellow-400 text-xs sm:text-sm ml-2">
                                  <FiStar className="h-3 w-3 mr-1 fill-current" />
                                  <span className="text-xs">Featured</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Property Details */}
                        <div className="space-y-2 border-t border-gray-200 dark:border-gray-600 pt-3">
                          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                Price
                              </span>
                              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                {formatCurrency(
                                  property.price,
                                  property.currency
                                )}
                              </span>
                            </div>

                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                Type
                              </span>
                              <span className="text-sm text-gray-900 dark:text-white truncate">
                                {typeof property.propertyType === "string"
                                  ? property.propertyType
                                  : property.propertyType?.name || "Unknown"}
                              </span>
                            </div>

                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                Details
                              </span>
                              <span className="text-sm text-gray-900 dark:text-white">
                                {property.beds} beds • {property.baths} baths
                              </span>
                            </div>

                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                Area
                              </span>
                              <span className="text-sm text-gray-900 dark:text-white">
                                {property.area} sq ft
                              </span>
                            </div>
                          </div>

                          <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-100 dark:border-gray-700">
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                              Created:
                            </span>
                            <span className="text-xs text-gray-900 dark:text-white">
                              {new Date(
                                property.createdAt
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
                          <Link
                            href={`/admin/properties/edit/${property._id}`}
                            className="flex-1 min-w-0 flex items-center justify-center px-3 py-2 text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-md transition-colors duration-200"
                          >
                            <FiEdit2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            Edit
                          </Link>
                          <Link
                            href={`/properties/${property.slug}`}
                            target="_blank"
                            className="flex-1 min-w-0 flex items-center justify-center px-3 py-2 text-xs sm:text-sm font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-md transition-colors duration-200"
                          >
                            <FiEye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            View
                          </Link>
                          <button
                            onClick={() => handleDeleteProperty(property._id)}
                            className="flex-1 min-w-0 flex items-center justify-center px-3 py-2 text-xs sm:text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-md transition-colors duration-200"
                          >
                            <FiTrash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="bg-white dark:bg-black px-3 sm:px-4 py-3 border-t border-gray-200 dark:border-gray-800">
              {/* Mobile Pagination */}
              <div className="flex flex-col space-y-3 sm:hidden">
                <div className="text-center">
                  <p className="text-xs text-gray-700 dark:text-gray-300">
                    Page <span className="font-medium">{pagination.page}</span>{" "}
                    of{" "}
                    <span className="font-medium">{pagination.totalPages}</span>
                  </p>
                </div>
                <div className="flex justify-between">
                  <button
                    onClick={() => fetchProperties(pagination.page - 1)}
                    disabled={!pagination.hasPrev}
                    className="flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-xs font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    <FiChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </button>
                  <button
                    onClick={() => fetchProperties(pagination.page + 1)}
                    disabled={!pagination.hasNext}
                    className="flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-xs font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    Next
                    <FiChevronRight className="h-4 w-4 ml-1" />
                  </button>
                </div>
              </div>

              {/* Desktop Pagination */}
              <div className="hidden sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Showing{" "}
                    <span className="font-medium">
                      {(pagination.page - 1) * pagination.limit + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-medium">
                      {Math.min(
                        pagination.page * pagination.limit,
                        pagination.total
                      )}
                    </span>{" "}
                    of <span className="font-medium">{pagination.total}</span>{" "}
                    results
                  </p>
                </div>
                <div>
                  <nav
                    className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                    aria-label="Pagination"
                  >
                    <button
                      onClick={() => fetchProperties(pagination.page - 1)}
                      disabled={!pagination.hasPrev}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      <FiChevronLeft className="h-5 w-5" />
                    </button>

                    {Array.from(
                      { length: Math.min(pagination.totalPages, 10) },
                      (_, i) => {
                        const startPage = Math.max(1, pagination.page - 5);
                        return startPage + i;
                      }
                    )
                      .filter((page) => page <= pagination.totalPages)
                      .map((page) => (
                        <button
                          key={page}
                          onClick={() => fetchProperties(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors duration-200 ${
                            page === pagination.page
                              ? "z-10 bg-blue-50 dark:bg-blue-900 border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-300"
                              : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600"
                          }`}
                        >
                          {page}
                        </button>
                      ))}

                    <button
                      onClick={() => fetchProperties(pagination.page + 1)}
                      disabled={!pagination.hasNext}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      <FiChevronRight className="h-5 w-5" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminSidebar>
  );
}
