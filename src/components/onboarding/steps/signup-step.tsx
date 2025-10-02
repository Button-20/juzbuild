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
import { Building, Eye, EyeOff, Lock, Mail, MapPin, User } from "lucide-react";
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
  isFirst,
}: WizardStepProps) {
  const [showPassword, setShowPassword] = React.useState(false);

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
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={data.email || ""}
              onChange={(e) => updateData({ email: e.target.value })}
              className={`h-12 ${errors.email ? "border-destructive" : ""}`}
            />
            {errors.email && (
              <p className="text-destructive text-sm">{errors.email}</p>
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
            className={`h-12 ${errors.companyName ? "border-destructive" : ""}`}
          />
          {errors.companyName && (
            <p className="text-destructive text-sm">{errors.companyName}</p>
          )}
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
        <div></div>
        <Button onClick={onNext} size="lg" className="px-8">
          Continue
        </Button>
      </div>
    </div>
  );
}
