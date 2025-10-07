"use client";

import { Icon } from "@iconify/react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "react-hot-toast";

interface PropertyTypeImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  disabled?: boolean;
  className?: string;
}

export default function PropertyTypeImageUpload({
  value,
  onChange,
  disabled = false,
  className = "",
}: PropertyTypeImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFileUpload = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB for property type images)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        onChange(data.url);
        toast.success("Image uploaded successfully!");
      } else {
        const error = await response.json();
        toast.error(error.error || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      await handleFileUpload(file);
    }
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);

    const files = event.dataTransfer.files;
    if (files.length > 0) {
      await handleFileUpload(files[0]);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
  };

  const handleRemove = () => {
    onChange("");
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {value ? (
        <div className="relative">
          <div className="relative h-32 w-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
            <Image
              src={value}
              alt="Property type image"
              fill
              className="object-cover"
              unoptimized={true}
            />
          </div>
          <button
            type="button"
            onClick={handleRemove}
            disabled={disabled || uploading}
            className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-lg transition-colors disabled:opacity-50"
          >
            <Icon icon="ph:x" width={16} height={16} />
          </button>
        </div>
      ) : (
        <div
          className={`relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200 ${
            dragOver
              ? "border-primary bg-primary/5 dark:bg-primary/10"
              : "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <label
            htmlFor="property-type-image-upload"
            className={`flex flex-col items-center justify-center w-full h-full ${
              disabled ? "cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            {uploading ? (
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Uploading...
                </p>
              </div>
            ) : (
              <>
                <Icon
                  icon="ph:cloud-arrow-up"
                  className={`w-8 h-8 mb-2 ${
                    dragOver
                      ? "text-primary"
                      : "text-gray-400 dark:text-gray-500"
                  }`}
                />
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                  <span className="font-medium">Click to upload</span> or drag
                  and drop
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  PNG, JPG, WEBP (Max 5MB)
                </p>
              </>
            )}
          </label>
          <input
            id="property-type-image-upload"
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleInputChange}
            disabled={disabled || uploading}
          />
        </div>
      )}
    </div>
  );
}
