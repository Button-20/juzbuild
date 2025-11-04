"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { SiteHeader } from "@/components/site-header";
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
import { SidebarInset } from "@/components/ui/sidebar";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Value {
  title: string;
  description: string;
  icon: string;
  image?: string;
}

interface Statistic {
  value: string;
  label: string;
  icon: string;
}

interface AboutPageData {
  storyHeading: string;
  storyImage?: string;
  missionText: string;
  visionText: string;
  values: Value[];
  statistics: Statistic[];
  ctaHeading: string;
  ctaDescription: string;
  ctaImage?: string;
}

export default function AboutManagementPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<AboutPageData>({
    storyHeading: "",
    storyImage: "",
    missionText: "",
    visionText: "",
    values: [
      { title: "", description: "", icon: "ph:shield-check", image: "" },
      { title: "", description: "", icon: "ph:trophy", image: "" },
      { title: "", description: "", icon: "ph:lightbulb", image: "" },
      { title: "", description: "", icon: "ph:users-three", image: "" },
    ],
    statistics: [
      { value: "", label: "", icon: "ph:users-three" },
      { value: "", label: "", icon: "ph:house-line" },
      { value: "", label: "", icon: "ph:medal" },
      { value: "", label: "", icon: "ph:star" },
    ],
    ctaHeading: "",
    ctaDescription: "",
    ctaImage: "",
  });

  useEffect(() => {
    fetchAboutPage();
  }, []);

  const fetchAboutPage = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/about");
      const data = await response.json();

      if (data.success && data.aboutPage) {
        setFormData(data.aboutPage);
      }
    } catch (error) {
      console.error("Error fetching about page:", error);
      toast.error("Failed to load about page data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSaving(true);
      const response = await fetch("/api/about", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("About page updated successfully!");
      } else {
        throw new Error(data.error || "Failed to update");
      }
    } catch (error) {
      console.error("Error updating about page:", error);
      toast.error("Failed to update about page");
    } finally {
      setIsSaving(false);
    }
  };

  const updateValue = (index: number, field: keyof Value, value: string) => {
    const newValues = [...formData.values];
    newValues[index] = { ...newValues[index], [field]: value };
    setFormData({ ...formData, values: newValues });
  };

  const updateStatistic = (
    index: number,
    field: keyof Statistic,
    value: string
  ) => {
    const newStats = [...formData.statistics];
    newStats[index] = { ...newStats[index], [field]: value };
    setFormData({ ...formData, statistics: newStats });
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 items-center justify-center p-6">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </SidebarInset>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">About Page</h1>
              <p className="text-muted-foreground">
                Manage the content displayed on your website's About page
              </p>
            </div>
            <Button onClick={handleSubmit} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Story Section */}
            <Card>
              <CardHeader>
                <CardTitle>Story Section</CardTitle>
                <CardDescription>
                  Main content about your company's story
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="storyHeading">Story Heading</Label>
                  <Input
                    id="storyHeading"
                    value={formData.storyHeading}
                    onChange={(e) =>
                      setFormData({ ...formData, storyHeading: e.target.value })
                    }
                    placeholder="Building Dreams, Creating Homes"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storyImage">Story Image URL (Optional)</Label>
                  <Input
                    id="storyImage"
                    value={formData.storyImage || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, storyImage: e.target.value })
                    }
                    placeholder="https://example.com/image.jpg"
                  />
                  {formData.storyImage && (
                    <div className="mt-2 relative w-full h-48 rounded-lg overflow-hidden border">
                      <img
                        src={formData.storyImage}
                        alt="Story preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "";
                          e.currentTarget.alt = "Invalid image URL";
                          e.currentTarget.className =
                            "w-full h-full flex items-center justify-center bg-muted text-muted-foreground text-sm";
                        }}
                      />
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Leave empty to use the default hero banner image
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Mission & Vision */}
            <Card>
              <CardHeader>
                <CardTitle>Mission & Vision</CardTitle>
                <CardDescription>
                  Your company's mission and vision statements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="missionText">Mission Statement</Label>
                  <Textarea
                    id="missionText"
                    value={formData.missionText}
                    onChange={(e) =>
                      setFormData({ ...formData, missionText: e.target.value })
                    }
                    placeholder="To deliver exceptional service and value to our clients..."
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="visionText">Vision Statement</Label>
                  <Textarea
                    id="visionText"
                    value={formData.visionText}
                    onChange={(e) =>
                      setFormData({ ...formData, visionText: e.target.value })
                    }
                    placeholder="To be recognized as the leading real estate provider..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Values */}
            <Card>
              <CardHeader>
                <CardTitle>Company Values</CardTitle>
                <CardDescription>
                  Four core values that define your company (exactly 4 required)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {formData.values.map((value, index) => (
                  <div
                    key={index}
                    className="p-4 border rounded-lg space-y-4 bg-muted/50"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">Value {index + 1}</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Title</Label>
                        <Input
                          value={value.title}
                          onChange={(e) =>
                            updateValue(index, "title", e.target.value)
                          }
                          placeholder="Integrity"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Icon (Phosphor Icon)</Label>
                        <Input
                          value={value.icon}
                          onChange={(e) =>
                            updateValue(index, "icon", e.target.value)
                          }
                          placeholder="ph:shield-check"
                        />
                        <p className="text-xs text-muted-foreground">
                          Format:{" "}
                          <code className="bg-muted px-1 py-0.5 rounded">
                            ph:icon-name
                          </code>
                          <br />
                          Examples: ph:shield-check, ph:trophy, ph:lightbulb,
                          ph:users-three, ph:heart, ph:star
                          <br />
                          Browse all icons at{" "}
                          <a
                            href="https://phosphoricons.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary underline"
                          >
                            phosphoricons.com
                          </a>
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={value.description}
                        onChange={(e) =>
                          updateValue(index, "description", e.target.value)
                        }
                        placeholder="Operating with honesty and transparency..."
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Image URL (Optional)</Label>
                      <Input
                        value={value.image || ""}
                        onChange={(e) =>
                          updateValue(index, "image", e.target.value)
                        }
                        placeholder="https://example.com/value-image.jpg"
                      />
                      {value.image && (
                        <div className="mt-2 relative w-full h-32 rounded-lg overflow-hidden border">
                          <img
                            src={value.image}
                            alt={`${value.title} preview`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "";
                              e.currentTarget.alt = "Invalid image URL";
                              e.currentTarget.className =
                                "w-full h-full flex items-center justify-center bg-muted text-muted-foreground text-sm";
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
                <CardDescription>
                  Four key statistics about your company (exactly 4 required)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {formData.statistics.map((stat, index) => (
                  <div
                    key={index}
                    className="p-4 border rounded-lg space-y-4 bg-muted/50"
                  >
                    <h4 className="font-semibold">Statistic {index + 1}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Value</Label>
                        <Input
                          value={stat.value}
                          onChange={(e) =>
                            updateStatistic(index, "value", e.target.value)
                          }
                          placeholder="1000+"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Label</Label>
                        <Input
                          value={stat.label}
                          onChange={(e) =>
                            updateStatistic(index, "label", e.target.value)
                          }
                          placeholder="Happy Clients"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Icon (Phosphor Icon)</Label>
                        <Input
                          value={stat.icon}
                          onChange={(e) =>
                            updateStatistic(index, "icon", e.target.value)
                          }
                          placeholder="ph:users-three"
                        />
                        <p className="text-xs text-muted-foreground">
                          Format:{" "}
                          <code className="bg-muted px-1 py-0.5 rounded">
                            ph:icon-name
                          </code>
                          <br />
                          Examples: ph:chart-line, ph:house-line, ph:medal,
                          ph:star, ph:trophy
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* CTA Section */}
            <Card>
              <CardHeader>
                <CardTitle>Call-to-Action Section</CardTitle>
                <CardDescription>
                  The final call-to-action at the bottom of the About page
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ctaHeading">CTA Heading</Label>
                  <Input
                    id="ctaHeading"
                    value={formData.ctaHeading}
                    onChange={(e) =>
                      setFormData({ ...formData, ctaHeading: e.target.value })
                    }
                    placeholder="Ready to Work With Us?"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ctaDescription">CTA Description</Label>
                  <Textarea
                    id="ctaDescription"
                    value={formData.ctaDescription}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        ctaDescription: e.target.value,
                      })
                    }
                    placeholder="We're here to help you achieve your goals..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ctaImage">
                    CTA Background Image URL (Optional)
                  </Label>
                  <Input
                    id="ctaImage"
                    value={formData.ctaImage || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, ctaImage: e.target.value })
                    }
                    placeholder="https://example.com/cta-background.jpg"
                  />
                  {formData.ctaImage && (
                    <div className="mt-2 relative w-full h-48 rounded-lg overflow-hidden border">
                      <img
                        src={formData.ctaImage}
                        alt="CTA background preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "";
                          e.currentTarget.alt = "Invalid image URL";
                          e.currentTarget.className =
                            "w-full h-full flex items-center justify-center bg-muted text-muted-foreground text-sm";
                        }}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Save Button at Bottom */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={fetchAboutPage}
                disabled={isSaving}
              >
                Reset
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </SidebarInset>
    </ProtectedRoute>
  );
}
