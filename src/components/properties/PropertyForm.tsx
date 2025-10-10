"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  CURRENCY_OPTIONS,
  Property,
  PROPERTY_STATUSES,
  propertySchema,
  PropertyType,
} from "@/types/properties";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  DollarSignIcon,
  HomeIcon,
  ImageIcon,
  MapPinIcon,
  PlusIcon,
  XIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Form schema (excluding server-side fields)
const propertyFormSchema = propertySchema.omit({
  _id: true,
  userId: true,
  domain: true,
  createdAt: true,
  updatedAt: true,
});

type PropertyFormData = z.infer<typeof propertyFormSchema>;

interface PropertyFormProps {
  property?: Property;
  propertyTypes: PropertyType[];
  onSuccess: () => void;
  onCancel: () => void;
}

export function PropertyForm({
  property,
  propertyTypes,
  onSuccess,
  onCancel,
}: PropertyFormProps) {
  const [loading, setLoading] = useState(false);
  const [amenityInput, setAmenityInput] = useState("");
  const [featureInput, setFeatureInput] = useState("");
  const [imageInput, setImageInput] = useState("");
  const [altInput, setAltInput] = useState("");
  const { toast } = useToast();

  // Initialize form with default values or existing property data
  const form = useForm<PropertyFormData>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      name: property?.name || "",
      slug: property?.slug || "",
      description: property?.description || "",
      location: property?.location || "",
      price: property?.price || 0,
      currency: property?.currency || "USD",
      propertyType: property?.propertyType || "",
      status: property?.status || "for-sale",
      beds: property?.beds || 0,
      baths: property?.baths || 0,
      area: property?.area || 0,
      images: property?.images || [],
      amenities: property?.amenities || [],
      features: property?.features || [],
      coordinates: property?.coordinates || undefined,
      isActive: property?.isActive ?? true,
      isFeatured: property?.isFeatured ?? false,
    },
  });

  // Watch name field to auto-generate slug
  const nameValue = form.watch("name");
  useEffect(() => {
    if (nameValue && !property) {
      // Only auto-generate for new properties
      const slug = nameValue
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "");
      form.setValue("slug", slug);
    }
  }, [nameValue, form, property]);

  // Handle form submission
  const onSubmit = async (data: PropertyFormData) => {
    try {
      setLoading(true);

      const url = property
        ? `/api/properties/${property._id}`
        : "/api/properties";
      const method = property ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save property");
      }

      toast({
        title: "Success",
        description: property
          ? "Property updated successfully"
          : "Property created successfully",
      });

      onSuccess();
    } catch (error) {
      console.error("Error saving property:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to save property",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle adding amenities
  const addAmenity = () => {
    if (amenityInput.trim()) {
      const currentAmenities = form.getValues("amenities");
      form.setValue("amenities", [...currentAmenities, amenityInput.trim()]);
      setAmenityInput("");
    }
  };

  // Handle removing amenities
  const removeAmenity = (index: number) => {
    const currentAmenities = form.getValues("amenities");
    form.setValue(
      "amenities",
      currentAmenities.filter((_, i) => i !== index)
    );
  };

  // Handle adding features
  const addFeature = () => {
    if (featureInput.trim()) {
      const currentFeatures = form.getValues("features");
      form.setValue("features", [...currentFeatures, featureInput.trim()]);
      setFeatureInput("");
    }
  };

  // Handle removing features
  const removeFeature = (index: number) => {
    const currentFeatures = form.getValues("features");
    form.setValue(
      "features",
      currentFeatures.filter((_, i) => i !== index)
    );
  };

  // Handle adding images
  const addImage = () => {
    if (imageInput.trim()) {
      const currentImages = form.getValues("images");
      const newImage = {
        src: imageInput.trim(),
        alt: altInput.trim() || "",
        isMain: currentImages.length === 0, // First image is main by default
      };
      form.setValue("images", [...currentImages, newImage]);
      setImageInput("");
      setAltInput("");
    }
  };

  // Handle removing images
  const removeImage = (index: number) => {
    const currentImages = form.getValues("images");
    form.setValue(
      "images",
      currentImages.filter((_, i) => i !== index)
    );
  };

  // Handle setting main image
  const setMainImage = (index: number) => {
    const currentImages = form.getValues("images");
    const updatedImages = currentImages.map((img, i) => ({
      ...img,
      isMain: i === index,
    }));
    form.setValue("images", updatedImages);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HomeIcon className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Beautiful Family Home" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL Slug *</FormLabel>
                    <FormControl>
                      <Input placeholder="beautiful-family-home" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the property, its features, and what makes it special..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <MapPinIcon className="h-4 w-4" />
                    Location *
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="123 Main Street, City, State, ZIP"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Property Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSignIcon className="h-5 w-5" />
              Property Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="propertyType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Type *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {propertyTypes.map((type) => (
                          <SelectItem key={type._id} value={type._id!}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PROPERTY_STATUSES.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CURRENCY_OPTIONS.map((currency) => (
                          <SelectItem
                            key={currency.value}
                            value={currency.value}
                          >
                            {currency.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="beds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bedrooms</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="baths"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bathrooms</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="area"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Area (sq ft)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Property Images
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Image URL"
                value={imageInput}
                onChange={(e) => setImageInput(e.target.value)}
                className="flex-1"
              />
              <Input
                placeholder="Alt text (optional)"
                value={altInput}
                onChange={(e) => setAltInput(e.target.value)}
                className="w-40"
              />
              <Button
                type="button"
                onClick={addImage}
                disabled={!imageInput.trim()}
              >
                <PlusIcon className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {form.watch("images").map((image, index) => (
                <div key={index} className="relative border rounded-lg p-2">
                  <img
                    src={image.src}
                    alt={image.alt || `Property image ${index + 1}`}
                    className="w-full h-32 object-cover rounded"
                    onError={(e) => {
                      e.currentTarget.src = "/images/placeholder.jpg";
                    }}
                  />
                  <div className="absolute top-1 right-1 flex gap-1">
                    {image.isMain && (
                      <Badge variant="secondary" className="text-xs">
                        Main
                      </Badge>
                    )}
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => removeImage(index)}
                    >
                      <XIcon className="h-3 w-3" />
                    </Button>
                  </div>
                  {!image.isMain && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full mt-2 text-xs"
                      onClick={() => setMainImage(index)}
                    >
                      Set as Main
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Amenities & Features */}
        <Card>
          <CardHeader>
            <CardTitle>Amenities & Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Amenities */}
            <div>
              <Label className="text-sm font-medium">Amenities</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="Add amenity (e.g., Swimming Pool)"
                  value={amenityInput}
                  onChange={(e) => setAmenityInput(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addAmenity())
                  }
                />
                <Button
                  type="button"
                  onClick={addAmenity}
                  disabled={!amenityInput.trim()}
                >
                  <PlusIcon className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {form.watch("amenities").map((amenity, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {amenity}
                    <XIcon
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeAmenity(index)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            {/* Features */}
            <div>
              <Label className="text-sm font-medium">Features</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="Add feature (e.g., Hardwood Floors)"
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addFeature())
                  }
                />
                <Button
                  type="button"
                  onClick={addFeature}
                  disabled={!featureInput.trim()}
                >
                  <PlusIcon className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {form.watch("features").map((feature, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="flex items-center gap-1"
                  >
                    {feature}
                    <XIcon
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeFeature(index)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <FormField
                control={form.control}
                name="isFeatured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Featured Property</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        This property will be highlighted on your website
                      </p>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex items-center space-x-2">
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Active Property</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Inactive properties won't be shown on your website
                      </p>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end gap-4 pt-6 border-t">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                {property ? "Updating..." : "Creating..."}
              </>
            ) : property ? (
              "Update Property"
            ) : (
              "Create Property"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
