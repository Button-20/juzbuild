"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { SidebarInset } from "@/components/ui/sidebar";
import { Textarea } from "@/components/ui/textarea";
import { COLOR_PALETTES } from "@/constants/color-palettes";
import { PRICING_PLANS } from "@/constants/pricing";
import { useAuth } from "@/contexts/AuthContext";
import { useWebsite } from "@/contexts/website-context";
import { WebsiteTheme } from "@/types/onboarding";
import { CreateWebsiteParams, Website } from "@/types/website";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  FileText,
  Home,
  Key,
  Layout,
  Loader2,
  MessageCircle,
  Palette,
  Upload,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

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

const CONTACT_METHODS = [
  { id: "email", label: "Email" },
  { id: "phone", label: "Phone" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "contact-form", label: "Contact Form" },
];

// Use consistent pricing from constants
const plans = PRICING_PLANS;

// Helper function to check if a feature is available in the selected plan
const isFeatureAvailable = (feature: string, planId: string): boolean => {
  if (planId === "starter") {
    return [
      "basic-templates",
      "lead-capture",
      "mobile-responsive",
      "ssl",
    ].includes(feature);
  } else if (planId === "pro") {
    return ![
      "team-logins",
      "white-label",
      "api-access",
      "dedicated-manager",
    ].includes(feature);
  } else if (planId === "agency") {
    return true; // All features available
  }
  return false;
};

export default function OnboardingPage() {
  const router = useRouter();
  const { createWebsite, websites } = useWebsite();
  const { isAuthenticated, user } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    {
      number: 1,
      title: "Basic Information",
      description: "Company details and domain",
    },
    { number: 2, title: "Brand Assets", description: "Logo and color palette" },
    {
      number: 3,
      title: "Website Configuration",
      description: "Theme, pages, and features",
    },
    {
      number: 4,
      title: "Lead Capture Setup",
      description: "Contact methods and forms",
    },
    {
      number: 5,
      title: "Review & Create",
      description: "Final review and confirmation",
    },
  ];

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
  };

  const [formData, setFormData] = useState<CreateWebsiteParams>({
    companyName: "",
    domainName: "",
    tagline: "",
    aboutSection: "",
    selectedTheme: "",
    includedPages: ["home", "listings", "contact"],
    propertyTypes: ["Houses"],
    preferredContactMethod: ["email"],
    logoUrl: "",
    brandColors: [],
    leadCaptureMethods: ["Contact Form"],
    geminiApiKey: "",
    phoneNumber: "",
    supportEmail: "",
    whatsappNumber: "",
    address: "",
    facebookUrl: "",
    twitterUrl: "",
    instagramUrl: "",
    linkedinUrl: "",
    youtubeUrl: "",
  });

  const [themes, setThemes] = useState<WebsiteTheme[]>([]);
  const [loadingThemes, setLoadingThemes] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [userBillingCycle, setUserBillingCycle] = useState<
    "monthly" | "yearly"
  >("monthly");

  // Update billing cycle when user is loaded
  useEffect(() => {
    if (
      user?.billingCycle &&
      (user.billingCycle === "monthly" || user.billingCycle === "yearly")
    ) {
      setUserBillingCycle(user.billingCycle);
    }
  }, [user?.billingCycle]);

  useEffect(() => {
    const fetchThemes = async () => {
      try {
        const response = await fetch("/api/themes");
        if (response.ok) {
          const result = await response.json();
          setThemes(result.themes || []);
        } else {
          console.error("Failed to fetch themes");
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

  const handleInputChange = (
    field: keyof CreateWebsiteParams,
    value: string | string[]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const formDataUpload = new FormData();
      formDataUpload.append("logo", file);

      const response = await fetch("/api/upload/logo", {
        method: "POST",
        body: formDataUpload,
      });

      const result = await response.json();

      if (result.success) {
        setFormData((prev) => ({ ...prev, logoUrl: result.logoUrl }));
      } else {
        setUploadError(result.error || "Upload failed");
      }
    } catch (error: any) {
      setUploadError("Upload failed: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handlePaletteSelect = (paletteId: string) => {
    const palette = COLOR_PALETTES.find((p) => p.id === paletteId);
    if (palette) {
      setFormData((prev: any) => ({
        ...prev,
        brandColors: [
          palette.colors.primary,
          palette.colors.skyblue,
          palette.colors.lightskyblue,
          palette.colors.dark,
        ],
      }));
    }
  };

  const handlePropertyTypeToggle = (type: string) => {
    const currentTypes = formData.propertyTypes || [];
    if (currentTypes.includes(type)) {
      setFormData((prev) => ({
        ...prev,
        propertyTypes: currentTypes.filter((t: any) => t !== type),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        propertyTypes: [...currentTypes, type],
      }));
    }
  };

  const handlePageToggle = (pageId: string) => {
    const currentPages = formData.includedPages || [];
    const page = AVAILABLE_PAGES.find((p) => p.id === pageId);

    if (page?.required) return;

    if (currentPages.includes(pageId)) {
      setFormData((prev) => ({
        ...prev,
        includedPages: currentPages.filter((p: any) => p !== pageId),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        includedPages: [...currentPages, pageId],
      }));
    }
  };

  const handleLeadCaptureToggle = (option: string) => {
    const currentSelection = formData.leadCaptureMethods || [];
    const isSelected = currentSelection.includes(option as any);

    if (isSelected) {
      setFormData((prev) => ({
        ...prev,
        leadCaptureMethods: currentSelection.filter(
          (item: any) => item !== option
        ),
        ...(option === "AI Chatbot" ? { geminiApiKey: "" } : {}),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        leadCaptureMethods: [...currentSelection, option as any],
      }));
    }
  };

  const handleContactMethodToggle = (methodId: string) => {
    const currentMethods = formData.preferredContactMethod || [];
    if (currentMethods.includes(methodId)) {
      setFormData((prev) => ({
        ...prev,
        preferredContactMethod: currentMethods.filter(
          (m: any) => m !== methodId
        ),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        preferredContactMethod: [...currentMethods, methodId],
      }));
    }
  };

  const getSelectedPaletteId = (): string | null => {
    if (!formData.brandColors || formData.brandColors.length !== 4) return null;

    for (const palette of COLOR_PALETTES) {
      if (
        palette.colors.primary === formData.brandColors[0] &&
        palette.colors.skyblue === formData.brandColors[1] &&
        palette.colors.lightskyblue === formData.brandColors[2] &&
        palette.colors.dark === formData.brandColors[3]
      ) {
        return palette.id;
      }
    }
    return null;
  };

  const selectedPaletteId = getSelectedPaletteId();

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Prevent default form submission - we handle creation via button click
  };

  const handleCreateWebsite = async () => {
    // Validate required fields
    if (
      !user?.selectedPlan ||
      !formData.companyName ||
      !formData.domainName ||
      !formData.tagline ||
      !formData.aboutSection ||
      !formData.selectedTheme ||
      !formData.brandColors ||
      formData.brandColors.length !== 4 ||
      !formData.propertyTypes ||
      formData.propertyTypes.length === 0 ||
      !formData.leadCaptureMethods ||
      formData.leadCaptureMethods.length === 0 ||
      !formData.preferredContactMethod ||
      formData.preferredContactMethod.length === 0 ||
      (formData.leadCaptureMethods.includes("AI Chatbot") &&
        !formData.geminiApiKey)
    ) {
      toast.error(
        "Please fill in all required fields and make all required selections"
      );
      return;
    }

    setIsCreating(true);

    // Check authentication
    if (!isAuthenticated) {
      toast.error("You need to be logged in to create a website");
      setIsCreating(false);
      router.push("/login");
      return;
    }

    try {
      // Create website with timeout protection
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(
          () =>
            reject(new Error("Website creation timed out. Please try again.")),
          30000
        )
      );

      const website = (await Promise.race([
        createWebsite(formData),
        timeoutPromise,
      ])) as Website | null;
      if (website) {
        toast.success("Website creation started successfully!");

        // Redirect to deployment page with tracking information
        const queryParams = new URLSearchParams();
        if (website.jobId) queryParams.set("jobId", website.jobId);
        if (formData.domainName)
          queryParams.set("domainName", formData.domainName);
        if (formData.companyName)
          queryParams.set("websiteName", formData.companyName);

        const deploymentUrl = `/app/deployment${
          queryParams.toString() ? `?${queryParams.toString()}` : ""
        }`;

        router.push(deploymentUrl);
      } else {
        throw new Error("Website creation failed. Please try again.");
      }
    } catch (error: any) {
      const errorMessage =
        error.message || "An unexpected error occurred. Please try again.";
      toast.error(errorMessage);
      setIsCreating(false);
    }
  };

  const selectedPlan = plans.find(
    (p) => p.id === (user?.selectedPlan || "pro")
  );
  const selectedTheme = themes.find((t) => t.id === formData.selectedTheme);

  return (
    <ProtectedRoute>
      <SidebarInset>
        <SiteHeader />
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Progress Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Create New Website
            </h1>
            <p className="text-muted-foreground mb-6">
              Set up your new real estate website in just a few steps
            </p>

            {/* Progress Bar */}
            <div className="max-w-2xl mx-auto mb-6">
              <div className="flex justify-between text-sm text-muted-foreground mb-3">
                <span>
                  Step {currentStep} of {steps.length}
                </span>
                <span>
                  {Math.round((currentStep / steps.length) * 100)}% Complete
                </span>
              </div>
              <Progress
                value={(currentStep / steps.length) * 100}
                className="h-3"
              />
            </div>

            {/* Step Indicators */}
            <div className="flex justify-center items-center space-x-3">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer hover:scale-105 ${
                      index < currentStep - 1
                        ? "bg-primary text-primary-foreground shadow-lg"
                        : index === currentStep - 1
                        ? "bg-primary/10 text-primary border-2 border-primary ring-2 ring-primary/20"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted"
                    }`}
                    onClick={() => goToStep(step.number)}
                  >
                    {index < currentStep - 1 ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      step.number
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-4 md:w-8 h-0.5 transition-colors ${
                        index < currentStep - 1 ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Main Content - Split Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form Section (Left) */}
            <div className="lg:col-span-2 order-2 lg:order-1">
              <Card className="border shadow-sm bg-card">
                <CardHeader className="text-center pb-6 border-b">
                  <CardTitle className="text-2xl font-bold text-foreground">
                    {steps[currentStep - 1]?.title}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground mt-2">
                    {steps[currentStep - 1]?.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-8">
                  <form onSubmit={handleFormSubmit} className="space-y-8">
                    {/* Step 1: Basic Information */}
                    {currentStep === 1 && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="companyName">
                              Company/Website Name *
                            </Label>
                            <Input
                              id="companyName"
                              value={formData.companyName}
                              onChange={(e) =>
                                handleInputChange("companyName", e.target.value)
                              }
                              placeholder="e.g., Acme Real Estate"
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="domainName">Domain Name *</Label>
                            <Input
                              id="domainName"
                              value={formData.domainName}
                              onChange={(e) =>
                                handleInputChange("domainName", e.target.value)
                              }
                              placeholder="e.g., acme-realestate"
                              required
                            />
                            <p className="text-xs text-muted-foreground">
                              Your website will be:{" "}
                              <span className="font-medium text-primary">
                                {formData.domainName}.onjuzbuild.com
                              </span>
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="tagline">Business Tagline *</Label>
                          <Input
                            id="tagline"
                            value={formData.tagline}
                            onChange={(e) =>
                              handleInputChange("tagline", e.target.value)
                            }
                            placeholder="e.g., Your Dream Home Awaits"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="aboutSection">
                            About Your Business *
                          </Label>
                          <Textarea
                            id="aboutSection"
                            value={formData.aboutSection}
                            onChange={(e) =>
                              handleInputChange("aboutSection", e.target.value)
                            }
                            placeholder="Tell visitors about your business, services, and what makes you unique..."
                            rows={4}
                            required
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="phoneNumber">Phone Number</Label>
                            <Input
                              id="phoneNumber"
                              type="tel"
                              value={formData.phoneNumber}
                              onChange={(e) =>
                                handleInputChange("phoneNumber", e.target.value)
                              }
                              placeholder="e.g., +1 (555) 123-4567"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="supportEmail">Support Email</Label>
                            <Input
                              id="supportEmail"
                              type="email"
                              value={formData.supportEmail}
                              onChange={(e) =>
                                handleInputChange(
                                  "supportEmail",
                                  e.target.value
                                )
                              }
                              placeholder="e.g., support@example.com"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="whatsappNumber">
                              WhatsApp Number
                            </Label>
                            <Input
                              id="whatsappNumber"
                              type="tel"
                              value={formData.whatsappNumber}
                              onChange={(e) =>
                                handleInputChange(
                                  "whatsappNumber",
                                  e.target.value
                                )
                              }
                              placeholder="e.g., +1 (555) 123-4567"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="address">Business Address</Label>
                            <Input
                              id="address"
                              value={formData.address}
                              onChange={(e) =>
                                handleInputChange("address", e.target.value)
                              }
                              placeholder="e.g., 123 Main St, New York, NY 10001"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 2: Brand Assets */}
                    {currentStep === 2 && (
                      <div className="space-y-6">
                        {/* Logo Upload */}
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <Upload className="w-4 h-4" />
                            Logo Upload (Optional)
                          </Label>
                          <div
                            className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            {formData.logoUrl ? (
                              <div className="space-y-2">
                                <div className="w-24 h-24 mx-auto bg-muted rounded-lg overflow-hidden">
                                  <img
                                    src={formData.logoUrl}
                                    alt="Brand Logo"
                                    className="w-full h-full object-contain"
                                  />
                                </div>
                                <p className="text-sm font-medium">
                                  Logo uploaded
                                </p>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
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
                                <p className="text-xs text-muted-foreground">
                                  PNG, JPG, SVG (max 5MB)
                                </p>
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
                            <p className="text-sm text-red-600 mt-2">
                              {uploadError}
                            </p>
                          )}
                        </div>

                        {/* Brand Colors */}
                        <div className="space-y-3">
                          <Label className="flex items-center gap-2">
                            <Palette className="w-4 h-4" />
                            Brand Color Palette *
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Choose a professional color palette for your website
                          </p>
                          <div className="grid grid-cols-2 gap-4">
                            {COLOR_PALETTES.map((palette) => {
                              const isSelected =
                                selectedPaletteId === palette.id;
                              return (
                                <button
                                  key={palette.id}
                                  type="button"
                                  className={`relative p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                                    isSelected
                                      ? "border-primary shadow-lg ring-2 ring-primary/20"
                                      : "border-border hover:border-primary/50"
                                  }`}
                                  onClick={() =>
                                    handlePaletteSelect(palette.id)
                                  }
                                >
                                  {isSelected && (
                                    <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                                      <Check className="w-4 h-4 text-white" />
                                    </div>
                                  )}
                                  <div className="text-sm font-semibold mb-2">
                                    {palette.name}
                                  </div>
                                  <div className="flex gap-2">
                                    {[
                                      palette.colors.primary,
                                      palette.colors.skyblue,
                                      palette.colors.lightskyblue,
                                      palette.colors.dark,
                                    ].map((color, idx) => (
                                      <div
                                        key={idx}
                                        className="flex-1 h-8 rounded border border-white/50"
                                        style={{ backgroundColor: color }}
                                      />
                                    ))}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Social Media Links */}
                        <div className="space-y-4">
                          <h3 className="font-semibold">
                            Social Media Links (Optional)
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="facebookUrl">Facebook</Label>
                              <Input
                                id="facebookUrl"
                                value={formData.facebookUrl}
                                onChange={(e) =>
                                  handleInputChange(
                                    "facebookUrl",
                                    e.target.value
                                  )
                                }
                                placeholder="https://facebook.com/yourpage"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="twitterUrl">Twitter/X</Label>
                              <Input
                                id="twitterUrl"
                                value={formData.twitterUrl}
                                onChange={(e) =>
                                  handleInputChange(
                                    "twitterUrl",
                                    e.target.value
                                  )
                                }
                                placeholder="https://twitter.com/yourprofile"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="instagramUrl">Instagram</Label>
                              <Input
                                id="instagramUrl"
                                value={formData.instagramUrl}
                                onChange={(e) =>
                                  handleInputChange(
                                    "instagramUrl",
                                    e.target.value
                                  )
                                }
                                placeholder="https://instagram.com/yourprofile"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="linkedinUrl">LinkedIn</Label>
                              <Input
                                id="linkedinUrl"
                                value={formData.linkedinUrl}
                                onChange={(e) =>
                                  handleInputChange(
                                    "linkedinUrl",
                                    e.target.value
                                  )
                                }
                                placeholder="https://linkedin.com/in/yourprofile"
                              />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                              <Label htmlFor="youtubeUrl">YouTube</Label>
                              <Input
                                id="youtubeUrl"
                                value={formData.youtubeUrl}
                                onChange={(e) =>
                                  handleInputChange(
                                    "youtubeUrl",
                                    e.target.value
                                  )
                                }
                                placeholder="https://youtube.com/c/yourchannel"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 3: Website Configuration */}
                    {currentStep === 3 && (
                      <div className="space-y-6">
                        {/* Theme Selection */}
                        <div className="space-y-3">
                          <Label className="flex items-center gap-2">
                            <Layout className="w-4 h-4" />
                            Choose Your Theme *
                          </Label>
                          {loadingThemes ? (
                            <div className="grid grid-cols-2 gap-4">
                              {[...Array(4)].map((_, i) => (
                                <div
                                  key={i}
                                  className="border rounded-lg overflow-hidden animate-pulse"
                                >
                                  <div className="aspect-video bg-muted" />
                                  <div className="p-3 space-y-2">
                                    <div className="h-3 bg-muted rounded" />
                                    <div className="h-2 bg-muted rounded w-2/3" />
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              {themes.map((theme) => {
                                const isSelected =
                                  formData.selectedTheme === theme.id;
                                return (
                                  <div
                                    key={theme.id}
                                    className={`group relative border-2 rounded-xl overflow-hidden cursor-pointer transition-all hover:shadow-lg ${
                                      isSelected
                                        ? "border-primary shadow-lg ring-2 ring-primary/20"
                                        : "border-border hover:border-primary/50"
                                    }`}
                                    onClick={() =>
                                      handleInputChange(
                                        "selectedTheme",
                                        theme.id
                                      )
                                    }
                                  >
                                    <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                                      {theme.previewImage ? (
                                        <img
                                          src={theme.previewImage}
                                          alt={`${theme.name} preview`}
                                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                          onError={(e) => {
                                            const target =
                                              e.target as HTMLImageElement;
                                            target.style.display = "none";
                                            target.parentElement!.innerHTML = `\n                              <div class="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-${
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
                                            }-200">\n                                <div class="w-16 h-16 mb-2 opacity-50">\n                                  <svg fill="currentColor" viewBox="0 0 24 24"><path d="M3 3h18v18H3V3zm16 16V5H5v14h14zM7 7h4v4H7V7zm6 0h4v2h-4V7zm0 4h4v2h-4v-2zm-6 4h10v2H7v-2z"/></svg>\n                                </div>\n                                <div class="text-center">\n                                  <div class="font-medium text-gray-700">${
                                              theme.name
                                            }</div>\n                                  <div class="text-sm text-gray-500 capitalize">${
                                              theme.category
                                            }</div>\n                                </div>\n                              </div>\n                            `;
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

                                      {isSelected && (
                                        <div className="absolute top-3 right-3 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                                          <Check className="w-4 h-4" />
                                        </div>
                                      )}

                                      <div className="absolute top-3 left-3 px-2 py-1 bg-black/70 text-white text-xs rounded-full capitalize">
                                        {theme.category}
                                      </div>
                                    </div>

                                    <div className="p-4">
                                      <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-semibold text-foreground">
                                          {theme.name}
                                        </h4>
                                      </div>
                                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                        {theme.description}
                                      </p>

                                      {theme.features &&
                                        theme.features.length > 0 && (
                                          <div className="flex flex-wrap gap-1">
                                            {theme.features
                                              .slice(0, 3)
                                              .map((feature, index) => (
                                                <span
                                                  key={index}
                                                  className="px-2 py-1 bg-accent text-accent-foreground text-xs rounded-md"
                                                >
                                                  {feature}
                                                </span>
                                              ))}
                                            {theme.features.length > 3 && (
                                              <span className="px-2 py-1 bg-accent text-accent-foreground text-xs rounded-md">
                                                +{theme.features.length - 3}{" "}
                                                more
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
                        </div>

                        {/* Property Types */}
                        <div className="space-y-3">
                          <Label className="flex items-center gap-2">
                            <Home className="w-4 h-4" />
                            Property Types *
                          </Label>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {PROPERTY_TYPES.map((type) => {
                              const isSelected =
                                formData.propertyTypes?.includes(type) || false;
                              return (
                                <button
                                  key={type}
                                  type="button"
                                  className={`p-3 text-sm border rounded-lg transition-all text-left ${
                                    isSelected
                                      ? "border-primary bg-primary/5"
                                      : "border-border hover:border-primary/50"
                                  }`}
                                  onClick={() => handlePropertyTypeToggle(type)}
                                >
                                  <div className="flex items-center justify-between">
                                    <span>{type}</span>
                                    {isSelected && (
                                      <Check className="w-4 h-4" />
                                    )}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Website Pages */}
                        <div className="space-y-3">
                          <Label className="flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Website Pages *
                          </Label>
                          <div className="grid grid-cols-1 gap-2">
                            {AVAILABLE_PAGES.map((page) => {
                              const isSelected =
                                formData.includedPages?.includes(page.id) ||
                                false;
                              const isRequired = page.required;
                              return (
                                <div
                                  key={page.id}
                                  className={`p-3 border rounded-lg flex items-start justify-between cursor-pointer transition-all hover:border-primary/50 ${
                                    isSelected
                                      ? "border-primary bg-primary/5"
                                      : "border-border"
                                  } ${
                                    isRequired
                                      ? "opacity-75 cursor-not-allowed"
                                      : ""
                                  }`}
                                  onClick={() =>
                                    !isRequired && handlePageToggle(page.id)
                                  }
                                >
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <p className="font-medium text-sm">
                                        {page.name}
                                      </p>
                                      {isRequired && (
                                        <Badge
                                          variant="secondary"
                                          className="text-xs"
                                        >
                                          Required
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                      {page.description}
                                    </p>
                                  </div>
                                  <div onClick={(e) => e.stopPropagation()}>
                                    <Checkbox
                                      checked={isSelected}
                                      disabled={isRequired}
                                      onCheckedChange={() =>
                                        !isRequired && handlePageToggle(page.id)
                                      }
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 4: Lead Capture Setup */}
                    {currentStep === 4 && (
                      <div className="space-y-6">
                        {/* Lead Capture Methods */}
                        <div className="space-y-3">
                          <Label className="flex items-center gap-2">
                            <MessageCircle className="w-4 h-4" />
                            Lead Capture Methods *
                          </Label>
                          <div className="grid grid-cols-3 gap-3">
                            {LEAD_CAPTURE_OPTIONS.filter(
                              (option) =>
                                option.value !== "AI Chatbot" ||
                                user?.selectedPlan === "pro" ||
                                user?.selectedPlan === "agency"
                            ).map((option) => {
                              const isSelected =
                                formData.leadCaptureMethods?.includes(
                                  option.value as any
                                ) || false;
                              return (
                                <button
                                  key={option.value}
                                  type="button"
                                  className={`p-4 text-center border rounded-lg transition-all ${
                                    isSelected
                                      ? "border-primary bg-primary/5"
                                      : "border-border hover:border-primary/50"
                                  }`}
                                  onClick={() =>
                                    handleLeadCaptureToggle(option.value)
                                  }
                                >
                                  <div className="text-2xl mb-2">
                                    {option.icon}
                                  </div>
                                  <h4 className="font-medium text-sm mb-1">
                                    {option.name}
                                  </h4>
                                  <p className="text-xs text-muted-foreground">
                                    {option.description}
                                  </p>
                                  {isSelected && (
                                    <div className="mt-2 flex justify-center">
                                      <Check className="w-4 h-4 text-primary" />
                                    </div>
                                  )}
                                </button>
                              );
                            })}
                          </div>

                          {formData.leadCaptureMethods?.includes(
                            "AI Chatbot"
                          ) && (
                            <div className="space-y-2 mt-4 p-4 border border-primary/20 rounded-lg bg-primary/5">
                              <Label className="flex items-center gap-2">
                                <Key className="w-4 h-4" />
                                Google Gemini API Key *
                              </Label>
                              <Input
                                value={formData.geminiApiKey}
                                onChange={(e) =>
                                  handleInputChange(
                                    "geminiApiKey",
                                    e.target.value
                                  )
                                }
                                placeholder="Enter your Google Gemini API key"
                                type="password"
                                required
                              />
                              <p className="text-xs text-muted-foreground">
                                Get your free key from{" "}
                                <a
                                  href="https://makersuite.google.com"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline"
                                >
                                  Google AI Studio
                                </a>
                              </p>
                            </div>
                          )}

                          {user?.selectedPlan === "starter" && (
                            <div className="mt-4 p-4 bg-muted/50 border border-border rounded-lg">
                              <div className="flex items-start gap-3">
                                <div className="text-2xl">🤖</div>
                                <div>
                                  <h4 className="font-semibold mb-1">
                                    Want AI Chatbot?
                                  </h4>
                                  <p className="text-sm text-muted-foreground">
                                    AI Chatbot is available in Pro and Agency
                                    plans. You can upgrade anytime after
                                    creating your website.
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Contact Methods */}
                        <div className="space-y-3">
                          <Label>Preferred Contact Methods *</Label>
                          <p className="text-sm text-muted-foreground">
                            Select how you'd like visitors to contact you
                          </p>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {CONTACT_METHODS.map((method) => {
                              const isSelected =
                                formData.preferredContactMethod?.includes(
                                  method.id
                                ) || false;
                              return (
                                <button
                                  key={method.id}
                                  type="button"
                                  className={`p-3 text-sm border rounded-lg transition-all text-left ${
                                    isSelected
                                      ? "border-primary bg-primary/5"
                                      : "border-border hover:border-primary/50"
                                  }`}
                                  onClick={() =>
                                    handleContactMethodToggle(method.id)
                                  }
                                >
                                  <div className="flex items-center justify-between">
                                    <span>{method.label}</span>
                                    {isSelected && (
                                      <Check className="w-4 h-4" />
                                    )}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 5: Review & Create */}
                    {currentStep === 5 && (
                      <div className="space-y-6">
                        {/* Order Summary */}
                        <div className="space-y-4">
                          <h4 className="font-semibold text-lg mb-4">
                            Order Summary
                          </h4>
                          <div className="space-y-2 mb-4">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Website Name:
                              </span>
                              <span className="font-medium">
                                {formData.companyName || "Not specified"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Domain:
                              </span>
                              <span className="font-medium">
                                {formData.domainName}.onjuzbuild.com
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Theme:
                              </span>
                              <span className="font-medium">
                                {selectedTheme?.name || "Not selected"}
                              </span>
                            </div>
                            <div className="flex justify-between pb-4 border-b">
                              <span className="text-muted-foreground">
                                Plan:
                              </span>
                              <span className="font-medium">
                                {selectedPlan?.name}
                              </span>
                            </div>
                            <div className="flex justify-between text-lg font-semibold pt-2">
                              <span>Total:</span>
                              <span>
                                $
                                {selectedPlan &&
                                  (userBillingCycle === "monthly"
                                    ? selectedPlan.monthlyPrice
                                    : selectedPlan.yearlyPrice)}
                                /{userBillingCycle === "monthly" ? "mo" : "yr"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between pt-8 gap-4 border-t border-border/50">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={prevStep}
                        disabled={currentStep === 1}
                        className="px-6 py-3 font-medium"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Previous
                      </Button>

                      {currentStep < steps.length ? (
                        <Button
                          type="button"
                          onClick={nextStep}
                          disabled={false}
                          className="px-6 py-3 font-medium"
                        >
                          Next
                          <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          onClick={handleCreateWebsite}
                          disabled={
                            isCreating ||
                            !user?.selectedPlan ||
                            !formData.companyName ||
                            !formData.domainName ||
                            !formData.tagline ||
                            !formData.aboutSection ||
                            !formData.selectedTheme ||
                            !formData.brandColors ||
                            formData.brandColors.length !== 4 ||
                            !formData.propertyTypes ||
                            formData.propertyTypes.length === 0 ||
                            !formData.leadCaptureMethods ||
                            formData.leadCaptureMethods.length === 0 ||
                            !formData.preferredContactMethod ||
                            formData.preferredContactMethod.length === 0 ||
                            (formData.leadCaptureMethods.includes(
                              "AI Chatbot"
                            ) &&
                              !formData.geminiApiKey)
                          }
                          className="px-8 py-3 font-semibold bg-primary hover:bg-primary/90"
                        >
                          {isCreating ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Creating...
                            </>
                          ) : (
                            "Create Website"
                          )}
                        </Button>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Right Side - Info Panel */}
            <div className="order-1 lg:order-2">
              <Card className="sticky top-8 border shadow-sm bg-card">
                <CardContent className="p-6">
                  <AnimatePresence mode="wait">
                    {currentStep === 1 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="text-center mb-4">
                          <span className="text-6xl">🏢</span>
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-center">
                          Brand Identity
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4 text-center">
                          Tell us about your business so we can create a website
                          that represents you perfectly.
                        </p>
                        <ul className="space-y-2">
                          <li className="flex items-start text-sm">
                            <span className="text-primary mr-2">✓</span>
                            <span>Custom branding</span>
                          </li>
                          <li className="flex items-start text-sm">
                            <span className="text-primary mr-2">✓</span>
                            <span>Professional appearance</span>
                          </li>
                          <li className="flex items-start text-sm">
                            <span className="text-primary mr-2">✓</span>
                            <span>SEO optimization</span>
                          </li>
                        </ul>
                      </motion.div>
                    )}

                    {currentStep === 2 && (
                      <motion.div
                        key="step3"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="text-center mb-4">
                          <span className="text-6xl">🎨</span>
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-center">
                          Visual Design
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4 text-center">
                          Upload your logo and choose colors that reflect your
                          business personality.
                        </p>
                        <ul className="space-y-2">
                          <li className="flex items-start text-sm">
                            <span className="text-primary mr-2">✓</span>
                            <span>Logo integration</span>
                          </li>
                          <li className="flex items-start text-sm">
                            <span className="text-primary mr-2">✓</span>
                            <span>Color customization</span>
                          </li>
                          <li className="flex items-start text-sm">
                            <span className="text-primary mr-2">✓</span>
                            <span>Social media links</span>
                          </li>
                        </ul>
                      </motion.div>
                    )}

                    {currentStep === 3 && (
                      <motion.div
                        key="step4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="text-center mb-4">
                          <span className="text-6xl">✨</span>
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-center">
                          Website Design
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4 text-center">
                          Choose your layout style and decide which pages to
                          include on your website.
                        </p>
                        <ul className="space-y-2">
                          <li className="flex items-start text-sm">
                            <span className="text-primary mr-2">✓</span>
                            <span>Modern layouts</span>
                          </li>
                          <li className="flex items-start text-sm">
                            <span className="text-primary mr-2">✓</span>
                            <span>Custom pages</span>
                          </li>
                          <li className="flex items-start text-sm">
                            <span className="text-primary mr-2">✓</span>
                            <span>Property showcase</span>
                          </li>
                        </ul>
                      </motion.div>
                    )}

                    {currentStep === 4 && (
                      <motion.div
                        key="step5"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="text-center mb-4">
                          <span className="text-6xl">📢</span>
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-center">
                          Marketing Power
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4 text-center">
                          Set up your marketing preferences to attract more
                          leads and grow your business.
                        </p>
                        <ul className="space-y-2">
                          <li className="flex items-start text-sm">
                            <span className="text-primary mr-2">✓</span>
                            <span>Lead generation</span>
                          </li>
                          <li className="flex items-start text-sm">
                            <span className="text-primary mr-2">✓</span>
                            <span>Contact forms</span>
                          </li>
                          <li className="flex items-start text-sm">
                            <span className="text-primary mr-2">✓</span>
                            <span>AI chatbot support</span>
                          </li>
                        </ul>
                      </motion.div>
                    )}

                    {currentStep === 5 && (
                      <motion.div
                        key="step6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="text-center mb-4">
                          <span className="text-6xl">🚀</span>
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-center">
                          Ready to Launch
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4 text-center">
                          Review your settings and launch your professional real
                          estate website.
                        </p>
                        <ul className="space-y-2">
                          <li className="flex items-start text-sm">
                            <span className="text-primary mr-2">✓</span>
                            <span>SSL certificate</span>
                          </li>
                          <li className="flex items-start text-sm">
                            <span className="text-primary mr-2">✓</span>
                            <span>Fast deployment</span>
                          </li>
                          <li className="flex items-start text-sm">
                            <span className="text-primary mr-2">✓</span>
                            <span>24/7 support</span>
                          </li>
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </ProtectedRoute>
  );
}
