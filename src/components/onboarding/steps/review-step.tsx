"use client";

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
import { Separator } from "@/components/ui/separator";
import { PRICING_PLANS } from "@/constants/pricing";
import { WizardStepProps } from "@/types/onboarding";
import {
  ArrowLeft,
  Check,
  CreditCard,
  Building2,
  Globe,
  Palette,
  FileText,
  Users,
  Target,
} from "lucide-react";
import { useState, useEffect } from "react";

interface Theme {
  id: string;
  name: string;
  description: string;
  category: string;
}

export default function ReviewStep({
  data,
  updateData,
  errors,
  onNext,
  onBack,
  isSubmitting,
  isStepValid,
}: WizardStepProps) {
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [themesLoading, setThemesLoading] = useState(true);

  const selectedPlan =
    PRICING_PLANS.find((plan) => plan.id === data.selectedPlan) ||
    PRICING_PLANS[1];
  const isYearly = data.billingCycle === "yearly";
  const price = isYearly ? selectedPlan.yearlyPrice : selectedPlan.monthlyPrice;
  const displayPrice = isYearly
    ? Math.round(selectedPlan.yearlyPrice / 12)
    : selectedPlan.monthlyPrice;

  // Fetch themes on component mount
  useEffect(() => {
    const fetchThemes = async () => {
      try {
        const response = await fetch("/api/themes");
        if (response.ok) {
          const result = await response.json();
          setThemes(result.themes || []);
        } else {
          console.error("Failed to fetch themes");
        }
      } catch (error) {
        console.error("Error fetching themes:", error);
      } finally {
        setThemesLoading(false);
      }
    };

    fetchThemes();
  }, []);

  // Get theme name from fetched themes
  const getThemeName = (themeId: string) => {
    if (!themeId) return "Default";
    const theme = themes.find((t) => t.id === themeId);
    return theme ? theme.name : "Unknown Theme";
  };

  const handleProceedToPayment = async () => {
    setIsProcessingPayment(true);

    try {
      // Create Stripe checkout session
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planId: data.selectedPlan,
          billingCycle: data.billingCycle || "monthly",
          isSignup: true, // This is for the signup flow
          customerEmail: data.email, // Pass email for Stripe checkout
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      const { url } = await response.json();

      if (url) {
        // Store form data in localStorage before redirecting to Stripe
        localStorage.setItem("pendingSignupData", JSON.stringify(data));
        // Redirect to Stripe checkout
        window.location.href = url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error) {
      console.error("Payment setup error:", error);
      // Handle error appropriately
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column - Form Review */}
        <div className="space-y-4">
          {/* Plan Selection Review */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Selected Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{selectedPlan.name}</span>
                  {selectedPlan.popular && (
                    <Badge variant="default">Most Popular</Badge>
                  )}
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg">
                    ${displayPrice}/{isYearly ? "mo" : "mo"}
                  </div>
                  {isYearly && (
                    <div className="text-sm text-muted-foreground">
                      Billed yearly (${price})
                    </div>
                  )}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {selectedPlan.description}
              </p>
              <div className="text-xs text-muted-foreground">
                Billing cycle: {isYearly ? "Yearly" : "Monthly"}
              </div>
            </CardContent>
          </Card>

          {/* Business Information Review */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Business Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Full Name:</span>
                  <p className="font-medium">
                    {data.fullName || "Not provided"}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Email:</span>
                  <p className="font-medium">{data.email || "Not provided"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Company:</span>
                  <p className="font-medium">
                    {data.companyName || "Not provided"}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Domain:</span>
                  <p className="font-medium">
                    {data.domainName || "Not provided"}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Location:</span>
                  <p className="font-medium">
                    {data.city && data.country
                      ? `${data.city}, ${data.country}`
                      : "Not provided"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Website Configuration Review */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Website Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Selected Theme:</span>
                  <p className="font-medium">
                    {themesLoading
                      ? "Loading..."
                      : data.selectedTheme
                      ? getThemeName(data.selectedTheme)
                      : "Default"}
                  </p>
                </div>
                {data.tagline && (
                  <div>
                    <span className="text-muted-foreground">Tagline:</span>
                    <p className="font-medium">{data.tagline}</p>
                  </div>
                )}
                {data.brandColors && data.brandColors.length > 0 && (
                  <div>
                    <span className="text-muted-foreground">Brand Colors:</span>
                    <div className="flex gap-2 mt-1">
                      {data.brandColors.map((color, index) => (
                        <div
                          key={index}
                          className="w-6 h-6 rounded-full border border-gray-300"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                )}
                {data.propertyTypes && data.propertyTypes.length > 0 && (
                  <div>
                    <span className="text-muted-foreground">
                      Property Types:
                    </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {data.propertyTypes.map((type, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {data.includedPages && data.includedPages.length > 0 && (
                  <div>
                    <span className="text-muted-foreground">
                      Website Pages:
                    </span>
                    <p className="font-medium">
                      {data.includedPages.length} pages selected
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Marketing Setup Review */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Marketing Setup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                {data.preferredContactMethod &&
                  data.preferredContactMethod.length > 0 && (
                    <div>
                      <span className="text-muted-foreground">
                        Preferred Contact Methods:
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {data.preferredContactMethod.map((method, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            {method}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                {data.adsConnections && data.adsConnections.length > 0 ? (
                  <div>
                    <span className="text-muted-foreground">
                      Ad Platform Connections:
                    </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {data.adsConnections.map((platform, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs capitalize"
                        >
                          {platform}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <span className="text-muted-foreground">
                      Ad Platform Connections:
                    </span>
                    <p className="text-xs text-muted-foreground">
                      None selected (optional)
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Plan Features & Summary */}
        <div className="space-y-4">
          {/* Plan Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                What You Get
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {selectedPlan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-600" />
                    {feature}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Price Summary */}
          <Card className="border-primary">
            <CardHeader>
              <CardTitle className="text-center">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span>{selectedPlan.name} Plan</span>
                <span className="font-medium">
                  ${isYearly ? price : displayPrice}/
                  {isYearly ? "year" : "month"}
                </span>
              </div>

              {isYearly && (
                <div className="flex justify-between items-center text-green-600">
                  <span className="text-sm">Yearly Discount</span>
                  <span className="text-sm font-medium">
                    -{selectedPlan.yearlyDiscount}
                  </span>
                </div>
              )}

              <Separator />

              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total</span>
                <span>${isYearly ? price : displayPrice}</span>
              </div>

              <div className="text-xs text-center text-muted-foreground">
                {isYearly ? "Billed annually" : "Billed monthly"}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Terms Agreement */}
      <div className="pt-6 border-t">
        <div className="flex items-start space-x-3">
          <Checkbox
            id="agreeToTerms"
            checked={data.agreeToTerms || false}
            onCheckedChange={(checked) => updateData({ agreeToTerms: checked })}
          />
          <div className="text-sm leading-relaxed">
            <label htmlFor="agreeToTerms" className="cursor-pointer">
              I agree to the{" "}
              <a
                href="/terms-of-service"
                target="_blank"
                className="text-primary underline hover:no-underline"
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="/privacy-policy"
                target="_blank"
                className="text-primary underline hover:no-underline"
              >
                Privacy Policy
              </a>
              . I understand that by proceeding to payment, I am agreeing to
              these terms and conditions.
            </label>
          </div>
        </div>
        {errors.agreeToTerms && (
          <p className="text-red-500 text-sm mt-2">{errors.agreeToTerms}</p>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack} size="lg" className="px-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          onClick={handleProceedToPayment}
          size="lg"
          className="px-8"
          disabled={isProcessingPayment || !isStepValid || !data.agreeToTerms}
        >
          {isProcessingPayment ? "Setting up payment..." : "Proceed to Payment"}
        </Button>
      </div>
    </div>
  );
}
