"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Loader2,
  CheckCircle,
  Globe,
  Palette,
  Upload,
  Check,
  Home,
  Layout,
  FileText,
  MessageCircle,
  Key,
  Building,
  Settings,
  Users,
  Rocket,
} from "lucide-react";
import { useWebsite } from "@/contexts/website-context";
import { toast } from "sonner";
import { CreateWebsiteParams } from "@/types/website";
import { WebsiteTheme } from "@/types/onboarding";
import { DeploymentTracker } from "@/components/deployment-tracker";
import { COLOR_PALETTES } from "@/constants/color-palettes";
import { PRICING_PLANS } from "@/constants/pricing";
import { AnimatePresence, motion } from "framer-motion";

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
  { id: "live-chat", label: "Live Chat" },
];

// Use consistent pricing from constants
const plans = PRICING_PLANS;

export default function OnboardingPage() {
  const router = useRouter();
  const { createWebsite, websites } = useWebsite();
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
      description: "Final review and billing",
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
    selectedPlan: "pro",
    billingCycle: "monthly",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
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

    // Website limit will be checked server-side based on user's subscription

    setIsCreating(true);

    try {
      const website = await createWebsite(formData);
      if (website) {
        toast.success("Website creation started!");
        setTimeout(() => {
          router.push("/app/dashboard");
        }, 2000);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create website");
      setIsCreating(false);
    }
  };

  const selectedPlan = plans.find((p) => p.id === formData.selectedPlan);
  const selectedTheme = themes.find((t) => t.id === formData.selectedTheme);

  return (
    <ProtectedRoute>
      <SidebarInset>
        <SiteHeader />
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/50 py-6">
          <div className="max-w-7xl mx-auto px-4">
            {/* Progress Header */}
            <div className="mb-8 max-w-4xl mx-auto">
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-2 text-center">
                Create New Website
              </h1>
              <p className="text-muted-foreground text-center mb-4">
                Set up your new real estate website in just a few steps
              </p>

              {/* Progress Bar */}
              <div className="max-w-2xl mx-auto mb-4">
                <div className="flex justify-between text-sm text-muted-foreground mb-2">
                  <span>
                    Step {currentStep} of {steps.length}
                  </span>
                  <span>
                    {Math.round((currentStep / steps.length) * 100)}% Complete
                  </span>
                </div>
                <Progress
                  value={(currentStep / steps.length) * 100}
                  className="h-2"
                />
              </div>

              {/* Step Indicators */}
              <div className="flex justify-center items-center space-x-2">
                {steps.map((step, index) => (
                  <div key={step.number} className="flex items-center">
                    <div
                      className={`flex items-center justify-center w-6 h-6 md:w-8 md:h-8 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                        index < currentStep - 1
                          ? "bg-primary text-primary-foreground"
                          : index === currentStep - 1
                          ? "bg-primary/20 text-primary border-2 border-primary"
                          : "bg-muted text-muted-foreground"
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
              <div className="lg:col-span-2 order-1">
                <Card className="border-2 border-border/50 shadow-xl bg-card/50 backdrop-blur-sm">
                  <CardHeader className="text-center pb-6">
                    <CardTitle className="text-xl md:text-2xl font-bold">
                      {steps[currentStep - 1]?.title}
                    </CardTitle>
                    <CardDescription className="text-sm md:text-base">
                      {steps[currentStep - 1]?.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
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
                                  handleInputChange(
                                    "companyName",
                                    e.target.value
                                  )
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
                                  handleInputChange(
                                    "domainName",
                                    e.target.value
                                  )
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
                                handleInputChange(
                                  "aboutSection",
                                  e.target.value
                                )
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
                                  handleInputChange(
                                    "phoneNumber",
                                    e.target.value
                                  )
                                }
                                placeholder="e.g., +1 (555) 123-4567"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="supportEmail">
                                Support Email
                              </Label>
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
                                    {isUploading
                                      ? "Uploading..."
                                      : "Change Logo"}
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
                              Choose a professional color palette for your
                              website
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
                              <div className="grid grid-cols-2 gap-4">
                                {themes.map((theme) => {
                                  const isSelected =
                                    formData.selectedTheme === theme.id;
                                  return (
                                    <button
                                      key={theme.id}
                                      type="button"
                                      className={`text-left border rounded-lg overflow-hidden transition-all ${
                                        isSelected
                                          ? "border-primary ring-2 ring-primary/20 shadow-lg"
                                          : "border-border hover:border-primary/50"
                                      }`}
                                      onClick={() =>
                                        handleInputChange(
                                          "selectedTheme",
                                          theme.id
                                        )
                                      }
                                    >
                                      <div className="aspect-video bg-muted relative">
                                        {theme.previewImage && (
                                          <img
                                            src={theme.previewImage}
                                            alt={theme.name}
                                            className="w-full h-full object-cover"
                                          />
                                        )}
                                        {isSelected && (
                                          <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                                            <Check className="w-4 h-4 text-white" />
                                          </div>
                                        )}
                                      </div>
                                      <div className="p-3">
                                        <h4 className="font-semibold text-sm">
                                          {theme.name}
                                        </h4>
                                        <p className="text-xs text-muted-foreground">
                                          {theme.description}
                                        </p>
                                      </div>
                                    </button>
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
                                  formData.propertyTypes?.includes(type) ||
                                  false;
                                return (
                                  <button
                                    key={type}
                                    type="button"
                                    className={`p-3 text-sm border rounded-lg transition-all text-left ${
                                      isSelected
                                        ? "border-primary bg-primary/5"
                                        : "border-border hover:border-primary/50"
                                    }`}
                                    onClick={() =>
                                      handlePropertyTypeToggle(type)
                                    }
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
                                    className={`p-3 border rounded-lg flex items-start justify-between ${
                                      isSelected
                                        ? "border-primary bg-primary/5"
                                        : "border-border"
                                    } ${isRequired ? "opacity-75" : ""}`}
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
                                    <Checkbox
                                      checked={isSelected}
                                      disabled={isRequired}
                                      onChange={() =>
                                        !isRequired && handlePageToggle(page.id)
                                      }
                                    />
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
                              {LEAD_CAPTURE_OPTIONS.map((option) => {
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
                          {/* Plan Selection */}
                          <div className="space-y-4">
                            <h3 className="font-semibold flex items-center gap-2 text-lg">
                              <Palette className="w-5 h-5" />
                              Choose Your Plan
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Select a plan that fits your needs. You can
                              upgrade anytime.
                            </p>

                            <div className="flex gap-2 mb-6">
                              <Button
                                type="button"
                                variant={
                                  formData.billingCycle === "monthly"
                                    ? "default"
                                    : "outline"
                                }
                                onClick={() =>
                                  handleInputChange("billingCycle", "monthly")
                                }
                                size="sm"
                              >
                                Monthly
                              </Button>
                              <Button
                                type="button"
                                variant={
                                  formData.billingCycle === "yearly"
                                    ? "default"
                                    : "outline"
                                }
                                onClick={() =>
                                  handleInputChange("billingCycle", "yearly")
                                }
                                size="sm"
                              >
                                Yearly{" "}
                                <Badge variant="secondary" className="ml-2">
                                  2 months free
                                </Badge>
                              </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {plans.map((plan) => (
                                <button
                                  key={plan.id}
                                  type="button"
                                  className={`relative p-4 border rounded-lg text-left transition-all ${
                                    formData.selectedPlan === plan.id
                                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                                      : "border-border hover:border-primary/50"
                                  } ${plan.popular ? "border-primary" : ""}`}
                                  onClick={() =>
                                    handleInputChange("selectedPlan", plan.id)
                                  }
                                >
                                  {plan.popular && (
                                    <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 text-nowrap">
                                      Most Popular
                                    </Badge>
                                  )}
                                  <div className="flex items-center justify-between mb-3">
                                    <h4 className="font-semibold">
                                      {plan.name}
                                    </h4>
                                    {formData.selectedPlan === plan.id && (
                                      <CheckCircle className="w-5 h-5 text-primary" />
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-3">
                                    {plan.description}
                                  </p>
                                  <p className="text-2xl font-bold mb-3">
                                    $
                                    {formData.billingCycle === "monthly"
                                      ? plan.monthlyPrice
                                      : plan.yearlyPrice}
                                    <span className="text-sm text-muted-foreground font-normal">
                                      /
                                      {formData.billingCycle === "monthly"
                                        ? "mo"
                                        : "yr"}
                                    </span>
                                  </p>
                                  <ul className="space-y-2">
                                    {plan.features.map((feature, idx) => (
                                      <li
                                        key={idx}
                                        className="text-xs text-muted-foreground flex items-center gap-2"
                                      >
                                        <Check className="w-3 h-3 text-primary" />
                                        {feature}
                                      </li>
                                    ))}
                                  </ul>
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Summary */}
                          <div className="border-t pt-6">
                            <h3 className="font-semibold text-lg mb-4">
                              Order Summary
                            </h3>
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
                                    (formData.billingCycle === "monthly"
                                      ? selectedPlan.monthlyPrice
                                      : selectedPlan.yearlyPrice)}
                                  /
                                  {formData.billingCycle === "monthly"
                                    ? "mo"
                                    : "yr"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Navigation Buttons */}
                      <div className="flex justify-between pt-6 gap-4 border-t">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={prevStep}
                          disabled={currentStep === 1}
                        >
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          Previous
                        </Button>

                        {currentStep < steps.length ? (
                          <Button type="button" onClick={nextStep}>
                            Next
                            <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                          </Button>
                        ) : (
                          <Button
                            type="submit"
                            disabled={
                              isCreating ||
                              !formData.companyName ||
                              !formData.domainName ||
                              !formData.selectedTheme ||
                              !formData.brandColors?.length ||
                              !formData.propertyTypes?.length
                            }
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

              {/* Right Side - Illustration */}
              <div className="order-1 lg:order-2">
                <Card className="sticky top-6 border-2 border-primary/20 shadow-xl bg-gradient-to-br from-primary/5 to-primary/10">
                  <CardContent className="p-6">
                    <AnimatePresence mode="wait">
                      {currentStep === 1 && (
                        <motion.div
                          key="step1"
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
                            Tell us about your business so we can create a
                            website that represents you perfectly.
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
                          key="step2"
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
                          key="step3"
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
                          key="step4"
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
                          key="step5"
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
                            Review your settings and launch your professional
                            real estate website.
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
        </div>
      </SidebarInset>
    </ProtectedRoute>
  );
}
