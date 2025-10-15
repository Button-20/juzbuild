"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ImageIcon, PlusIcon, UploadIcon, XIcon } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";

interface PropertyImage {
  src: string;
  alt?: string;
  isMain?: boolean;
}

interface ImageUploadProps {
  images: PropertyImage[];
  onImagesChange: (images: PropertyImage[]) => void;
  maxImages?: number;
}

export function ImageUpload({
  images,
  onImagesChange,
  maxImages = 10,
}: ImageUploadProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [urlInput, setUrlInput] = useState("");
  const [altInput, setAltInput] = useState("");
  const [uploading, setUploading] = useState(false);

  // Handle file upload
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    if (images.length + files.length > maxImages) {
      toast({
        title: "Too many images",
        description: `Maximum ${maxImages} images allowed`,
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const newImages: PropertyImage[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Validate file type
        if (!file.type.startsWith("image/")) {
          toast({
            title: "Invalid file type",
            description: "Please upload only image files",
            variant: "destructive",
          });
          continue;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
          toast({
            title: "File too large",
            description: "Please upload images smaller than 5MB",
            variant: "destructive",
          });
          continue;
        }

        // Convert to base64 for now (in production, you'd upload to a cloud service)
        const base64 = await fileToBase64(file);
        newImages.push({
          src: base64,
          alt: file.name,
          isMain: images.length === 0 && newImages.length === 0,
        });
      }

      onImagesChange([...images, ...newImages]);

      if (newImages.length > 0) {
        toast({
          title: "Images uploaded",
          description: `${newImages.length} image(s) uploaded successfully`,
        });
      }
    } catch (error) {
      console.error("Error uploading images:", error);
      toast({
        title: "Upload failed",
        description: "Failed to upload images. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Handle URL input
  const addImageFromUrl = () => {
    if (!urlInput.trim()) return;

    if (images.length >= maxImages) {
      toast({
        title: "Maximum images reached",
        description: `You can only add up to ${maxImages} images`,
        variant: "destructive",
      });
      return;
    }

    const newImage: PropertyImage = {
      src: urlInput.trim(),
      alt: altInput.trim() || undefined,
      isMain: images.length === 0,
    };

    onImagesChange([...images, newImage]);
    setUrlInput("");
    setAltInput("");
  };

  // Remove image
  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);

    // If we removed the main image, set the first remaining image as main
    if (images[index]?.isMain && updatedImages.length > 0) {
      updatedImages[0] = { ...updatedImages[0], isMain: true };
    }

    onImagesChange(updatedImages);
  };

  // Set main image
  const setMainImage = (index: number) => {
    const updatedImages = images.map((img, i) => ({
      ...img,
      isMain: i === index,
    }));
    onImagesChange(updatedImages);
  };

  return (
    <div className="space-y-4">
      {/* Upload Controls */}
      <div className="space-y-3">
        {/* File Upload */}
        <div>
          <Label className="text-sm font-medium mb-2 block">
            Upload Images
          </Label>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || images.length >= maxImages}
              className="flex-1"
            >
              <UploadIcon className="mr-2 h-4 w-4" />
              {uploading ? "Uploading..." : "Choose Files"}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFileUpload(e.target.files)}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Upload up to {maxImages} images. Max 5MB each. Supports JPG, PNG,
            WebP.
          </p>
        </div>

        {/* URL Input */}
        <div>
          <Label className="text-sm font-medium mb-2 block">
            Or Add from URL
          </Label>
          <div className="flex gap-2">
            <Input
              placeholder="Image URL"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="flex-1"
            />
            <Input
              placeholder="Alt text (optional)"
              value={altInput}
              onChange={(e) => setAltInput(e.target.value)}
              className="w-40"
            />
            <Button
              type="button"
              onClick={addImageFromUrl}
              disabled={!urlInput.trim() || images.length >= maxImages}
            >
              <PlusIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative border rounded-lg p-2 group">
              <div className="relative w-full h-32 rounded overflow-hidden bg-gray-100">
                <Image
                  src={image.src}
                  alt={image.alt || `Property image ${index + 1}`}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/images/placeholder.jpg";
                  }}
                />
              </div>

              {/* Overlay Controls */}
              <div className="absolute top-1 right-1 flex gap-1">
                {image.isMain && (
                  <Badge variant="secondary" className="text-xs">
                    Main
                  </Badge>
                )}
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeImage(index)}
                >
                  <XIcon className="h-3 w-3" />
                </Button>
              </div>

              {/* Set as Main Button */}
              {!image.isMain && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full mt-2 text-xs"
                  onClick={() => setMainImage(index)}
                >
                  Set as Main
                </Button>
              )}

              {/* Alt Text Display */}
              {image.alt && (
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {image.alt}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {images.length === 0 && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <ImageIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
          <p className="text-sm text-gray-600 mb-2">No images added yet</p>
          <p className="text-xs text-gray-500">
            Upload images or add them from URLs to showcase your property
          </p>
        </div>
      )}
    </div>
  );
}
