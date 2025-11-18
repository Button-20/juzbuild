"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WebsiteTheme, WizardStepProps } from "@/types/onboarding";
import {
  ArrowLeft,
  Check,
  FileText,
  Home,
  Key,
  Layout,
  MessageCircle,
  Palette,
} from "lucide-react";
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
    value: "AI Chatbot",
    name: "AI Chatbot",
    description: "AI-powered chatbot for instant responses",
    icon: "🤖",
  },
  {
    value: "Contact Form",
    name: "Contact Form",
    description: "Traditional contact form with fields",
    icon: "📝",
  },
  {
    value: "Inquiry Form",
    name: "Inquiry Form",
    description: "Property-specific inquiry forms",
    icon: "📋",
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
  const [themes, setThemes] = React.useState<WebsiteTheme[]>([]);
  const [loadingThemes, setLoadingThemes] = React.useState(true);

  // Fetch themes on component mount
  React.useEffect(() => {
    const fetchThemes = async () => {
      try {
        const response = await fetch("/api/themes");
        if (response.ok) {
          const result = await response.json();
          setThemes(result.themes || []);
        } else {
          console.error("Failed to fetch themes");
          // Set default themes if API fails
          setThemes([]);
        }
      } catch (error) {
        console.error("Error fetching themes:", error);
        setThemes([]);
      } finally {
        setLoadingThemes(false);
      }
    };

    fetchThemes();
  }, []);
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
    const currentSelection = data.leadCaptureMethods || [];
    const isSelected = currentSelection.includes(option as any);

    if (isSelected) {
      updateData({
        leadCaptureMethods: currentSelection.filter((item) => item !== option),
        // Clear API key if AI Chatbot is deselected
        ...(option === "AI Chatbot" ? { geminiApiKey: "" } : {}),
      });
    } else {
      updateData({
        leadCaptureMethods: [...currentSelection, option as any],
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

      {/* Theme Selection */}
      <div className="space-y-6">
        <div className="border-l-4 border-primary pl-4">
          <h3 className="text-lg font-semibold mb-1">Website Theme</h3>
          <p className="text-sm text-muted-foreground">
            Choose a professional theme that matches your brand
          </p>
        </div>

        <div className="space-y-4">
          <Label className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Select Theme *
          </Label>

          {loadingThemes ? (
            <div className="flex items-center justify-center p-8 border-2 border-dashed border-border rounded-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-3 text-muted-foreground">
                Loading themes...
              </span>
            </div>
          ) : themes.length === 0 ? (
            <div className="p-8 border-2 border-dashed border-border rounded-lg text-center">
              <Palette className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No themes available</p>
              <p className="text-sm text-muted-foreground">
                Please contact support
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {themes.map((theme) => {
                const isSelected = data.selectedTheme === theme.id;
                return (
                  <div
                    key={theme.id}
                    className={`group relative border-2 rounded-xl overflow-hidden cursor-pointer transition-all hover:shadow-lg ${
                      isSelected
                        ? "border-primary shadow-lg ring-2 ring-primary/20"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => updateData({ selectedTheme: theme.id })}
                  >
                    {/* Theme Preview Image */}
                    <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                      {theme.previewImage ? (
                        <img
                          src={theme.previewImage}
                          alt={`${theme.name} preview`}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          onError={(e) => {
                            // Fallback to gradient background if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                            target.parentElement!.innerHTML = `
                              <div class="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-${
                                theme.category === "modern"
                                  ? "blue"
                                  : theme.category === "luxury"
                                  ? "purple"
                                  : theme.category === "minimal"
                                  ? "gray"
                                  : "indigo"
                              }-100 to-${
                              theme.category === "modern"
                                ? "blue"
                                : theme.category === "luxury"
                                ? "purple"
                                : theme.category === "minimal"
                                ? "gray"
                                : "indigo"
                            }-200">
                                <div class="w-16 h-16 mb-2 opacity-50">
                                  <svg fill="currentColor" viewBox="0 0 24 24"><path d="M3 3h18v18H3V3zm16 16V5H5v14h14zM7 7h4v4H7V7zm6 0h4v2h-4V7zm0 4h4v2h-4v-2zm-6 4h10v2H7v-2z"/></svg>
                                </div>
                                <div class="text-center">
                                  <div class="font-medium text-gray-700">${
                                    theme.name
                                  }</div>
                                  <div class="text-sm text-gray-500 capitalize">${
                                    theme.category
                                  }</div>
                                </div>
                              </div>
                            `;
                          }}
                        />
                      ) : (
                        <div
                          className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br ${
                            theme.category === "modern"
                              ? "from-blue-100 to-blue-200"
                              : theme.category === "luxury"
                              ? "from-purple-100 to-purple-200"
                              : theme.category === "minimal"
                              ? "from-gray-100 to-gray-200"
                              : theme.category === "corporate"
                              ? "from-indigo-100 to-indigo-200"
                              : "from-emerald-100 to-emerald-200"
                          }`}
                        >
                          <Layout className="w-16 h-16 mb-2 opacity-50" />
                          <div className="text-center">
                            <div className="font-medium text-gray-700">
                              {theme.name}
                            </div>
                            <div className="text-sm text-gray-500 capitalize">
                              {theme.category}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Selected Indicator */}
                      {isSelected && (
                        <div className="absolute top-3 right-3 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4" />
                        </div>
                      )}

                      {/* Category Badge */}
                      <div className="absolute top-3 left-3 px-2 py-1 bg-black/70 text-white text-xs rounded-full capitalize">
                        {theme.category}
                      </div>
                    </div>

                    {/* Theme Info */}
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-foreground">
                          {theme.name}
                        </h4>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {theme.description}
                      </p>

                      {/* Features */}
                      {theme.features && theme.features.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {theme.features.slice(0, 3).map((feature, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-accent text-accent-foreground text-xs rounded-md"
                            >
                              {feature}
                            </span>
                          ))}
                          {theme.features.length > 3 && (
                            <span className="px-2 py-1 bg-accent text-accent-foreground text-xs rounded-md">
                              +{theme.features.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {errors.selectedTheme && (
            <p className="text-destructive text-sm">{errors.selectedTheme}</p>
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
                  className={`flex items-start space-x-3 p-4 border rounded-lg cursor-pointer transition-all hover:border-primary/50 ${
                    isSelected ? "border-primary bg-primary/5" : "border-border"
                  } ${
                    isRequired
                      ? "bg-muted/50 border-muted cursor-not-allowed"
                      : ""
                  }`}
                  onClick={() => !isRequired && handlePageToggle(page.id)}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {LEAD_CAPTURE_OPTIONS.map((option) => {
              const isSelected =
                data.leadCaptureMethods?.includes(option.value as any) || false;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleLeadCaptureToggle(option.value)}
                  className={`p-6 border-2 rounded-lg text-left transition-all hover:border-primary/50 ${
                    isSelected ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  <div className="text-3xl mb-2 flex items-center justify-start">
                    {option.icon}
                  </div>
                  <h4 className="font-semibold mb-1">{option.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {option.description}
                  </p>
                  {isSelected && (
                    <div className="mt-2 flex items-center gap-2 text-primary">
                      <Check className="w-4 h-4" />
                      <span className="text-sm font-medium">Selected</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground">
            Selected: {data.leadCaptureMethods?.length || 0} method
            {data.leadCaptureMethods?.length === 1 ? "" : "s"}
          </p>
          {errors.leadCaptureMethods && (
            <p className="text-destructive text-sm">
              {errors.leadCaptureMethods}
            </p>
          )}
        </div>

        {/* Gemini API Key Input - Shown only when AI Chatbot is selected */}
        {data.leadCaptureMethods?.includes("AI Chatbot") && (
          <div className="space-y-6">
            <div className="border-l-4 border-primary pl-4">
              <h3 className="text-lg font-semibold mb-1">AI Configuration</h3>
              <p className="text-sm text-muted-foreground">
                Configure your AI chatbot settings
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="geminiApiKey" className="flex items-center gap-2">
                <Key className="w-4 h-4" />
                Gemini API Key *
              </Label>
              <Input
                id="geminiApiKey"
                type="text"
                placeholder="Enter your Gemini API key"
                value={data.geminiApiKey || ""}
                onChange={(e) => updateData({ geminiApiKey: e.target.value })}
                className={`h-12 ${
                  errors.geminiApiKey ? "border-destructive" : ""
                }`}
              />
              {errors.geminiApiKey && (
                <p className="text-destructive text-sm">
                  {errors.geminiApiKey}
                </p>
              )}
              <div className="text-sm bg-muted/50 p-4 rounded-lg border space-y-2">
                <p className="font-medium">How to get your Gemini API Key:</p>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                  <li>
                    Visit{" "}
                    <a
                      href="https://makersuite.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline hover:no-underline"
                    >
                      Google AI Studio
                    </a>
                  </li>
                  <li>Sign in with your Google account</li>
                  <li>Click on "Get API Key" or "Create API Key"</li>
                  <li>Copy the generated API key and paste it above</li>
                </ol>
                <p className="text-xs mt-2">
                  Note: The API key is free to use with generous quotas. Learn
                  more at{" "}
                  <a
                    href="https://ai.google.dev/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline hover:no-underline"
                  >
                    ai.google.dev
                  </a>
                </p>
              </div>
            </div>
          </div>
        )}
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
