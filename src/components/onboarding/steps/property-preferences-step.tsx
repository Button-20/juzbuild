"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { ArrowLeft, DollarSign, Home, MapPin, Plus, X } from "lucide-react";
import { useState } from "react";

const PROPERTY_TYPES = [
  "Houses",
  "Apartments",
  "Commercial",
  "Land",
  "Rentals",
  "Sales",
  "Condos",
  "Townhouses",
  "Luxury Homes",
  "Investment Properties",
];

const CURRENCIES = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "GHS", name: "Ghanaian Cedi", symbol: "₵" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "NGN", name: "Nigerian Naira", symbol: "₦" },
  { code: "ZAR", name: "South African Rand", symbol: "R" },
];

export default function PropertyPreferencesStep({
  data,
  updateData,
  errors,
  onNext,
  onBack,
}: WizardStepProps) {
  const [newLocation, setNewLocation] = useState("");

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

  const addLocation = () => {
    if (
      newLocation.trim() &&
      !(data.locationCoverage || []).includes(newLocation.trim())
    ) {
      updateData({
        locationCoverage: [
          ...(data.locationCoverage || []),
          newLocation.trim(),
        ],
      });
      setNewLocation("");
    }
  };

  const removeLocation = (location: string) => {
    updateData({
      locationCoverage: (data.locationCoverage || []).filter(
        (l) => l !== location
      ),
    });
  };

  const selectedCurrency = CURRENCIES.find((c) => c.code === data.currency);

  // Helper functions for comma formatting
  const formatNumberWithCommas = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const removeCommas = (str: string): string => {
    return str.replace(/,/g, "");
  };

  const handlePriceChange = (field: 'minPrice' | 'maxPrice', value: string) => {
    // Remove all non-digit characters except commas
    const cleanValue = value.replace(/[^\d,]/g, "");
    // Remove commas and convert to number
    const numericValue = removeCommas(cleanValue);
    const parsedValue = parseInt(numericValue) || 0;
    updateData({ [field]: parsedValue });
  };

  const getDisplayValue = (value: number | undefined): string => {
    if (!value) return "";
    return formatNumberWithCommas(value);
  };

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
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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

      {/* Price Range */}
      <div className="space-y-6">
        <div className="border-l-4 border-primary pl-4">
          <h3 className="text-lg font-semibold mb-1">Price Range</h3>
          <p className="text-sm text-muted-foreground">
            Set the typical price range for your properties
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Currency */}
          <div className="space-y-3 mt-1">
            <Label htmlFor="currency" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Currency *
            </Label>
            <Select
              value={data.currency || ""}
              onValueChange={(value) => updateData({ currency: value })}
            >
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    {currency.symbol} - {currency.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.currency && (
              <p className="text-destructive text-sm">{errors.currency}</p>
            )}
          </div>

          {/* Min Price */}
          <div className="space-y-2">
            <Label htmlFor="minPrice">Minimum Price *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {selectedCurrency?.symbol || "$"}
              </span>
              <Input
                id="minPrice"
                type="text"
                placeholder="50,000"
                value={getDisplayValue(data.minPrice)}
                onChange={(e) => handlePriceChange('minPrice', e.target.value)}
                className={`h-12 pl-8 ${
                  errors.minPrice ? "border-destructive" : ""
                }`}
              />
            </div>
            {errors.minPrice && (
              <p className="text-destructive text-sm">{errors.minPrice}</p>
            )}
          </div>

          {/* Max Price */}
          <div className="space-y-2">
            <Label htmlFor="maxPrice">Maximum Price *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {selectedCurrency?.symbol || "$"}
              </span>
              <Input
                id="maxPrice"
                type="text"
                placeholder="500,000"
                value={getDisplayValue(data.maxPrice)}
                onChange={(e) => handlePriceChange('maxPrice', e.target.value)}
                className={`h-12 pl-8 ${
                  errors.maxPrice ? "border-destructive" : ""
                }`}
              />
            </div>
            {errors.maxPrice && (
              <p className="text-destructive text-sm">{errors.maxPrice}</p>
            )}
          </div>
        </div>
      </div>

      {/* Location Coverage */}
      <div className="space-y-6">
        <div className="border-l-4 border-primary pl-4">
          <h3 className="text-lg font-semibold mb-1">Service Areas</h3>
          <p className="text-sm text-muted-foreground">
            Add the cities or areas you serve
          </p>
        </div>

        <div className="space-y-4">
          <Label className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Location Coverage *
          </Label>

          {/* Add Location Input */}
          <div className="flex gap-2">
            <Input
              placeholder="Enter city or area name"
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addLocation();
                }
              }}
              className="h-12"
            />
            <Button
              type="button"
              onClick={addLocation}
              size="lg"
              className="px-4"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Location Tags */}
          {data.locationCoverage && data.locationCoverage.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {data.locationCoverage.map((location) => (
                <Badge
                  key={location}
                  variant="secondary"
                  className="px-3 py-1 text-sm"
                >
                  {location}
                  <button
                    type="button"
                    onClick={() => removeLocation(location)}
                    className="ml-2 hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {errors.locationCoverage && (
            <p className="text-destructive text-sm">
              {errors.locationCoverage}
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
        <Button onClick={onNext} size="lg" className="px-8">
          Continue
        </Button>
      </div>
    </div>
  );
}
