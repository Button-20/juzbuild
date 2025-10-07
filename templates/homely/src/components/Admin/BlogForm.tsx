"use client";

import AdminLoading from "@/components/Admin/AdminLoading";
import AuthorSelector from "@/components/Admin/AuthorSelector";
import WysiwygEditor from "@/components/ui/WysiwygEditor";
import { Icon } from "@iconify/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface BlogFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: string;
  authorImage: string;
  tags: string[];
  isPublished: boolean;
}

interface BlogFormProps {
  blogId?: string;
  isEdit?: boolean;
}

export default function BlogForm({ blogId, isEdit = false }: BlogFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<BlogFormData>({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    coverImage: "",
    author: "",
    authorImage: "",
    tags: [],
    isPublished: false,
  });

  const [tagInput, setTagInput] = useState("");

  // Fetch blog data if editing
  useEffect(() => {
    if (isEdit && blogId) {
      fetchBlogData();
    }
  }, [isEdit, blogId]);

  const fetchBlogData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/blogs/${blogId}`);
      if (response.ok) {
        const blog = await response.json();
        setFormData({
          title: blog.title || "",
          slug: blog.slug || "",
          excerpt: blog.excerpt || "",
          content: blog.content || "",
          coverImage: blog.coverImage || "",
          author: blog.author || "",
          authorImage: blog.authorImage || "",
          tags: blog.tags || [],
          isPublished: blog.isPublished || false,
        });
      } else {
        throw new Error("Failed to fetch blog data");
      }
    } catch (error) {
      console.error("Error fetching blog:", error);
      alert("Failed to fetch blog data");
      router.push("/admin/blogs");
    } finally {
      setLoading(false);
    }
  };

  // Generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9 ]/g, "")
      .replace(/\s+/g, "-")
      .trim();
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));

      // Auto-generate slug when title changes
      if (name === "title") {
        setFormData((prev) => ({
          ...prev,
          slug: generateSlug(value),
        }));
      }
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Handle image upload for WYSIWYG editor
  const handleWysiwygImageUpload = async (file: File): Promise<string> => {
    const formDataUpload = new FormData();
    formDataUpload.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formDataUpload,
    });

    if (response.ok) {
      const data = await response.json();
      return data.url;
    } else {
      throw new Error("Failed to upload image");
    }
  };

  // Handle image upload
  const handleImageUpload = async (file: File, type: "cover" | "author") => {
    setImageUploading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formDataUpload,
      });

      if (response.ok) {
        const data = await response.json();
        const imageUrl = data.url;

        setFormData((prev) => ({
          ...prev,
          [type === "cover" ? "coverImage" : "authorImage"]: imageUrl,
        }));
      } else {
        throw new Error("Failed to upload image");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image");
    } finally {
      setImageUploading(false);
    }
  };

  // Handle tag management
  const addTag = () => {
    if (
      tagInput.trim() &&
      !formData.tags.includes(tagInput.trim().toLowerCase())
    ) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim().toLowerCase()],
      }));
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.slug.trim()) {
      newErrors.slug = "Slug is required";
    }

    if (!formData.excerpt.trim()) {
      newErrors.excerpt = "Excerpt is required";
    } else if (formData.excerpt.length > 500) {
      newErrors.excerpt = "Excerpt cannot exceed 500 characters";
    }

    if (!formData.content.trim()) {
      newErrors.content = "Content is required";
    }

    if (!formData.coverImage.trim()) {
      newErrors.coverImage = "Cover image is required";
    }

    if (!formData.author.trim()) {
      newErrors.author = "Author is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitLoading(true);

    try {
      const url = isEdit ? `/api/admin/blogs/${blogId}` : "/api/admin/blogs";
      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        alert(
          data.message || `Blog ${isEdit ? "updated" : "created"} successfully!`
        );
        router.push("/admin/blogs");
      } else {
        throw new Error(
          data.error || `Failed to ${isEdit ? "update" : "create"} blog`
        );
      }
    } catch (error: any) {
      console.error(`Error ${isEdit ? "updating" : "creating"} blog:`, error);
      alert(error.message || `Failed to ${isEdit ? "update" : "create"} blog`);
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return <AdminLoading fullPage={true} message="Loading blog..." />;
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          {isEdit ? "Edit Blog" : "Add New Blog"}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm sm:text-base">
          {isEdit ? "Update your blog post" : "Create a new blog post"}
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white text-sm sm:text-base ${
                errors.title
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              }`}
              placeholder="Enter blog title"
            />
            {errors.title && (
              <p className="text-red-500 text-xs sm:text-sm mt-1">
                {errors.title}
              </p>
            )}
          </div>

          {/* Slug */}
          <div>
            <label
              htmlFor="slug"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Slug *
            </label>
            <input
              type="text"
              id="slug"
              name="slug"
              value={formData.slug}
              onChange={handleInputChange}
              className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white text-sm sm:text-base ${
                errors.slug
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              }`}
              placeholder="blog-url-slug"
            />
            {errors.slug && (
              <p className="text-red-500 text-xs sm:text-sm mt-1">
                {errors.slug}
              </p>
            )}
            <p className="text-gray-500 text-xs sm:text-sm mt-1 break-all">
              URL: /blogs/{formData.slug}
            </p>
          </div>

          {/* Excerpt */}
          <div>
            <label
              htmlFor="excerpt"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Excerpt *
            </label>
            <textarea
              id="excerpt"
              name="excerpt"
              value={formData.excerpt}
              onChange={handleInputChange}
              rows={3}
              className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white text-sm sm:text-base resize-none ${
                errors.excerpt
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              }`}
              placeholder="Brief description of your blog post"
            />
            {errors.excerpt && (
              <p className="text-red-500 text-xs sm:text-sm mt-1">
                {errors.excerpt}
              </p>
            )}
            <p className="text-gray-500 text-xs sm:text-sm mt-1">
              {formData.excerpt.length}/500 characters
            </p>
          </div>

          {/* Cover Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cover Image *
            </label>
            <div
              className={`border-2 border-dashed rounded-lg p-4 sm:p-6 ${
                errors.coverImage
                  ? "border-red-300 dark:border-red-600"
                  : "border-gray-300 dark:border-gray-600"
              }`}
            >
              {formData.coverImage ? (
                <div className="space-y-3 sm:space-y-4">
                  <div className="relative bg-gray-50 dark:bg-gray-700 rounded-lg p-3 sm:p-4">
                    <Image
                      src={formData.coverImage}
                      alt="Cover"
                      width={400}
                      height={200}
                      className="rounded-lg object-cover mx-auto w-full max-w-md"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, coverImage: "" }))
                      }
                      className="absolute top-4 sm:top-6 right-4 sm:right-6 bg-red-500 text-white p-1.5 sm:p-2 rounded-full hover:bg-red-600 transition-colors"
                    >
                      <Icon icon="ph:x" className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                  <div className="flex justify-center">
                    <label
                      htmlFor="coverImageUpload"
                      className="cursor-pointer inline-flex items-center px-3 sm:px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm sm:text-base"
                    >
                      <Icon icon="ph:pencil-simple" className="mr-2 w-4 h-4" />
                      Change Cover Image
                    </label>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <Icon
                    icon="ph:image"
                    className="text-3xl sm:text-4xl text-gray-400 mx-auto mb-3 sm:mb-4"
                  />
                  <p className="text-gray-600 dark:text-gray-400 mb-2 font-medium text-sm sm:text-base">
                    {imageUploading ? "Uploading..." : "Upload Cover Image"}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-3 sm:mb-4 px-2">
                    Recommended: 1200x630px for optimal display
                  </p>
                  <label
                    htmlFor="coverImageUpload"
                    className="cursor-pointer inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 text-sm sm:text-base"
                  >
                    {imageUploading ? (
                      <>
                        <Icon
                          icon="ph:spinner"
                          className="animate-spin mr-2 w-4 h-4"
                        />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Icon icon="ph:upload" className="mr-2 w-4 h-4" />
                        Choose Image
                      </>
                    )}
                  </label>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleImageUpload(file, "cover");
                  }
                }}
                className="hidden"
                id="coverImageUpload"
                disabled={imageUploading}
              />
            </div>
            {errors.coverImage && (
              <p className="text-red-500 text-xs sm:text-sm mt-1">
                {errors.coverImage}
              </p>
            )}
          </div>

          {/* Content */}
          <div>
            <label
              htmlFor="content"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Content *
            </label>
            <WysiwygEditor
              value={formData.content}
              onChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  content: value,
                }))
              }
              placeholder="Write your blog content here..."
              error={!!errors.content}
              onImageUpload={handleWysiwygImageUpload}
            />
            {errors.content && (
              <p className="text-red-500 text-xs sm:text-sm mt-1">
                {errors.content}
              </p>
            )}
            <p className="text-gray-500 text-xs sm:text-sm mt-1">
              Use the toolbar to format your content with headings, lists,
              links, and more.
            </p>
          </div>

          {/* Author */}
          <div>
            <AuthorSelector
              value={{
                author: formData.author,
                authorImage: formData.authorImage,
              }}
              onChange={(author) => {
                setFormData((prev) => ({
                  ...prev,
                  author: author.author,
                  authorImage: author.authorImage,
                }));
                // Clear author error if it exists
                if (errors.author) {
                  setErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors.author;
                    return newErrors;
                  });
                }
              }}
              onImageUpload={async (file: File) => {
                setImageUploading(true);
                try {
                  const formDataUpload = new FormData();
                  formDataUpload.append("file", file);

                  const response = await fetch("/api/upload", {
                    method: "POST",
                    body: formDataUpload,
                  });

                  if (response.ok) {
                    const data = await response.json();
                    const imageUrl = data.url;
                    setImageUploading(false);
                    return imageUrl;
                  } else {
                    throw new Error("Failed to upload image");
                  }
                } catch (error) {
                  setImageUploading(false);
                  console.error("Error uploading image:", error);
                  throw error;
                }
              }}
              error={errors.author}
              imageUploading={imageUploading}
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tags
            </label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addTag())
                }
                className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white text-sm sm:text-base"
                placeholder="Add a tag"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm sm:text-base"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 sm:px-3 py-1 text-xs sm:text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full"
                >
                  <span className="truncate max-w-[120px] sm:max-w-none">
                    {tag}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 sm:ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 flex-shrink-0"
                  >
                    <Icon icon="ph:x" className="text-xs sm:text-sm" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Publish Status */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPublished"
              name="isPublished"
              checked={formData.isPublished}
              onChange={handleInputChange}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label
              htmlFor="isPublished"
              className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
            >
              Publish immediately
            </label>
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-600">
            <button
              type="submit"
              disabled={submitLoading}
              className="inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base order-2 sm:order-1"
            >
              {submitLoading ? (
                <Icon icon="ph:spinner" className="animate-spin mr-2 w-4 h-4" />
              ) : (
                <Icon icon="ph:check" className="mr-2 w-4 h-4" />
              )}
              {submitLoading
                ? `${isEdit ? "Updating" : "Creating"}...`
                : `${isEdit ? "Update" : "Create"} Blog`}
            </button>

            <button
              type="button"
              onClick={() => router.push("/admin/blogs")}
              className="inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm sm:text-base order-1 sm:order-2"
            >
              <Icon icon="ph:x" className="mr-2 w-4 h-4" />
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
