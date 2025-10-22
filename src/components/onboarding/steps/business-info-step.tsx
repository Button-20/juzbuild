"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { WizardStepProps } from "@/types/onboarding";
import {
  ArrowLeft,
  FileText,
  MessageSquare,
  Palette,
  Upload,
} from "lucide-react";
import React, { useRef, useState } from "react";

const PRESET_COLORS = [
  "#3B82F6", // Blue
  "#EF4444", // Red
  "#10B981", // Green
  "#F59E0B", // Amber
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#06B6D4", // Cyan
  "#84CC16", // Lime
  "#F97316", // Orange
  "#6366F1", // Indigo
];

export default function BusinessInfoStep({
  data,
  updateData,
  errors,
  onNext,
  onBack,
  isFirst,
  isStepValid,
}: WizardStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      // Create FormData for the API call
      const formData = new FormData();
      formData.append("logo", file);

      // Upload to Cloudinary via our API
      const response = await fetch("/api/upload/logo", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        // Update the data with the Cloudinary URL
        updateData({ logoUrl: result.logoUrl });
      } else {
        setUploadError(result.error || "Upload failed");
      }
    } catch (error: any) {
      setUploadError("Upload failed: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleColorToggle = (color: string) => {
    const currentColors = data.brandColors || [];
    if (currentColors.includes(color)) {
      updateData({
        brandColors: currentColors.filter((c) => c !== color),
      });
    } else if (currentColors.length < 3) {
      updateData({
        brandColors: [...currentColors, color],
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Logo Upload */}
      <div className="space-y-6">
        <div className="border-l-4 border-primary pl-4">
          <h3 className="text-lg font-semibold mb-1">Brand Assets</h3>
          <p className="text-sm text-muted-foreground">
            Upload your logo and choose brand colors
          </p>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Logo Upload (Optional)
          </Label>
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
            {data.logoUrl ? (
              <div className="space-y-2">
                <div className="w-16 h-16 mx-auto bg-muted rounded-lg overflow-hidden">
                  <img
                    src={data.logoUrl}
                    alt="Brand Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <p className="text-sm font-medium">Logo uploaded</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? "Uploading..." : "Change Logo"}
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="w-16 h-16 mx-auto bg-muted rounded-lg flex items-center justify-center">
                  <Upload className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Click to upload your logo
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? "Uploading..." : "Choose File"}
                </Button>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
          </div>
          {uploadError && (
            <p className="text-sm text-red-600 mt-2">{uploadError}</p>
          )}
        </div>

        {/* Brand Colors */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Brand Colors (Select up to 3)
          </Label>
          <div className="grid grid-cols-5 gap-3">
            {PRESET_COLORS.map((color) => {
              const isSelected = data.brandColors?.includes(color);
              return (
                <button
                  key={color}
                  type="button"
                  className={`w-12 h-12 rounded-lg border-2 transition-all ${
                    isSelected
                      ? "border-primary shadow-lg scale-110"
                      : "border-border hover:border-primary/50"
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => handleColorToggle(color)}
                  disabled={!isSelected && (data.brandColors?.length || 0) >= 3}
                />
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground">
            Selected: {data.brandColors?.length || 0}/3 colors
          </p>
        </div>
      </div>

      {/* Business Description */}
      <div className="space-y-6">
        <div className="border-l-4 border-primary pl-4">
          <h3 className="text-lg font-semibold mb-1">Business Description</h3>
          <p className="text-sm text-muted-foreground">
            Tell visitors about your business
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Tagline */}
          <div className="space-y-2">
            <Label htmlFor="tagline" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Tagline/Slogan *
            </Label>
            <Input
              id="tagline"
              placeholder="Your trusted partner in real estate"
              value={data.tagline || ""}
              onChange={(e) => updateData({ tagline: e.target.value })}
              className={`h-12 ${errors.tagline ? "border-destructive" : ""}`}
            />
            {errors.tagline && (
              <p className="text-destructive text-sm">{errors.tagline}</p>
            )}
          </div>

          {/* About Section */}
          <div className="space-y-2">
            <Label htmlFor="aboutSection" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              About Your Business *
            </Label>
            <Textarea
              id="aboutSection"
              placeholder="Describe your business, services, and what makes you unique..."
              value={data.aboutSection || ""}
              onChange={(e) => updateData({ aboutSection: e.target.value })}
              className={`min-h-32 resize-none ${
                errors.aboutSection ? "border-destructive" : ""
              }`}
            />
            {errors.aboutSection && (
              <p className="text-destructive text-sm">{errors.aboutSection}</p>
            )}
            <p className="text-xs text-muted-foreground">
              This will appear on your website's About Us section
            </p>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-6">
        <div className="border-l-4 border-primary pl-4">
          <h3 className="text-lg font-semibold mb-1">Contact Information</h3>
          <p className="text-sm text-muted-foreground">
            How can clients reach you? (Optional but recommended)
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Support Email */}
          <div className="space-y-2">
            <Label htmlFor="supportEmail">Support Email</Label>
            <Input
              id="supportEmail"
              type="email"
              placeholder="support@yourcompany.com"
              value={data.supportEmail || ""}
              onChange={(e) => updateData({ supportEmail: e.target.value })}
              className="h-12"
            />
            <p className="text-xs text-muted-foreground">
              For customer support inquiries
            </p>
          </div>

          {/* WhatsApp Number */}
          <div className="space-y-2">
            <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
            <Input
              id="whatsappNumber"
              type="tel"
              placeholder="+1234567890"
              value={data.whatsappNumber || ""}
              onChange={(e) => updateData({ whatsappNumber: e.target.value })}
              className="h-12"
            />
            <p className="text-xs text-muted-foreground">
              Include country code (e.g., +1, +44, +233)
            </p>
          </div>

          {/* Address */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address">Business Address</Label>
            <Input
              id="address"
              placeholder="123 Business St, City, State, Country"
              value={data.address || ""}
              onChange={(e) => updateData({ address: e.target.value })}
              className="h-12"
            />
            <p className="text-xs text-muted-foreground">
              Your business location or service area
            </p>
          </div>
        </div>
      </div>

      {/* Social Media Links */}
      <div className="space-y-6">
        <div className="border-l-4 border-primary pl-4">
          <h3 className="text-lg font-semibold mb-1">
            Social Media (Optional)
          </h3>
          <p className="text-sm text-muted-foreground">
            Connect your social media profiles
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Facebook */}
          <div className="space-y-2">
            <Label htmlFor="facebookUrl">Facebook Page</Label>
            <Input
              id="facebookUrl"
              placeholder="https://facebook.com/yourpage"
              value={data.facebookUrl || ""}
              onChange={(e) => updateData({ facebookUrl: e.target.value })}
              className="h-12"
            />
          </div>

          {/* Instagram */}
          <div className="space-y-2">
            <Label htmlFor="instagramUrl">Instagram Profile</Label>
            <Input
              id="instagramUrl"
              placeholder="https://instagram.com/yourprofile"
              value={data.instagramUrl || ""}
              onChange={(e) => updateData({ instagramUrl: e.target.value })}
              className="h-12"
            />
          </div>

          {/* Twitter */}
          <div className="space-y-2">
            <Label htmlFor="twitterUrl">Twitter Profile</Label>
            <Input
              id="twitterUrl"
              placeholder="https://twitter.com/yourprofile"
              value={data.twitterUrl || ""}
              onChange={(e) => updateData({ twitterUrl: e.target.value })}
              className="h-12"
            />
          </div>

          {/* LinkedIn */}
          <div className="space-y-2">
            <Label htmlFor="linkedinUrl">LinkedIn Profile</Label>
            <Input
              id="linkedinUrl"
              placeholder="https://linkedin.com/company/yourcompany"
              value={data.linkedinUrl || ""}
              onChange={(e) => updateData({ linkedinUrl: e.target.value })}
              className="h-12"
            />
          </div>

          {/* YouTube (optional) */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="youtubeUrl">YouTube Channel</Label>
            <Input
              id="youtubeUrl"
              placeholder="https://youtube.com/channel/yourchannel"
              value={data.youtubeUrl || ""}
              onChange={(e) => updateData({ youtubeUrl: e.target.value })}
              className="h-12"
            />
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t">
        <Button variant="outline" onClick={onBack} size="lg" className="px-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          onClick={onNext}
          size="lg"
          className="px-8"
          disabled={!isStepValid}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
