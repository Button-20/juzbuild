"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WizardStepProps } from "@/types/onboarding";
import { debounce } from "@/utils/helpers";
import {
  ArrowLeft,
  Building,
  Eye,
  EyeOff,
  Globe,
  Lock,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react";
import React from "react";

// Removed ROLES since it's no longer needed in the simplified flow

const COUNTRIES = [
  "United States",
  "Canada",
  "United Kingdom",
  "Australia",
  "Germany",
  "France",
  "Ghana",
  "Nigeria",
  "South Africa",
  "Kenya",
  "Spain",
  "Italy",
  "Netherlands",
  "Sweden",
  "Norway",
  "Denmark",
  "Brazil",
  "Mexico",
  "Argentina",
  "Other",
];

export default function SignupStep({
  data,
  updateData,
  errors,
  onNext,
  onBack,
  isFirst,
  isStepValid,
  isValidatingEmail,
  emailAvailable,
}: WizardStepProps) {
  const [showPassword, setShowPassword] = React.useState(false);
  const [isValidatingDomain, setIsValidatingDomain] = React.useState(false);
  const [domainAvailable, setDomainAvailable] = React.useState<boolean | null>(
    null
  );

  // Domain validation function
  const validateDomainAsync = React.useCallback(async (domain: string) => {
    if (
      !domain.trim() ||
      domain.length < 3 ||
      !/^[a-zA-Z0-9-]+$/.test(domain)
    ) {
      setDomainAvailable(null);
      return;
    }

    setIsValidatingDomain(true);
    try {
      const response = await fetch(
        `/api/check-domain?domain=${encodeURIComponent(domain)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();
      setDomainAvailable(result.available);
    } catch (error) {
      console.error("Error validating domain:", error);
      setDomainAvailable(null);
    } finally {
      setIsValidatingDomain(false);
    }
  }, []);

  // Debounced domain validation
  const debouncedValidateDomain = React.useCallback(
    debounce((domain: string) => {
      if (domain) {
        validateDomainAsync(domain);
      }
    }, 500),
    [validateDomainAsync]
  );

  // Trigger debounced domain validation when domain changes
  React.useEffect(() => {
    if (data.domainName) {
      debouncedValidateDomain(data.domainName);
    } else {
      setDomainAvailable(null);
    }
  }, [data.domainName, debouncedValidateDomain]);

  return (
    <div className="space-y-8">
      {/* Personal Information */}
      <div className="space-y-6">
        <div className="border-l-4 border-primary pl-4">
          <h3 className="text-lg font-semibold mb-1">Personal Information</h3>
          <p className="text-sm text-muted-foreground">
            Tell us about yourself and your business
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Full Name *
            </Label>
            <Input
              id="fullName"
              placeholder="John Doe"
              value={data.fullName || ""}
              onChange={(e) => updateData({ fullName: e.target.value })}
              className={`h-12 ${errors.fullName ? "border-destructive" : ""}`}
            />
            {errors.fullName && (
              <p className="text-destructive text-sm">{errors.fullName}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email Address *
            </Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={data.email || ""}
                onChange={(e) => updateData({ email: e.target.value })}
                className={`h-12 ${errors.email ? "border-destructive" : ""}`}
              />
              {isValidatingEmail && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                </div>
              )}
            </div>
            {errors.email && (
              <p className="text-destructive text-sm">{errors.email}</p>
            )}
            {data.email &&
              /\S+@\S+\.\S+/.test(data.email) &&
              !errors.email &&
              !isValidatingEmail &&
              emailAvailable === true && (
                <p className="text-green-600 text-sm">✓ Email is available</p>
              )}
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="phoneNumber" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Phone Number *
            </Label>
            <Input
              id="phoneNumber"
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={data.phoneNumber || ""}
              onChange={(e) => updateData({ phoneNumber: e.target.value })}
              className={`h-12 ${
                errors.phoneNumber ? "border-destructive" : ""
              }`}
            />
            {errors.phoneNumber && (
              <p className="text-destructive text-sm">{errors.phoneNumber}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password" className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Password *
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Min. 8 characters"
                value={data.password || ""}
                onChange={(e) => updateData({ password: e.target.value })}
                className={`h-12 pr-12 ${
                  errors.password ? "border-destructive" : ""
                }`}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </Button>
            </div>
            {errors.password && (
              <p className="text-destructive text-sm">{errors.password}</p>
            )}
          </div>
        </div>
      </div>

      {/* Business Information */}
      <div className="space-y-6">
        <div className="border-l-4 border-primary pl-4">
          <h3 className="text-lg font-semibold mb-1">Business Details</h3>
          <p className="text-sm text-muted-foreground">
            Information about your real estate business
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Company Name */}
          <div className="space-y-2">
            <Label htmlFor="companyName" className="flex items-center gap-2">
              <Building className="w-4 h-4" />
              Company/Agency Name *
            </Label>
            <Input
              id="companyName"
              placeholder="Premier Real Estate Group"
              value={data.companyName || ""}
              onChange={(e) => updateData({ companyName: e.target.value })}
              className={`h-12 ${
                errors.companyName ? "border-destructive" : ""
              }`}
            />
            {errors.companyName && (
              <p className="text-destructive text-sm">{errors.companyName}</p>
            )}
          </div>

          {/* Domain Name */}
          <div className="space-y-2">
            <Label htmlFor="domainName" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Website Domain Name *
            </Label>
            <div className="relative">
              <Input
                id="domainName"
                placeholder="premier-realty"
                value={data.domainName || ""}
                onChange={(e) => {
                  // Clean the input to only allow valid domain characters
                  const cleanValue = e.target.value
                    .toLowerCase()
                    .replace(/[^a-z0-9-]/g, "");
                  updateData({ domainName: cleanValue });
                  setDomainAvailable(null); // Reset validation state
                }}
                className={`h-12 pr-32 ${
                  errors.domainName
                    ? "border-destructive"
                    : domainAvailable === false
                    ? "border-destructive"
                    : domainAvailable === true
                    ? "border-green-500"
                    : ""
                }`}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                {isValidatingDomain && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                )}
                <span className="text-sm text-muted-foreground">
                  .onjuzbuild.com
                </span>
              </div>
            </div>
            {errors.domainName && (
              <p className="text-destructive text-sm">{errors.domainName}</p>
            )}
            {data.domainName && !errors.domainName && !isValidatingDomain && (
              <>
                {domainAvailable === true && (
                  <p className="text-green-600 text-sm">
                    ✓{" "}
                    <span className="font-medium">
                      {data.domainName}.onjuzbuild.com
                    </span>{" "}
                    is available!
                  </p>
                )}
                {domainAvailable === false && (
                  <p className="text-destructive text-sm">
                    ✗{" "}
                    <span className="font-medium">
                      {data.domainName}.onjuzbuild.com
                    </span>{" "}
                    is already taken
                  </p>
                )}
                {domainAvailable === null && data.domainName.length >= 3 && (
                  <p className="text-sm text-muted-foreground">
                    Your website will be:{" "}
                    <span className="font-medium text-primary">
                      {data.domainName}.onjuzbuild.com
                    </span>
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Country */}
          <div className="space-y-2">
            <Label htmlFor="country" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Country *
            </Label>
            <Select
              value={data.country || ""}
              onValueChange={(value) => updateData({ country: value })}
            >
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.country && (
              <p className="text-destructive text-sm">{errors.country}</p>
            )}
          </div>

          {/* City */}
          <div className="space-y-2">
            <Label htmlFor="city" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              City *
            </Label>
            <Input
              id="city"
              placeholder="New York"
              value={data.city || ""}
              onChange={(e) => updateData({ city: e.target.value })}
              className={`h-12 ${errors.city ? "border-destructive" : ""}`}
            />
            {errors.city && (
              <p className="text-destructive text-sm">{errors.city}</p>
            )}
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
          disabled={!isStepValid || isValidatingEmail}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
