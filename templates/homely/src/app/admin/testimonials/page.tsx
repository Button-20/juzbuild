"use client";

import AdminSidebar from "@/components/Admin/AdminSidebar";
import TableSkeleton from "@/components/Admin/TableSkeleton";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import {
  FiChevronLeft,
  FiChevronRight,
  FiEdit2,
  FiFilter,
  FiMessageCircle,
  FiPlus,
  FiSearch,
  FiStar,
  FiTrash2,
  FiX,
} from "react-icons/fi";

interface Testimonial {
  _id: string;
  name: string;
  role: string;
  company?: string;
  message: string;
  image: string;
  rating: number;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");

  const fetchTestimonials = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { status: statusFilter }),
        ...(ratingFilter && { rating: ratingFilter }),
      });

      const response = await fetch(`/api/admin/testimonials?${params}`);

      if (!response.ok) {
        throw new Error("Failed to fetch testimonials");
      }

      const data = await response.json();
      setTestimonials(data.testimonials || []);
      setPagination(
        data.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        }
      );
    } catch (error) {
      console.error("Error fetching testimonials:", error);
      toast.error("Failed to fetch testimonials");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials(pagination.page);
  }, [searchTerm, statusFilter, ratingFilter]);

  const handleDeleteTestimonial = async (id: string) => {
    if (!confirm("Are you sure you want to delete this testimonial?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/testimonials/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Testimonial deleted successfully");
        fetchTestimonials(pagination.page);
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to delete testimonial");
      }
    } catch (error) {
      console.error("Error deleting testimonial:", error);
      toast.error("Failed to delete testimonial");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setRatingFilter("");
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          isActive
            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
        }`}
      >
        {isActive ? "Active" : "Inactive"}
      </span>
    );
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <FiStar
        key={index}
        className={`w-4 h-4 ${
          index < rating
            ? "text-yellow-400 fill-current"
            : "text-gray-300 dark:text-gray-600"
        }`}
      />
    ));
  };

  return (
    <AdminSidebar>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <FiMessageCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Testimonials Management
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Manage customer testimonials and reviews
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white dark:bg-black overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-800">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FiMessageCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Total Testimonials
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {pagination.total}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-black overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-800">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FiStar className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Active Testimonials
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {testimonials.filter((t) => t.isActive).length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-black overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-800">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FiStar className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Average Rating
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {testimonials.length > 0
                        ? (
                            testimonials.reduce((sum, t) => sum + t.rating, 0) /
                            testimonials.length
                          ).toFixed(1)
                        : "0.0"}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-black overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-800">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FiX className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Inactive Testimonials
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {testimonials.filter((t) => !t.isActive).length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-black shadow rounded-lg border border-gray-200 dark:border-gray-800">
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label
                  htmlFor="search-input"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Search Testimonials
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiSearch className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    id="search-input"
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 dark:focus:placeholder-gray-500 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 text-sm"
                    placeholder="Search testimonials..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="status-filter"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Filter by Status
                </label>
                <select
                  id="status-filter"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="rating-filter"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Filter by Rating
                </label>
                <select
                  id="rating-filter"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={ratingFilter}
                  onChange={(e) => setRatingFilter(e.target.value)}
                >
                  <option value="">All Ratings</option>
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
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
                Showing {testimonials.length} of {pagination.total} testimonials
              </span>
            </div>
          </div>
        </div>

        {/* Testimonials Table */}
        <div className="bg-white dark:bg-black shadow overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex justify-between items-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                Testimonials
              </h3>
              <div className="flex items-center space-x-3">
                <a
                  href="/admin/testimonials/add"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-colors duration-200"
                >
                  <FiPlus className="mr-2 h-4 w-4" />
                  Add Testimonial
                </a>
              </div>
            </div>
          </div>
          <div>
            {loading ? (
              <TableSkeleton rows={5} />
            ) : testimonials.length === 0 ? (
              <div className="py-12">
                <div className="text-center">
                  <FiMessageCircle className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                    No testimonials found
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Get started by adding a new testimonial.
                  </p>
                  <div className="mt-6">
                    <a
                      href="/admin/testimonials/add"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-colors duration-200"
                    >
                      <FiPlus className="mr-2 h-4 w-4" />
                      Add First Testimonial
                    </a>
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
                          Customer
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                        >
                          Message
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                        >
                          Rating
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
                          Date
                        </th>
                        <th scope="col" className="relative px-6 py-3">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-black divide-y divide-gray-200 dark:divide-gray-700">
                      {testimonials.map((testimonial) => (
                        <tr
                          key={testimonial._id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-900/50"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <img
                                  className="h-10 w-10 rounded-full object-cover"
                                  src={
                                    testimonial.image ||
                                    "/images/users/default-avatar.png"
                                  }
                                  alt={testimonial.name}
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {testimonial.name}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400 max-w-[150px] truncate">
                                  {testimonial.role}
                                  {testimonial.company &&
                                    ` at ${testimonial.company}`}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 dark:text-white max-w-xs truncate">
                              {testimonial.message}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {getRatingStars(testimonial.rating)}
                              <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                                ({testimonial.rating}/5)
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(testimonial.isActive)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(testimonial.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-2">
                              <a
                                href={`/admin/testimonials/edit/${testimonial._id}`}
                                className="p-2 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors duration-200"
                                title="Edit testimonial"
                              >
                                <FiEdit2 className="h-4 w-4" />
                              </a>
                              <button
                                onClick={() =>
                                  handleDeleteTestimonial(testimonial._id)
                                }
                                className="p-2 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors duration-200"
                                title="Delete testimonial"
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
                  <div className="space-y-4">
                    {testimonials.map((testimonial) => (
                      <div
                        key={testimonial._id}
                        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <img
                              className="h-12 w-12 rounded-full object-cover"
                              src={
                                testimonial.image ||
                                "/images/users/default-avatar.png"
                              }
                              alt={testimonial.name}
                            />
                            <div>
                              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                                {testimonial.name}
                              </h3>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[180px]">
                                {testimonial.role}
                                {testimonial.company &&
                                  ` at ${testimonial.company}`}
                              </p>
                              <div className="flex items-center mt-1">
                                {getRatingStars(testimonial.rating)}
                                <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
                                  ({testimonial.rating}/5)
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getStatusBadge(testimonial.isActive)}
                          </div>
                        </div>

                        <div className="mt-3">
                          <p className="text-sm text-gray-900 dark:text-white line-clamp-3">
                            {testimonial.message}
                          </p>
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(testimonial.createdAt)}
                          </span>
                          <div className="flex items-center space-x-2">
                            <a
                              href={`/admin/testimonials/edit/${testimonial._id}`}
                              className="p-2 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors duration-200"
                              title="Edit testimonial"
                            >
                              <FiEdit2 className="h-4 w-4" />
                            </a>
                            <button
                              onClick={() =>
                                handleDeleteTestimonial(testimonial._id)
                              }
                              className="p-2 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors duration-200"
                              title="Delete testimonial"
                            >
                              <FiTrash2 className="h-4 w-4" />
                            </button>
                          </div>
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
            <div className="bg-white dark:bg-black px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-800 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => fetchTestimonials(pagination.page - 1)}
                  disabled={!pagination.hasPrev}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  Previous
                </button>
                <button
                  onClick={() => fetchTestimonials(pagination.page + 1)}
                  disabled={!pagination.hasNext}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
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
                      onClick={() => fetchTestimonials(pagination.page - 1)}
                      disabled={!pagination.hasPrev}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      <FiChevronLeft className="h-5 w-5" />
                    </button>

                    {Array.from(
                      { length: pagination.totalPages },
                      (_, i) => i + 1
                    ).map((page) => (
                      <button
                        key={page}
                        onClick={() => fetchTestimonials(page)}
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
                      onClick={() => fetchTestimonials(pagination.page + 1)}
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
