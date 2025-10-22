"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ImageIcon, Loader2, XIcon } from "lucide-react";
import Image from "next/image";
import { DragEvent, useRef, useState } from "react";

interface TestimonialImageUploadProps {
  value: string;
  onChange: (imageUrl: string) => void;
  disabled?: boolean;
}

export function TestimonialImageUpload({
  value,
  onChange,
  disabled = false,
}: TestimonialImageUploadProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [urlInput, setUrlInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload only image files",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload images smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/upload/testimonial-image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Upload failed");
      }

      const result = await response.json();
      onChange(result.imageUrl);

      toast({
        title: "Success",
        description: "Profile image uploaded successfully",
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Upload failed",
        description:
          error instanceof Error ? error.message : "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleUrlSubmit = () => {
    if (!urlInput.trim()) return;

    // Basic URL validation
    try {
      new URL(urlInput);
      onChange(urlInput.trim());
      setUrlInput("");
      toast({
        title: "Success",
        description: "Profile image URL added successfully",
      });
    } catch {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid image URL",
        variant: "destructive",
      });
    }
  };

  const handleRemoveImage = () => {
    onChange("");
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !uploading) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (disabled || uploading) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileUpload(files);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid w-full items-center gap-1.5">
        <Label className="mb-2">Profile Image</Label>

        {/* Current Image Preview */}
        {value && (
          <div className="relative w-24 h-24 mx-auto mb-2">
            <div className="w-24 h-24 border-2 border-border rounded-full overflow-hidden bg-muted">
              <Image
                src={value}
                alt="Profile preview"
                fill
                className="object-cover"
                sizes="96px"
              />
            </div>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute -top-2 -right-2 h-7 w-7 p-0 rounded-full shadow-lg border-2 border-white hover:scale-110 transition-transform"
              onClick={handleRemoveImage}
              disabled={disabled || uploading}
            >
              <XIcon className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Drag and Drop Area */}
        <div
          className={`
            relative border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer
            ${
              isDragOver
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25"
            }
            ${
              disabled || uploading
                ? "opacity-50 cursor-not-allowed"
                : "hover:border-primary hover:bg-accent/50"
            }
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() =>
            !disabled && !uploading && fileInputRef.current?.click()
          }
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleFileUpload(e.target.files)}
            className="hidden"
            disabled={disabled || uploading}
          />

          <div className="flex flex-col items-center gap-1.5">
            {uploading ? (
              <>
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <p className="text-sm font-medium">Uploading...</p>
              </>
            ) : (
              <>
                <ImageIcon className="h-6 w-6 text-muted-foreground" />
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm font-medium">
                    Drag and drop an image here, or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Supports: JPG, PNG, GIF (max 5MB)
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* URL Input */}
        <div className="flex gap-2 mt-3">
          <div className="flex-1">
            <Input
              placeholder="Or paste an image URL..."
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              disabled={disabled || uploading}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleUrlSubmit();
                }
              }}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={handleUrlSubmit}
            disabled={disabled || uploading || !urlInput.trim()}
          >
            Add URL
          </Button>
        </div>
      </div>
    </div>
  );
}
