"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { WizardStepProps } from "@/types/onboarding";
import { ArrowLeft, FileText, Home, Layout, MessageCircle } from "lucide-react";
import React from "react";

const PROPERTY_TYPES = [
  "Houses",
  "Apartments",
  "Commercial",
  "Rentals",
  "Condos",
  "Townhouses",
  "Land",
  "Luxury Homes",
];

const LAYOUT_STYLES = [
  {
    value: "Classic",
    name: "Classic",
    description: "Traditional real estate layout with sidebar navigation",
    preview: "🏛️",
  },
  {
    value: "Modern",
    name: "Modern",
    description: "Clean, contemporary design with card-based layouts",
    preview: "✨",
  },
  {
    value: "Minimal",
    name: "Minimal",
    description: "Simple, focused design with plenty of white space",
    preview: "⚡",
  },
];

const AVAILABLE_PAGES = [
  {
    id: "home",
    name: "Home",
    description: "Landing page with property highlights",
    required: true,
  },
  {
    id: "listings",
    name: "Listings",
    description: "Browse all available properties",
    required: true,
  },
  {
    id: "about",
    name: "About Us",
    description: "Your business story and team",
    required: false,
  },
  {
    id: "contact",
    name: "Contact",
    description: "Contact information and inquiry form",
    required: true,
  },
  {
    id: "blog",
    name: "Blog",
    description: "Real estate tips and market updates",
    required: false,
  },
];

const LEAD_CAPTURE_OPTIONS = [
  {
    value: "Contact Form",
    name: "Contact Form",
    description: "Traditional contact form with fields",
    icon: "📝",
  },
  {
    value: "WhatsApp",
    name: "WhatsApp",
    description: "Direct WhatsApp integration",
    icon: "💬",
  },
  {
    value: "Email Only",
    name: "Email Only",
    description: "Simple email link for inquiries",
    icon: "📧",
  },
];

export default function WebsiteSetupStep({
  data,
  updateData,
  errors,
  onNext,
  onBack,
  isStepValid,
}: WizardStepProps) {
  const handlePropertyTypeToggle = (type: string) => {
    const currentTypes = data.propertyTypes || [];
    if (currentTypes.includes(type)) {
      updateData({
        propertyTypes: currentTypes.filter((t) => t !== type),
      });
    } else {
      updateData({
        propertyTypes: [...currentTypes, type],
      });
    }
  };

  const handlePageToggle = (pageId: string) => {
    const currentPages = data.includedPages || [];
    const page = AVAILABLE_PAGES.find((p) => p.id === pageId);

    if (page?.required) return; // Can't toggle required pages

    if (currentPages.includes(pageId)) {
      updateData({
        includedPages: currentPages.filter((p) => p !== pageId),
      });
    } else {
      updateData({
        includedPages: [...currentPages, pageId],
      });
    }
  };

  const handleLeadCaptureToggle = (option: string) => {
    const currentSelection = data.leadCapturePreference || [];
    const isSelected = currentSelection.includes(option as any);

    if (isSelected) {
      updateData({
        leadCapturePreference: currentSelection.filter(
          (item) => item !== option
        ),
      });
    } else {
      updateData({
        leadCapturePreference: [...currentSelection, option as any],
      });
    }
  };

  // Ensure required pages are always included
  React.useEffect(() => {
    const requiredPages = AVAILABLE_PAGES.filter((p) => p.required).map(
      (p) => p.id
    );
    const currentPages = data.includedPages || [];
    const missingRequired = requiredPages.filter(
      (p) => !currentPages.includes(p)
    );

    if (missingRequired.length > 0) {
      updateData({
        includedPages: [...currentPages, ...missingRequired],
      });
    }
  }, [data.includedPages, updateData]);

  return (
    <div className="space-y-8">
      {/* Property Types */}
      <div className="space-y-6">
        <div className="border-l-4 border-primary pl-4">
          <h3 className="text-lg font-semibold mb-1">Property Types</h3>
          <p className="text-sm text-muted-foreground">
            Select the types of properties you work with
          </p>
        </div>

        <div className="space-y-4">
          <Label className="flex items-center gap-2">
            <Home className="w-4 h-4" />
            Property Types *
          </Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {PROPERTY_TYPES.map((type) => {
              const isSelected = data.propertyTypes?.includes(type);
              return (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={type}
                    checked={isSelected}
                    onCheckedChange={() => handlePropertyTypeToggle(type)}
                  />
                  <Label
                    htmlFor={type}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {type}
                  </Label>
                </div>
              );
            })}
          </div>
          {errors.propertyTypes && (
            <p className="text-destructive text-sm">{errors.propertyTypes}</p>
          )}
        </div>
      </div>

      {/* Layout Style */}
      <div className="space-y-6">
        <div className="border-l-4 border-primary pl-4">
          <h3 className="text-lg font-semibold mb-1">Website Layout</h3>
          <p className="text-sm text-muted-foreground">
            Choose the layout style that best fits your brand
          </p>
        </div>

        <div className="space-y-4">
          <Label className="flex items-center gap-2">
            <Layout className="w-4 h-4" />
            Layout Style *
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {LAYOUT_STYLES.map((style) => {
              const isSelected = data.layoutStyle === style.value;
              return (
                <button
                  key={style.value}
                  type="button"
                  onClick={() =>
                    updateData({ layoutStyle: style.value as any })
                  }
                  className={`p-6 border-2 rounded-lg text-left transition-all hover:border-primary/50 ${
                    isSelected ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  <div className="text-3xl mb-2">{style.preview}</div>
                  <h4 className="font-semibold mb-1">{style.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {style.description}
                  </p>
                </button>
              );
            })}
          </div>
          {errors.layoutStyle && (
            <p className="text-destructive text-sm">{errors.layoutStyle}</p>
          )}
        </div>
      </div>

      {/* Pages to Include */}
      <div className="space-y-6">
        <div className="border-l-4 border-primary pl-4">
          <h3 className="text-lg font-semibold mb-1">Website Pages</h3>
          <p className="text-sm text-muted-foreground">
            Select which pages to include on your website
          </p>
        </div>

        <div className="space-y-4">
          <Label className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Pages to Include *
          </Label>
          <div className="space-y-3">
            {AVAILABLE_PAGES.map((page) => {
              const isSelected = data.includedPages?.includes(page.id);
              const isRequired = page.required;

              return (
                <div
                  key={page.id}
                  className={`flex items-start space-x-3 p-4 border rounded-lg ${
                    isRequired ? "bg-muted/50 border-muted" : "border-border"
                  }`}
                >
                  <Checkbox
                    id={page.id}
                    checked={isSelected}
                    onCheckedChange={() => handlePageToggle(page.id)}
                    disabled={isRequired}
                    className={isRequired ? "opacity-50" : ""}
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor={page.id}
                      className={`font-medium cursor-pointer ${
                        isRequired ? "text-muted-foreground" : ""
                      }`}
                    >
                      {page.name}
                      {isRequired && (
                        <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                          Required
                        </span>
                      )}
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {page.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          {errors.includedPages && (
            <p className="text-destructive text-sm">{errors.includedPages}</p>
          )}
        </div>
      </div>

      {/* Lead Capture Preference */}
      <div className="space-y-6">
        <div className="border-l-4 border-primary pl-4">
          <h3 className="text-lg font-semibold mb-1">Lead Capture</h3>
          <p className="text-sm text-muted-foreground">
            Choose how visitors can contact you
          </p>
        </div>

        <div className="space-y-4">
          <Label className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Lead Capture Methods (Select all that apply) *
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {LEAD_CAPTURE_OPTIONS.map((option) => {
              const isSelected =
                data.leadCapturePreference?.includes(option.value as any) ||
                false;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleLeadCaptureToggle(option.value)}
                  className={`p-6 border-2 rounded-lg text-left transition-all hover:border-primary/50 ${
                    isSelected ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  <div className="text-3xl mb-2">{option.icon}</div>
                  <h4 className="font-semibold mb-1">{option.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {option.description}
                  </p>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground">
            Selected: {data.leadCapturePreference?.length || 0} method
            {data.leadCapturePreference?.length === 1 ? "" : "s"}
          </p>
          {errors.leadCapturePreference && (
            <p className="text-destructive text-sm">
              {errors.leadCapturePreference}
            </p>
          )}
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
