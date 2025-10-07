"use client";

import ImageUpload from "@/components/ui/ImageUpload";
import {
  HomeIcon,
  PlusIcon,
  StarIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

const propertySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  location: z.string().min(1, "Location is required"),
  price: z.number().min(0, "Price must be positive"),
  currency: z.string().min(1, "Currency is required"),
  propertyType: z.string().min(1, "Property type is required"),
  status: z.enum(["for-sale", "for-rent", "sold", "rented"]),
  beds: z.number().min(0, "Beds must be non-negative"),
  baths: z.number().min(0, "Baths must be non-negative"),
  area: z.number().min(0, "Area must be positive"),
  amenities: z.array(z.object({ value: z.string() })),
  features: z.array(z.object({ value: z.string() })),
  isFeatured: z.boolean(),
  images: z
    .array(
      z.object({
        src: z.string().min(1, "Image URL is required"),
        alt: z.string(),
        isMain: z.boolean(),
      })
    )
    .optional(),
});

type PropertyFormData = z.infer<typeof propertySchema>;

interface PropertyType {
  _id: string;
  name: string;
  slug: string;
  isActive: boolean;
}

interface PropertyFormProps {
  initialData?: any;
  isEdit?: boolean;
  propertyId?: string;
}

export default function PropertyForm({
  initialData,
  isEdit = false,
  propertyId,
}: PropertyFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);
  const [loadingPropertyTypes, setLoadingPropertyTypes] = useState(true);
  const isInitialized = useRef(false);

  // Fetch property types
  useEffect(() => {
    const fetchPropertyTypes = async () => {
      try {
        const response = await fetch("/api/admin/property-types");
        if (response.ok) {
          const data = await response.json();
          setPropertyTypes(data.propertyTypes || []);
        }
      } catch (error) {
        console.error("Error fetching property types:", error);
        toast.error("Failed to load property types");
      } finally {
        setLoadingPropertyTypes(false);
      }
    };

    fetchPropertyTypes();
  }, []);

  // Prepare default values, using initialData if provided
  const getDefaultValues = (): Partial<PropertyFormData> => {
    if (initialData && isEdit) {
      // Handle different propertyType formats: object with _id, string ID, or null/undefined
      let propertyTypeValue = "";

      if (initialData.propertyType) {
        if (
          typeof initialData.propertyType === "object" &&
          initialData.propertyType._id
        ) {
          propertyTypeValue = initialData.propertyType._id;
        } else if (typeof initialData.propertyType === "string") {
          propertyTypeValue = initialData.propertyType;
        }
      }

      return {
        name: initialData.name || "",
        description: initialData.description || "",
        location: initialData.location || "",
        price: initialData.price || 0,
        currency: initialData.currency || "GHS",
        propertyType: propertyTypeValue, // Will be empty string if null
        status:
          (initialData.status as "for-sale" | "for-rent" | "sold" | "rented") ||
          "for-sale",
        beds: initialData.beds || 0,
        baths: initialData.baths || 0,
        area: initialData.area || 0,
        amenities:
          initialData.amenities?.map((item: string) => ({ value: item })) || [],
        features:
          initialData.features?.map((item: string) => ({ value: item })) || [],
        images: initialData.images || [],
        isFeatured: initialData.isFeatured || false,
      };
    }

    return {
      name: "",
      description: "",
      location: "",
      price: 0,
      currency: "GHS", // Default to Ghana Cedis
      propertyType: "",
      status: "for-sale",
      beds: 0,
      baths: 0,
      area: 0,
      amenities: [],
      features: [],
      images: [],
      isFeatured: false,
    };
  };

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: getDefaultValues(),
  });

  // Watch the current property type value for debugging
  const currentPropertyType = watch("propertyType");

  // Reset form values when initialData changes (for edit mode)
  useEffect(() => {
    if (
      initialData &&
      isEdit &&
      !loadingPropertyTypes &&
      propertyTypes.length > 0
    ) {
      // Handle different propertyType formats: object with _id, string ID, or null/undefined
      let propertyTypeValue = "";

      if (initialData.propertyType) {
        if (
          typeof initialData.propertyType === "object" &&
          initialData.propertyType._id
        ) {
          propertyTypeValue = initialData.propertyType._id;
        } else if (typeof initialData.propertyType === "string") {
          propertyTypeValue = initialData.propertyType;
        }
      }

      const formData = {
        name: initialData.name || "",
        description: initialData.description || "",
        location: initialData.location || "",
        price: initialData.price || 0,
        currency: initialData.currency || "GHS",
        propertyType: propertyTypeValue, // Will be empty string if null
        status:
          (initialData.status as "for-sale" | "for-rent" | "sold" | "rented") ||
          "for-sale",
        beds: initialData.beds || 0,
        baths: initialData.baths || 0,
        area: initialData.area || 0,
        amenities:
          initialData.amenities?.map((item: string) => ({ value: item })) || [],
        features:
          initialData.features?.map((item: string) => ({ value: item })) || [],
        images: initialData.images || [],
        isFeatured: initialData.isFeatured || false,
      };

      // Reset the form - this should work with useFieldArray
      reset(formData);
    }
  }, [initialData, isEdit, reset, propertyTypes, loadingPropertyTypes]);

  // Backup: Ensure property type is properly set after property types are loaded
  // This is a fallback in case the reset doesn't work properly
  useEffect(() => {
    const currentValue = watch("propertyType");

    if (
      !loadingPropertyTypes &&
      initialData &&
      isEdit &&
      propertyTypes.length > 0 &&
      !currentValue // Only run if current value is empty
    ) {
      // Handle different propertyType formats: object with _id, string ID, or null/undefined
      let propertyTypeId = "";

      if (initialData.propertyType) {
        if (
          typeof initialData.propertyType === "object" &&
          initialData.propertyType._id
        ) {
          propertyTypeId = initialData.propertyType._id;
        } else if (typeof initialData.propertyType === "string") {
          propertyTypeId = initialData.propertyType;
        }
      }

      if (propertyTypeId) {
        setValue("propertyType", propertyTypeId, {
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true,
        });
      }
    }
  }, [
    loadingPropertyTypes,
    propertyTypes,
    initialData,
    isEdit,
    setValue,
    watch,
  ]);

  const {
    fields: amenityFields,
    append: appendAmenity,
    remove: removeAmenity,
  } = useFieldArray({
    control,
    name: "amenities",
  });

  const {
    fields: featureFields,
    append: appendFeature,
    remove: removeFeature,
  } = useFieldArray({
    control,
    name: "features",
  });

  const {
    fields: imageFields,
    append: appendImage,
    remove: removeImage,
  } = useFieldArray({
    control,
    name: "images",
  });

  // Effect to handle image fields when editing
  useEffect(() => {
    // This effect can be extended for image field handling if needed
  }, [imageFields, isEdit, watch]);

  const onSubmit = async (data: PropertyFormData) => {
    setIsSubmitting(true);
    try {
      // Transform the data to match the API expectations
      const transformedData = {
        ...data,
        amenities: data.amenities.map((item) => item.value),
        features: data.features.map((item) => item.value),
      };

      const url = isEdit
        ? `/api/admin/properties/${propertyId}`
        : "/api/admin/properties";
      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transformedData),
      });

      if (response.ok) {
        toast.success(
          isEdit
            ? "Property updated successfully!"
            : "Property created successfully!"
        );
        router.push("/admin/properties");
      } else {
        const error = await response.json();
        toast.error(
          error.error || `Failed to ${isEdit ? "update" : "create"} property`
        );
      }
    } catch (error) {
      console.error("PropertyForm - submission error:", error);
      toast.error(
        `An error occurred while ${
          isEdit ? "updating" : "creating"
        } the property`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 shadow rounded-lg">
      <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
          {isEdit ? "Edit Property" : "Add New Property"}
        </h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-4 sm:p-6 space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Property Name *
            </label>
            <input
              type="text"
              {...register("name")}
              className="block w-full px-3 sm:px-4 py-2 sm:py-3 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm sm:text-base"
              placeholder="Enter property name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Location *
            </label>
            <input
              type="text"
              {...register("location")}
              className="block w-full px-3 sm:px-4 py-2 sm:py-3 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm sm:text-base"
              placeholder="Enter property location"
            />
            {errors.location && (
              <p className="mt-1 text-sm text-red-600">
                {errors.location.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description *
          </label>
          <textarea
            rows={4}
            {...register("description")}
            className="block w-full px-3 sm:px-4 py-2 sm:py-3 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm sm:text-base"
            placeholder="Enter property description"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Property Details */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Price *
            </label>
            <input
              type="number"
              step="0.01"
              {...register("price", { valueAsNumber: true })}
              className="block w-full px-3 sm:px-4 py-2 sm:py-3 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm sm:text-base"
              placeholder="0"
            />
            {errors.price && (
              <p className="mt-1 text-sm text-red-600">
                {errors.price.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Currency
            </label>
            <select
              {...register("currency")}
              className="block w-full px-3 sm:px-4 py-2 sm:py-3 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm sm:text-base"
            >
              <option value="GHS">GHS (Ghana Cedis)</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="CAD">CAD</option>
              <option value="AUD">AUD</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Property Type *
            </label>
            <Controller
              name="propertyType"
              control={control}
              render={({ field: { value, onChange, ...field } }) => (
                <select
                  {...field}
                  value={value || ""}
                  onChange={(e) => {
                    onChange(e.target.value);
                  }}
                  className="block w-full px-3 sm:px-4 py-2 sm:py-3 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm sm:text-base"
                  disabled={loadingPropertyTypes}
                >
                  <option value="">
                    {loadingPropertyTypes
                      ? "Loading..."
                      : "Select Property Type"}
                  </option>
                  {propertyTypes
                    .filter((type) => type.isActive)
                    .map((type) => (
                      <option key={type._id} value={type._id}>
                        {type.name}
                      </option>
                    ))}
                </select>
              )}
            />
            {errors.propertyType && (
              <p className="mt-1 text-sm text-red-600">
                {errors.propertyType.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status *
            </label>
            <select
              {...register("status")}
              className="block w-full px-3 sm:px-4 py-2 sm:py-3 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm sm:text-base"
            >
              <option value="for-sale">For Sale</option>
              <option value="for-rent">For Rent</option>
              <option value="sold">Sold</option>
              <option value="rented">Rented</option>
            </select>
            {errors.status && (
              <p className="mt-1 text-sm text-red-600">
                {errors.status.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Bedrooms
            </label>
            <input
              type="number"
              min="0"
              {...register("beds", { valueAsNumber: true })}
              className="block w-full px-3 sm:px-4 py-2 sm:py-3 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm sm:text-base"
              placeholder="0"
            />
            {errors.beds && (
              <p className="mt-1 text-sm text-red-600">{errors.beds.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Bathrooms
            </label>
            <input
              type="number"
              min="0"
              step="0.5"
              {...register("baths", { valueAsNumber: true })}
              className="block w-full px-3 sm:px-4 py-2 sm:py-3 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm sm:text-base"
              placeholder="0"
            />
            {errors.baths && (
              <p className="mt-1 text-sm text-red-600">
                {errors.baths.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Area (sq ft)
            </label>
            <input
              type="number"
              min="0"
              {...register("area", { valueAsNumber: true })}
              className="block w-full px-3 sm:px-4 py-2 sm:py-3 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm sm:text-base"
              placeholder="0"
            />
            {errors.area && (
              <p className="mt-1 text-sm text-red-600">{errors.area.message}</p>
            )}
          </div>
        </div>

        {/* Images Section */}
        <div className="space-y-4">
          <div className="flex flex-col space-y-3 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
            <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white">
              Property Images
            </h3>
            <button
              type="button"
              onClick={() => appendImage({ src: "", alt: "", isMain: false })}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Add Image
            </button>
          </div>

          {imageFields.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p className="text-sm sm:text-base">
                No images added yet. Click &quot;Add Image&quot; to start
                uploading.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6">
            {imageFields.map((field, index) => (
              <div
                key={field.id}
                className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg space-y-4"
              >
                <ImageUpload
                  value={watch(`images.${index}.src`)}
                  onChange={(url, altText) => {
                    setValue(`images.${index}.src`, url);
                    if (altText) {
                      setValue(`images.${index}.alt`, altText);
                    }
                  }}
                  onRemove={() => removeImage(index)}
                  isMain={watch(`images.${index}.isMain`)}
                  onMainToggle={(isMain) => {
                    // If setting as main, unset all other images as main
                    if (isMain) {
                      imageFields.forEach((_, i) => {
                        if (i !== index) {
                          setValue(`images.${i}.isMain`, false);
                        }
                      });
                    }
                    setValue(`images.${index}.isMain`, isMain);
                  }}
                  disabled={isSubmitting}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Alt Text (for accessibility)
                  </label>
                  <input
                    type="text"
                    {...register(`images.${index}.alt`)}
                    className="block w-full px-3 sm:px-4 py-2 sm:py-3 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm sm:text-base"
                    placeholder="Describe the image"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="flex justify-end items-center">
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    disabled={isSubmitting}
                    className="inline-flex items-center px-2 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Amenities Section */}
        <div className="space-y-6">
          <div className="flex flex-col space-y-3 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
            <div className="flex items-center space-x-2">
              <StarIcon className="h-6 w-6 text-indigo-600" />
              <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white">
                Amenities
              </h3>
            </div>
            <button
              type="button"
              onClick={() => appendAmenity({ value: "" })}
              className="inline-flex items-center px-3 sm:px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm transition-all duration-200"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Amenity
            </button>
          </div>

          {amenityFields.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
              <StarIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-sm">
                No amenities added yet. Click &quot;Add Amenity&quot; to start
                adding property amenities.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            {amenityFields.map((field, index) => (
              <div
                key={field.id}
                className="relative group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-3 sm:p-4 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                      <StarIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      {...register(`amenities.${index}.value`)}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm placeholder-gray-400"
                      placeholder="e.g., Swimming Pool, Gym, Parking"
                      disabled={isSubmitting}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAmenity(index)}
                    disabled={isSubmitting}
                    className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 focus:outline-none focus:text-red-500 transition-colors duration-200"
                    title="Remove amenity"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {amenityFields.length > 0 && (
            <div className="flex flex-wrap gap-2 p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Preview:
              </span>
              {amenityFields.map((field, index) => {
                const value = watch(`amenities.${index}.value`);
                return value ? (
                  <span
                    key={field.id}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
                  >
                    <StarIcon className="h-3 w-3 mr-1" />
                    {value}
                  </span>
                ) : null;
              })}
            </div>
          )}
        </div>

        {/* Features Section */}
        <div className="space-y-6">
          <div className="flex flex-col space-y-3 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
            <div className="flex items-center space-x-2">
              <HomeIcon className="h-6 w-6 text-emerald-600" />
              <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white">
                Features
              </h3>
            </div>
            <button
              type="button"
              onClick={() => appendFeature({ value: "" })}
              className="inline-flex items-center px-3 sm:px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 shadow-sm transition-all duration-200"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Feature
            </button>
          </div>

          {featureFields.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
              <HomeIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-sm">
                No features added yet. Click &quot;Add Feature&quot; to start
                adding property features.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            {featureFields.map((field, index) => (
              <div
                key={field.id}
                className="relative group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-3 sm:p-4 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center">
                      <HomeIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      {...register(`features.${index}.value`)}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 text-sm placeholder-gray-400"
                      placeholder="e.g., Balcony, Fireplace, Walk-in Closet"
                      disabled={isSubmitting}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    disabled={isSubmitting}
                    className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 focus:outline-none focus:text-red-500 transition-colors duration-200"
                    title="Remove feature"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {featureFields.length > 0 && (
            <div className="flex flex-wrap gap-2 p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Preview:
              </span>
              {featureFields.map((field, index) => {
                const value = watch(`features.${index}.value`);
                return value ? (
                  <span
                    key={field.id}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"
                  >
                    <HomeIcon className="h-3 w-3 mr-1" />
                    {value}
                  </span>
                ) : null;
              })}
            </div>
          )}
        </div>

        {/* Featured Property Checkbox */}
        <div className="flex items-center">
          <input
            type="checkbox"
            {...register("isFeatured")}
            className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
          <label className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            Mark as Featured Property
          </label>
        </div>

        {/* Submit Button */}
        <div className="flex flex-col space-y-3 sm:flex-row sm:justify-end sm:space-y-0 sm:space-x-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
              "Update Property"
            ) : (
              "Create Property"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
