"use client";

import AdminSidebar from "@/components/Admin/AdminSidebar";
import TableSkeleton from "@/components/Admin/TableSkeleton";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import {
  FiCheck,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiEdit2,
  FiEye,
  FiFileText,
  FiFilter,
  FiPlus,
  FiSearch,
  FiTrash2,
} from "react-icons/fi";

interface Blog {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string;
  author: string;
  authorImage?: string;
  tags: string[];
  isPublished: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  readTime?: number;
  views: number;
}

interface BlogStats {
  total: number;
  published: number;
  draft: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
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
  const [authorFilter, setAuthorFilter] = useState("");
  const [sortBy, setSortBy] = useState("-createdAt");

  const fetchBlogs = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { status: statusFilter }),
        ...(authorFilter && { author: authorFilter }),
        ...(sortBy && { sortBy: sortBy }),
      });

      const response = await fetch(`/api/admin/blogs?${params}`);

      if (!response.ok) {
        throw new Error("Failed to fetch blogs");
      }

      const data = await response.json();
      setBlogs(data.blogs || []);
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
      console.error("Error fetching blogs:", error);
      toast.error("Failed to fetch blogs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs(pagination.page);
  }, [searchTerm, statusFilter, authorFilter, sortBy]);

  const handleDeleteBlog = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blog?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/blogs/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Blog deleted successfully");
        fetchBlogs(pagination.page);
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to delete blog");
      }
    } catch (error) {
      console.error("Error deleting blog:", error);
      toast.error("Failed to delete blog");
    }
  };

  const togglePublishStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/blogs/${id}/toggle-status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isPublished: !currentStatus }),
      });

      if (response.ok) {
        toast.success(
          `Blog ${!currentStatus ? "published" : "unpublished"} successfully`
        );
        fetchBlogs(pagination.page);
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to update blog status");
      }
    } catch (error) {
      console.error("Error updating blog status:", error);
      toast.error("Failed to update blog status");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setAuthorFilter("");
    setSortBy("-createdAt");
  };

  const getStatusBadge = (isPublished: boolean) => {
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          isPublished
            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
        }`}
      >
        {isPublished ? (
          <>
            <FiCheck className="mr-1 w-3 h-3" />
            Published
          </>
        ) : (
          <>
            <FiClock className="mr-1 w-3 h-3" />
            Draft
          </>
        )}
      </span>
    );
  };

  const totalBlogs = blogs.length > 0 ? pagination.total : 0;
  const publishedBlogs = blogs.filter((b) => b.isPublished).length;
  const draftBlogs = blogs.filter((b) => !b.isPublished).length;
  const totalViews = blogs.reduce((sum, b) => sum + b.views, 0);

  return (
    <AdminSidebar>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <FiFileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Blog Management
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Manage your blog posts and content
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
                  <FiFileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Total Blogs
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {totalBlogs}
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
                  <FiCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Published
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {publishedBlogs}
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
                  <FiClock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Drafts
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {draftBlogs}
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
                  <FiEye className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Total Views
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {totalViews}
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
                  Search Blogs
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiSearch className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    id="search-input"
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 dark:focus:placeholder-gray-500 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 text-sm"
                    placeholder="Search blogs..."
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
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="author-filter"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Filter by Author
                </label>
                <select
                  id="author-filter"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={authorFilter}
                  onChange={(e) => setAuthorFilter(e.target.value)}
                >
                  <option value="">All Authors</option>
                  {Array.from(new Set(blogs.map((blog) => blog.author))).map(
                    (author) => (
                      <option key={author} value={author}>
                        {author}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div>
                <label
                  htmlFor="sort-filter"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Sort By
                </label>
                <select
                  id="sort-filter"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="-createdAt">Date Created (Newest)</option>
                  <option value="createdAt">Date Created (Oldest)</option>
                  <option value="title">Title (A-Z)</option>
                  <option value="-title">Title (Z-A)</option>
                  <option value="views">Views (Low to High)</option>
                  <option value="-views">Views (High to Low)</option>
                  <option value="author">Author (A-Z)</option>
                  <option value="-author">Author (Z-A)</option>
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
                Showing {blogs.length} of {pagination.total} blogs
              </span>
            </div>
          </div>
        </div>

        {/* Blogs Table */}
        <div className="bg-white dark:bg-black shadow overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex justify-between items-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                Blogs
              </h3>
              <div className="flex items-center space-x-3">
                <a
                  href="/admin/blogs/add"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-colors duration-200"
                >
                  <FiPlus className="mr-2 h-4 w-4" />
                  Add Blog
                </a>
              </div>
            </div>
          </div>
          <div>
            {loading ? (
              <TableSkeleton rows={5} />
            ) : blogs.length === 0 ? (
              <div className="py-12">
                <div className="text-center">
                  <FiFileText className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                    No blogs found
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Get started by creating your first blog post.
                  </p>
                  <div className="mt-6">
                    <a
                      href="/admin/blogs/add"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-colors duration-200"
                    >
                      <FiPlus className="mr-2 h-4 w-4" />
                      Create First Blog
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
                          Blog
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                        >
                          Author
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
                          Views
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
                      {blogs.map((blog) => (
                        <tr
                          key={blog._id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-900/50"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-12 w-16">
                                <img
                                  className="h-12 w-16 rounded-lg object-cover"
                                  src={blog.coverImage}
                                  alt={blog.title}
                                />
                              </div>
                              <div className="ml-4 max-w-xs">
                                <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                  {blog.title}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                  {blog.excerpt}
                                </div>
                                <div className="flex flex-wrap gap-1 mt-1 items-center">
                                  {blog.tags.slice(0, 2).map((tag, index) => (
                                    <span
                                      key={index}
                                      className="px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                  {blog.tags.length > 2 && (
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      +{blog.tags.length - 2} more
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {blog.authorImage ? (
                                <img
                                  className="h-8 w-8 rounded-full object-cover mr-2"
                                  src={blog.authorImage}
                                  alt={blog.author}
                                />
                              ) : (
                                <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center mr-2">
                                  <span className="text-xs text-gray-600 dark:text-gray-400">
                                    {blog.author.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              )}
                              <span className="text-sm text-gray-900 dark:text-white max-w-[100px] truncate">
                                {blog.author}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() =>
                                togglePublishStatus(blog._id, blog.isPublished)
                              }
                              className="cursor-pointer"
                            >
                              {getStatusBadge(blog.isPublished)}
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            <div className="flex items-center">
                              <FiEye className="mr-1 h-4 w-4" />
                              {blog.views}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(blog.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-2">
                              <a
                                href={`/blogs/${blog.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-full transition-colors duration-200"
                                title="View blog"
                              >
                                <FiEye className="h-4 w-4" />
                              </a>
                              <a
                                href={`/admin/blogs/${blog._id}/edit`}
                                className="p-2 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors duration-200"
                                title="Edit blog"
                              >
                                <FiEdit2 className="h-4 w-4" />
                              </a>
                              <button
                                onClick={() => handleDeleteBlog(blog._id)}
                                className="p-2 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors duration-200"
                                title="Delete blog"
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
                    {blogs.map((blog) => (
                      <div
                        key={blog._id}
                        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm"
                      >
                        <div className="flex items-start space-x-3">
                          <img
                            className="h-16 w-20 rounded-lg object-cover flex-shrink-0"
                            src={blog.coverImage}
                            alt={blog.title}
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                              {blog.title}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
                              {blog.excerpt}
                            </p>
                            <div className="flex items-center mt-2 space-x-3">
                              {blog.authorImage ? (
                                <img
                                  className="h-6 w-6 rounded-full object-cover"
                                  src={blog.authorImage}
                                  alt={blog.author}
                                />
                              ) : (
                                <div className="h-6 w-6 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                                  <span className="text-xs text-gray-600 dark:text-gray-400">
                                    {blog.author.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              )}
                              <span className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-[100px]">
                                {blog.author}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end space-y-2">
                            <button
                              onClick={() =>
                                togglePublishStatus(blog._id, blog.isPublished)
                              }
                            >
                              {getStatusBadge(blog.isPublished)}
                            </button>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1 mt-3">
                          {blog.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                          {blog.tags.length > 3 && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1">
                              +{blog.tags.length - 3} more
                            </span>
                          )}
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                            <div className="flex items-center">
                              <FiEye className="mr-1 h-3 w-3" />
                              {blog.views}
                            </div>
                            <span>{formatDate(blog.createdAt)}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <a
                              href={`/blogs/${blog.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-full transition-colors duration-200"
                              title="View blog"
                            >
                              <FiEye className="h-4 w-4" />
                            </a>
                            <a
                              href={`/admin/blogs/${blog._id}/edit`}
                              className="p-2 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors duration-200"
                              title="Edit blog"
                            >
                              <FiEdit2 className="h-4 w-4" />
                            </a>
                            <button
                              onClick={() => handleDeleteBlog(blog._id)}
                              className="p-2 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors duration-200"
                              title="Delete blog"
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
                  onClick={() => fetchBlogs(pagination.page - 1)}
                  disabled={!pagination.hasPrev}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  Previous
                </button>
                <button
                  onClick={() => fetchBlogs(pagination.page + 1)}
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
                      onClick={() => fetchBlogs(pagination.page - 1)}
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
                        onClick={() => fetchBlogs(page)}
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
                      onClick={() => fetchBlogs(pagination.page + 1)}
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
