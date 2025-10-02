"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { WizardStepProps } from "@/types/onboarding";
import {
  ArrowLeft,
  Building,
  FileText,
  MessageSquare,
  Palette,
  Upload,
} from "lucide-react";
import React, { useRef } from "react";

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
}: WizardStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateData({ logo: file });
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
      {/* Business Name */}
      <div className="space-y-6">
        <div className="border-l-4 border-primary pl-4">
          <h3 className="text-lg font-semibold mb-1">Business Identity</h3>
          <p className="text-sm text-muted-foreground">
            Help us understand your brand and business
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="businessName" className="flex items-center gap-2">
            <Building className="w-4 h-4" />
            Agency/Business Name *
          </Label>
          <Input
            id="businessName"
            placeholder="Premier Real Estate Group"
            value={data.businessName || ""}
            onChange={(e) => updateData({ businessName: e.target.value })}
            className={`h-12 ${
              errors.businessName ? "border-destructive" : ""
            }`}
          />
          {errors.businessName && (
            <p className="text-destructive text-sm">{errors.businessName}</p>
          )}
        </div>
      </div>

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
            {data.logo ? (
              <div className="space-y-2">
                <div className="w-16 h-16 mx-auto bg-muted rounded-lg flex items-center justify-center">
                  <FileText className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium">{data.logo.name}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Change Logo
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
                >
                  Choose File
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
