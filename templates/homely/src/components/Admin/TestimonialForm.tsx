"use client";

import { CloudArrowUpIcon, StarIcon } from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

const testimonialSchema = z.object({
  name: z.string().min(1, "Name is required"),
  role: z.string().min(1, "Role is required"),
  company: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters"),
  image: z.string().min(1, "Image is required"),
  rating: z.number().min(1).max(5),
  isActive: z.boolean(),
  order: z.number().min(1, "Order must be at least 1"),
});

type TestimonialFormData = z.infer<typeof testimonialSchema>;

interface TestimonialFormProps {
  initialData?: any;
  isEdit?: boolean;
  testimonialId?: string;
}

export default function TestimonialForm({
  initialData,
  isEdit = false,
  testimonialId,
}: TestimonialFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<"upload" | "url">("upload");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Prepare default values
  const getDefaultValues = (): Partial<TestimonialFormData> => {
    if (initialData && isEdit) {
      return {
        name: initialData.name || "",
        role: initialData.role || "",
        company: initialData.company || "",
        message: initialData.message || "",
        image: initialData.image || "",
        rating: initialData.rating || 5,
        isActive:
          initialData.isActive !== undefined ? initialData.isActive : true,
        order: initialData.order || 1,
      };
    }

    return {
      name: "",
      role: "",
      company: "",
      message: "",
      image: "",
      rating: 5,
      isActive: true,
      order: 1,
    };
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<TestimonialFormData>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: getDefaultValues(),
  });

  const watchedRating = watch("rating");

  const onSubmit = async (data: TestimonialFormData) => {
    setIsSubmitting(true);
    try {
      const url = isEdit
        ? `/api/admin/testimonials/${testimonialId}`
        : "/api/admin/testimonials";
      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success(
          isEdit
            ? "Testimonial updated successfully!"
            : "Testimonial created successfully!"
        );
        router.push("/admin/testimonials");
      } else {
        const error = await response.json();
        toast.error(
          error.error || `Failed to ${isEdit ? "update" : "create"} testimonial`
        );
      }
    } catch (error) {
      toast.error(
        `An error occurred while ${
          isEdit ? "updating" : "creating"
        } the testimonial`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/upload/image", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setValue("image", result.imageUrl);
        toast.success("Image uploaded successfully!");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to upload image");
      }
    } catch (error) {
      toast.error("An error occurred while uploading the image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const renderStarRating = () => {
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setValue("rating", i + 1)}
            className={`h-8 w-8 ${
              i < watchedRating ? "text-yellow-400" : "text-gray-300"
            } hover:text-yellow-400 transition-colors`}
          >
            <StarIcon className="h-full w-full fill-current" />
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
          {watchedRating}/5
        </span>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {isEdit ? "Edit Testimonial" : "Add New Testimonial"}
        </h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Name *
            </label>
            <input
              type="text"
              {...register("name")}
              className="mt-1 block w-full px-4 py-3 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Enter person's name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Role *
            </label>
            <input
              type="text"
              {...register("role")}
              className="mt-1 block w-full px-4 py-3 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="e.g., Property Investor"
            />
            {errors.role && (
              <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Company
            </label>
            <input
              type="text"
              {...register("company")}
              className="mt-1 block w-full px-4 py-3 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Company name (optional)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Order
            </label>
            <input
              type="number"
              min="1"
              {...register("order", { valueAsNumber: true })}
              className="mt-1 block w-full px-4 py-3 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Display order"
            />
            {errors.order && (
              <p className="mt-1 text-sm text-red-600">
                {errors.order.message}
              </p>
            )}
          </div>
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Testimonial Message *
          </label>
          <textarea
            rows={4}
            {...register("message")}
            className="mt-1 block w-full px-4 py-3 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Enter the testimonial message..."
          />
          {errors.message && (
            <p className="mt-1 text-sm text-red-600">
              {errors.message.message}
            </p>
          )}
        </div>

        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Rating *
          </label>
          {renderStarRating()}
          {errors.rating && (
            <p className="mt-1 text-sm text-red-600">{errors.rating.message}</p>
          )}
        </div>

        {/* Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Profile Image *
          </label>

          {/* Upload Method Toggle */}
          <div className="flex mb-4">
            <button
              type="button"
              onClick={() => setUploadMethod("upload")}
              className={`px-4 py-2 rounded-l-md text-sm font-medium transition-colors ${
                uploadMethod === "upload"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500"
              }`}
            >
              Upload File
            </button>
            <button
              type="button"
              onClick={() => setUploadMethod("url")}
              className={`px-4 py-2 rounded-r-md text-sm font-medium transition-colors ${
                uploadMethod === "url"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500"
              }`}
            >
              Image URL
            </button>
          </div>

          {uploadMethod === "upload" ? (
            <div>
              {/* File Upload */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 hover:border-indigo-500 dark:hover:border-indigo-400 cursor-pointer transition-colors"
              >
                <div className="text-center">
                  {isUploading ? (
                    <div className="flex flex-col items-center">
                      <svg
                        className="animate-spin h-8 w-8 text-indigo-600 mb-2"
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
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Uploading...
                      </p>
                    </div>
                  ) : (
                    <>
                      <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          PNG, JPG, WEBP up to 5MB
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div>
              {/* URL Input */}
              <input
                type="url"
                {...register("image")}
                className="block w-full px-4 py-3 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="https://example.com/image.jpg"
              />
            </div>
          )}

          {errors.image && (
            <p className="mt-1 text-sm text-red-600">{errors.image.message}</p>
          )}

          {/* Image Preview */}
          {watch("image") && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Preview:
              </p>
              <div className="flex items-center space-x-4">
                <img
                  src={watch("image")}
                  alt="Preview"
                  className="h-20 w-20 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400 break-all">
                    {watch("image")}
                  </p>
                  <button
                    type="button"
                    onClick={() => setValue("image", "")}
                    className="mt-1 text-xs text-red-600 hover:text-red-800 transition-colors"
                  >
                    Remove image
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Status */}
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              {...register("isActive")}
              className="rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Active (visible on website)
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                {isEdit ? "Updating..." : "Creating..."}
              </>
            ) : isEdit ? (
              "Update Testimonial"
            ) : (
              "Create Testimonial"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
