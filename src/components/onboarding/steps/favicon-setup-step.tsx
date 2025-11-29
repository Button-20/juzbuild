"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WizardStepProps } from "@/types/onboarding";
import { ArrowLeft, Upload } from "lucide-react";
import React, { useRef, useState } from "react";

export default function FaviconSetupStep({
  data,
  updateData,
  errors,
  onNext,
  onBack,
}: WizardStepProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 1MB for favicon)
    if (file.size > 1024 * 1024) {
      setUploadError("Favicon size must be less than 1MB");
      return;
    }

    // Validate file type
    const validTypes = ["image/x-icon", "image/png", "image/jpeg", "image/svg+xml"];
    if (!validTypes.includes(file.type)) {
      setUploadError("Please upload a valid favicon format (ICO, PNG, JPG, or SVG)");
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const formDataUpload = new FormData();
      formDataUpload.append("favicon", file);

      const response = await fetch("/api/upload/favicon", {
        method: "POST",
        body: formDataUpload,
      });

      const result = await response.json();

      if (result.success) {
        updateData({ faviconUrl: result.faviconUrl });
      } else {
        setUploadError(result.error || "Upload failed");
      }
    } catch (error: any) {
      setUploadError("Upload failed: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Favicon Upload Section */}
      <div className="space-y-6">
        <div className="border-l-4 border-primary pl-4">
          <h3 className="text-lg font-semibold mb-1">Website Favicon</h3>
          <p className="text-sm text-muted-foreground">
            Upload a favicon that will appear in browser tabs and bookmarks
          </p>
        </div>

        <div className="space-y-4">
          <Label className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Favicon (Optional)
          </Label>

          {/* Favicon Preview */}
          {data.faviconUrl && (
            <div className="p-4 bg-muted/30 rounded-lg border border-border">
              <div className="flex items-center gap-6 justify-between">
                <div>
                  <p className="text-sm font-medium mb-2">Current Favicon:</p>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-full border-2 border-border overflow-hidden flex items-center justify-center bg-white"
                      style={{
                        backgroundImage: `url('${data.faviconUrl}')`,
                        backgroundSize: "contain",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center",
                      }}
                    >
                      <img
                        src={data.faviconUrl}
                        alt="Favicon preview"
                        className="w-10 h-10 object-contain"
                      />
                    </div>
                    <div className="text-sm">
                      <p className="font-medium text-foreground">Preview</p>
                      <p className="text-muted-foreground text-xs">
                        This is how your favicon will appear
                      </p>
                    </div>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? "Uploading..." : "Change"}
                </Button>
              </div>
            </div>
          )}

          {/* Upload Area */}
          {!data.faviconUrl && (
            <div
              className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-16 h-16 mx-auto bg-muted rounded-lg flex items-center justify-center mb-3">
                <Upload className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Click to upload your favicon
              </p>
              <p className="text-xs text-muted-foreground">
                ICO, PNG, JPG, or SVG (max 1MB)
              </p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.ico"
            onChange={handleFaviconUpload}
            className="hidden"
          />

          {uploadError && (
            <p className="text-sm text-red-600 mt-2">{uploadError}</p>
          )}
        </div>

        {/* Favicon Guide */}
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg p-6 space-y-4">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 flex items-center gap-2">
            <span className="text-lg">ℹ️</span>
            Favicon Guide
          </h4>

          <div className="space-y-3">
            <div className="space-y-1">
              <h5 className="font-medium text-sm text-blue-900 dark:text-blue-100">
                📐 Recommended Dimensions
              </h5>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 ml-4 list-disc">
                <li>
                  <strong>Square format:</strong> 192x192px, 256x256px (perfect square)
                </li>
                <li>
                  <strong>ICO format:</strong> 16x16px, 32x32px, 64x64px
                </li>
                <li>
                  <strong>Optimal:</strong> 512x512px PNG (will be auto-sized)
                </li>
              </ul>
            </div>

            <div className="space-y-1">
              <h5 className="font-medium text-sm text-blue-900 dark:text-blue-100">
                🎯 Where Your Favicon Appears
              </h5>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 ml-4 list-disc">
                <li>Browser tab next to your website title</li>
                <li>Bookmarks and favorites bar</li>
                <li>Browser history dropdown</li>
                <li>Address bar (some browsers)</li>
                <li>Mobile home screen shortcuts</li>
              </ul>
            </div>

            <div className="space-y-1">
              <h5 className="font-medium text-sm text-blue-900 dark:text-blue-100">
                💡 Design Tips
              </h5>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 ml-4 list-disc">
                <li>Use your logo or initials for brand recognition</li>
                <li>Ensure it's readable at very small sizes</li>
                <li>Use solid colors or simple shapes</li>
                <li>Avoid overly complex designs</li>
                <li>Test your favicon on multiple browsers</li>
              </ul>
            </div>

            <div className="space-y-1">
              <h5 className="font-medium text-sm text-blue-900 dark:text-blue-100">
                📝 File Format Information
              </h5>
              <div className="text-sm text-blue-800 dark:text-blue-200 grid grid-cols-2 gap-2 ml-4">
                <div>
                  <p>
                    <strong>.ico</strong> - Classic favicon format
                  </p>
                </div>
                <div>
                  <p>
                    <strong>.png</strong> - Modern, transparent
                  </p>
                </div>
                <div>
                  <p>
                    <strong>.jpg</strong> - Simple, compressed
                  </p>
                </div>
                <div>
                  <p>
                    <strong>.svg</strong> - Scalable, flexible
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t">
        <Button variant="outline" onClick={onBack} size="lg" className="px-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button onClick={onNext} size="lg" className="px-8">
          Continue
        </Button>
      </div>
    </div>
  );
}
