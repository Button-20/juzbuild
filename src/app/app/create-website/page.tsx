"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, CheckCircle, Globe, Palette } from "lucide-react";
import { useWebsite } from "@/contexts/website-context";
import { toast } from "sonner";
import { CreateWebsiteParams } from "@/types/website";
import { DeploymentTracker } from "@/components/deployment-tracker";

const themes = [
  {
    id: "homely",
    name: "Homely",
    description: "Real Estate & Property Management",
    color: "bg-blue-500",
  },
  {
    id: "corporate",
    name: "Corporate",
    description: "Professional Business Website",
    color: "bg-slate-600",
  },
  {
    id: "ecommerce",
    name: "E-Commerce",
    description: "Online Store & Shopping",
    color: "bg-green-500",
  },
  {
    id: "portfolio",
    name: "Portfolio",
    description: "Creative & Personal Showcase",
    color: "bg-purple-500",
  },
  {
    id: "blog",
    name: "Blog",
    description: "Content & Publishing Platform",
    color: "bg-orange-500",
  },
];

const plans = [
  {
    id: "starter",
    name: "Starter",
    description: "Perfect for small businesses",
    price: { monthly: 29, yearly: 290 },
    features: [
      "1 Website",
      "Custom Domain",
      "Basic Templates",
      "Email Support",
    ],
    websiteLimit: 1,
  },
  {
    id: "pro",
    name: "Pro",
    description: "For growing businesses",
    price: { monthly: 79, yearly: 790 },
    features: [
      "5 Websites",
      "Advanced Templates",
      "Analytics",
      "Priority Support",
    ],
    websiteLimit: 5,
  },
  {
    id: "agency",
    name: "Agency",
    description: "For agencies and enterprises",
    price: { monthly: 199, yearly: 1990 },
    features: ["20 Websites", "White-label", "API Access", "Dedicated Support"],
    websiteLimit: 20,
  },
];

export default function CreateWebsite() {
  const router = useRouter();
  const { createWebsite, websites } = useWebsite();
  const [isCreating, setIsCreating] = useState(false);
  const [createdWebsite, setCreatedWebsite] = useState<{
    id: string;
    name: string;
    jobId?: string;
  } | null>(null);
  const [formData, setFormData] = useState<CreateWebsiteParams>({
    companyName: "",
    domainName: "",
    tagline: "",
    aboutSection: "",
    selectedTheme: "",
    selectedPlan: "starter",
    billingCycle: "monthly",
    includedPages: ["home", "about", "contact"],
    propertyTypes: ["house"],
    preferredContactMethod: ["email"],
  });

  const handleInputChange = (
    field: keyof CreateWebsiteParams,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.companyName ||
      !formData.domainName ||
      !formData.selectedTheme
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Check website limit based on selected plan
    const selectedPlanData = plans.find((p) => p.id === formData.selectedPlan);
    if (selectedPlanData && websites.length >= selectedPlanData.websiteLimit) {
      toast.error(
        `You've reached the website limit for the ${selectedPlanData.name} plan`
      );
      return;
    }

    setIsCreating(true);

    try {
      const website = await createWebsite(formData);
      if (website) {
        setCreatedWebsite({
          id: website.id,
          name: formData.companyName,
          jobId: website.jobId,
        });
        toast.success("Website creation started!");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create website");
      setIsCreating(false);
    }
  };

  const selectedPlan = plans.find((p) => p.id === formData.selectedPlan);
  const selectedTheme = themes.find((t) => t.id === formData.selectedTheme);

  const handleDeploymentComplete = (websiteUrl: string) => {
    setIsCreating(false);
    toast.success("Website deployed successfully!");
    setTimeout(() => {
      router.push("/app/dashboard");
    }, 2000);
  };

  // If website is being created, show deployment tracking
  if (createdWebsite) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Deploying Your Website</h1>
            <p className="text-muted-foreground">
              Please wait while we set up your website. This usually takes 2-5
              minutes.
            </p>
          </div>

          <DeploymentTracker
            websiteId={createdWebsite.id}
            jobId={createdWebsite.jobId}
            websiteName={createdWebsite.name}
            onComplete={handleDeploymentComplete}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Create New Website</h1>
            <p className="text-muted-foreground">
              Set up your new website in just a few steps
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Basic Information
              </CardTitle>
              <CardDescription>
                Tell us about your website and business
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company/Website Name *</Label>
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
                    placeholder="e.g., acme-realestate.com"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    We'll help you purchase this domain if it's available
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tagline">Business Tagline</Label>
                <Input
                  id="tagline"
                  value={formData.tagline}
                  onChange={(e) => handleInputChange("tagline", e.target.value)}
                  placeholder="e.g., Your Dream Home Awaits"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="aboutSection">About Your Business</Label>
                <Textarea
                  id="aboutSection"
                  value={formData.aboutSection}
                  onChange={(e) =>
                    handleInputChange("aboutSection", e.target.value)
                  }
                  placeholder="Tell visitors about your business, services, and what makes you unique..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Theme Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Choose Your Theme
              </CardTitle>
              <CardDescription>
                Select a theme that matches your business type
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {themes.map((theme) => (
                  <div
                    key={theme.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all hover:border-primary ${
                      formData.selectedTheme === theme.id
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    }`}
                    onClick={() => handleInputChange("selectedTheme", theme.id)}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-4 h-4 rounded-full ${theme.color}`} />
                      <h3 className="font-medium">{theme.name}</h3>
                      {formData.selectedTheme === theme.id && (
                        <CheckCircle className="h-4 w-4 text-primary ml-auto" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {theme.description}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Page Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Pages & Features
              </CardTitle>
              <CardDescription>
                Select the pages and features you want to include
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-sm font-medium">Included Pages</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                  {[
                    { id: "home", label: "Home Page", required: true },
                    { id: "about", label: "About Us", required: true },
                    { id: "contact", label: "Contact", required: true },
                    { id: "services", label: "Services" },
                    { id: "portfolio", label: "Portfolio" },
                    { id: "blog", label: "Blog" },
                    { id: "testimonials", label: "Testimonials" },
                    { id: "faq", label: "FAQ" },
                    { id: "privacy", label: "Privacy Policy" },
                  ].map((page) => (
                    <div key={page.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`page-${page.id}`}
                        checked={
                          formData.includedPages?.includes(page.id) || false
                        }
                        disabled={page.required}
                        onChange={(e) => {
                          const currentPages = formData.includedPages || [];
                          const newPages = e.target.checked
                            ? [...currentPages, page.id]
                            : currentPages.filter((p) => p !== page.id);
                          setFormData((prev) => ({
                            ...prev,
                            includedPages: newPages,
                          }));
                        }}
                        className="rounded border-gray-300"
                      />
                      <label htmlFor={`page-${page.id}`} className="text-sm">
                        {page.label}
                        {page.required && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">
                  Property Types (for Real Estate themes)
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                  {[
                    { id: "house", label: "Houses" },
                    { id: "apartment", label: "Apartments" },
                    { id: "condo", label: "Condos" },
                    { id: "townhouse", label: "Townhouses" },
                    { id: "land", label: "Land/Lots" },
                    { id: "commercial", label: "Commercial" },
                  ].map((type) => (
                    <div key={type.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`property-${type.id}`}
                        checked={
                          formData.propertyTypes?.includes(type.id) || false
                        }
                        onChange={(e) => {
                          const currentTypes = formData.propertyTypes || [];
                          const newTypes = e.target.checked
                            ? [...currentTypes, type.id]
                            : currentTypes.filter((t) => t !== type.id);
                          setFormData((prev) => ({
                            ...prev,
                            propertyTypes: newTypes,
                          }));
                        }}
                        className="rounded border-gray-300"
                      />
                      <label
                        htmlFor={`property-${type.id}`}
                        className="text-sm"
                      >
                        {type.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Contact Methods</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                  {[
                    { id: "email", label: "Email" },
                    { id: "phone", label: "Phone" },
                    { id: "whatsapp", label: "WhatsApp" },
                    { id: "contact-form", label: "Contact Form" },
                    { id: "live-chat", label: "Live Chat" },
                  ].map((method) => (
                    <div
                      key={method.id}
                      className="flex items-center space-x-2"
                    >
                      <input
                        type="checkbox"
                        id={`contact-${method.id}`}
                        checked={
                          formData.preferredContactMethod?.includes(
                            method.id
                          ) || false
                        }
                        onChange={(e) => {
                          const currentMethods =
                            formData.preferredContactMethod || [];
                          const newMethods = e.target.checked
                            ? [...currentMethods, method.id]
                            : currentMethods.filter((m) => m !== method.id);
                          setFormData((prev) => ({
                            ...prev,
                            preferredContactMethod: newMethods,
                          }));
                        }}
                        className="rounded border-gray-300"
                      />
                      <label
                        htmlFor={`contact-${method.id}`}
                        className="text-sm"
                      >
                        {method.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Plan Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Choose Your Plan</CardTitle>
              <CardDescription>
                Select a plan that fits your needs. You can upgrade anytime.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-4 mb-6">
                <Button
                  type="button"
                  variant={
                    formData.billingCycle === "monthly" ? "default" : "outline"
                  }
                  onClick={() => handleInputChange("billingCycle", "monthly")}
                  size="sm"
                >
                  Monthly
                </Button>
                <Button
                  type="button"
                  variant={
                    formData.billingCycle === "yearly" ? "default" : "outline"
                  }
                  onClick={() => handleInputChange("billingCycle", "yearly")}
                  size="sm"
                >
                  Yearly{" "}
                  <Badge variant="secondary" className="ml-2">
                    Save 17%
                  </Badge>
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`p-6 border rounded-lg cursor-pointer transition-all ${
                      formData.selectedPlan === plan.id
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    }`}
                    onClick={() => handleInputChange("selectedPlan", plan.id)}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-lg">{plan.name}</h3>
                      {formData.selectedPlan === plan.id && (
                        <CheckCircle className="h-5 w-5 text-primary" />
                      )}
                    </div>

                    <div className="mb-4">
                      <div className="text-2xl font-bold">
                        $
                        {
                          plan.price[
                            formData.billingCycle as keyof typeof plan.price
                          ]
                        }
                      </div>
                      <div className="text-sm text-muted-foreground">
                        per{" "}
                        {formData.billingCycle === "monthly" ? "month" : "year"}
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4">
                      {plan.description}
                    </p>

                    <ul className="text-sm space-y-2">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Summary & Submit */}
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Website:</span>
                  <span>{formData.companyName || "Not specified"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Domain:</span>
                  <span>{formData.domainName || "Not specified"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Theme:</span>
                  <span>{selectedTheme?.name || "Not selected"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Plan:</span>
                  <span>
                    {selectedPlan?.name} ($
                    {
                      selectedPlan?.price[
                        formData.billingCycle as keyof typeof selectedPlan.price
                      ]
                    }
                    /{formData.billingCycle === "monthly" ? "mo" : "yr"})
                  </span>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={
                  isCreating ||
                  !formData.companyName ||
                  !formData.domainName ||
                  !formData.selectedTheme
                }
              >
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating Website...
                  </>
                ) : (
                  "Create Website"
                )}
              </Button>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
