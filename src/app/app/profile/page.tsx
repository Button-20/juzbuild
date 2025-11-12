"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
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
import { Separator } from "@/components/ui/separator";
import { SidebarInset } from "@/components/ui/sidebar";
import UserAvatar from "@/components/ui/user-avatar";
import { useAuth } from "@/contexts/AuthContext";
import { titlecase } from "@/utils/helpers";
import { ArrowLeft, Save, X } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function ProfilePage() {
  const { user, refreshAuth } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    companyName: "",
    phoneNumber: "",
    tagline: "",
    aboutSection: "",
    country: "",
    city: "",
  });

  // Update formData when user data is available
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        companyName: user.companyName || "",
        phoneNumber: user.phoneNumber || "",
        tagline: user.tagline || "",
        aboutSection: user.aboutSection || "",
        country: user.country || "",
        city: user.city || "",
      });
    }
  }, [user]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);

    try {
      const response = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update profile");
      }

      const data = await response.json();

      // Refresh auth context
      await refreshAuth();

      setSaveMessage({
        type: "success",
        text: "Profile updated successfully!",
      });

      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setSaveMessage(null);
      }, 3000);

      setEditMode(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update profile";
      setSaveMessage({
        type: "error",
        text: errorMessage,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        companyName: user.companyName || "",
        phoneNumber: user.phoneNumber || "",
        tagline: user.tagline || "",
        aboutSection: user.aboutSection || "",
        country: user.country || "",
        city: user.city || "",
      });
    }
    setEditMode(false);
    setSaveMessage(null);
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <ProtectedRoute>
      <SidebarInset>
        <div className="max-w-6xl mx-auto space-y-8 p-6">
          {/* Header with Background */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/5 via-primary/10 to-accent/5 border border-primary/20">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />

            {/* Back Button */}
            <div className="absolute top-6 left-6 z-10">
              <Link href="/app/dashboard">
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-background/80 backdrop-blur-sm hover:bg-background/90 border border-border/50 shadow-lg"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>

            {/* Profile Header Content */}
            <div className="relative text-center px-6 py-16 md:py-20">
              <div className="mb-8 relative">
                <div className="absolute inset-0 rounded-full bg-primary/20 blur-3xl scale-150 opacity-30" />
                <UserAvatar
                  size="xl"
                  showUpload
                  className="mx-auto ring-4 ring-background/50 shadow-2xl relative z-10 backdrop-blur-sm"
                />
              </div>

              <div className="space-y-4 max-w-2xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground via-primary to-foreground/70 bg-clip-text text-transparent">
                  {formData.fullName || user.fullName}
                </h1>
                <p className="text-lg text-muted-foreground/80 font-medium">
                  {user.email}
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                  <div className="inline-flex items-center px-6 py-3 rounded-full bg-primary/15 text-primary text-sm font-semibold border border-primary/30 backdrop-blur-sm shadow-lg">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3 animate-pulse" />
                    {titlecase(user.selectedPlan)} Plan
                  </div>
                  <div className="inline-flex items-center px-6 py-3 rounded-full bg-background/60 text-foreground text-sm font-semibold border border-border/50 backdrop-blur-sm shadow-lg">
                    <div className="w-2 h-2 bg-accent rounded-full mr-3" />
                    {formData.companyName || user.companyName}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Success/Error Message */}
          {saveMessage && (
            <div
              className={`p-4 rounded-lg border ${
                saveMessage.type === "success"
                  ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-950/20 dark:border-green-900 dark:text-green-200"
                  : "bg-red-50 border-red-200 text-red-800 dark:bg-red-950/20 dark:border-red-900 dark:text-red-200"
              }`}
            >
              {saveMessage.text}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Account Information */}
            <Card className="lg:col-span-2 border-0 shadow-xl bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
              <CardHeader className="pb-8 bg-gradient-to-r from-primary/5 to-accent/5 rounded-t-lg border-b border-border/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Save className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold">
                        {editMode ? "Edit" : "Account"} Information
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {editMode
                          ? "Update your personal and business details"
                          : "Your personal and business details"}
                      </CardDescription>
                    </div>
                  </div>
                  {!editMode && (
                    <Button
                      onClick={() => setEditMode(true)}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Basic Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        {editMode ? (
                          <Input
                            id="fullName"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            placeholder="Your full name"
                            className="h-12"
                          />
                        ) : (
                          <div className="p-4 rounded-xl bg-gradient-to-r from-accent/20 to-accent/10 border border-accent/30">
                            <p className="font-semibold text-foreground">
                              {formData.fullName}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="companyName">Company</Label>
                        {editMode ? (
                          <Input
                            id="companyName"
                            name="companyName"
                            value={formData.companyName}
                            onChange={handleInputChange}
                            placeholder="Your company name"
                            className="h-12"
                          />
                        ) : (
                          <div className="p-4 rounded-xl bg-gradient-to-r from-accent/20 to-accent/10 border border-accent/30">
                            <p className="font-semibold text-foreground">
                              {formData.companyName}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        {editMode ? (
                          <Input
                            id="country"
                            name="country"
                            value={formData.country}
                            onChange={handleInputChange}
                            placeholder="Your country"
                            className="h-12"
                          />
                        ) : (
                          <div className="p-4 rounded-xl bg-gradient-to-r from-accent/20 to-accent/10 border border-accent/30">
                            <p className="font-semibold text-foreground">
                              {formData.country || "Not provided"}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        {editMode ? (
                          <Input
                            id="city"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            placeholder="Your city"
                            className="h-12"
                          />
                        ) : (
                          <div className="p-4 rounded-xl bg-gradient-to-r from-accent/20 to-accent/10 border border-accent/30">
                            <p className="font-semibold text-foreground">
                              {formData.city || "Not provided"}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Contact Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Contact Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="phoneNumber">Phone Number</Label>
                        {editMode ? (
                          <Input
                            id="phoneNumber"
                            name="phoneNumber"
                            type="tel"
                            value={formData.phoneNumber}
                            onChange={handleInputChange}
                            placeholder="+1 (555) 000-0000"
                            className="h-12"
                          />
                        ) : (
                          <div className="p-4 rounded-xl bg-gradient-to-r from-accent/20 to-accent/10 border border-accent/30">
                            <p className="font-semibold text-foreground text-sm">
                              {formData.phoneNumber || "Not provided"}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Business Description */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Business Description
                    </h3>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="tagline">Tagline</Label>
                        {editMode ? (
                          <Input
                            id="tagline"
                            name="tagline"
                            value={formData.tagline}
                            onChange={handleInputChange}
                            placeholder="One-line description of your business"
                            className="h-12"
                          />
                        ) : (
                          <div className="p-4 rounded-xl bg-gradient-to-r from-accent/20 to-accent/10 border border-accent/30">
                            <p className="font-semibold text-foreground text-sm">
                              {formData.tagline || "Not provided"}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="aboutSection">About Section</Label>
                        {editMode ? (
                          <textarea
                            id="aboutSection"
                            name="aboutSection"
                            value={formData.aboutSection}
                            onChange={handleInputChange}
                            placeholder="Tell us about your business, experience, and what makes you unique..."
                            className="w-full p-4 rounded-xl border border-input bg-background text-foreground placeholder-muted-foreground min-h-[120px] focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        ) : (
                          <div className="p-4 rounded-xl bg-gradient-to-r from-accent/20 to-accent/10 border border-accent/30">
                            <p className="font-semibold text-foreground text-sm whitespace-pre-wrap">
                              {formData.aboutSection || "Not provided"}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {editMode && (
                    <div className="flex gap-4 pt-4">
                      <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex-1 h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {isSaving ? "Saving..." : "Save Changes"}
                      </Button>
                      <Button
                        onClick={handleCancel}
                        variant="outline"
                        disabled={isSaving}
                        className="flex-1 h-12 border-2 hover:bg-accent/50 shadow-lg"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats & Settings */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <Card className="border-0 shadow-xl bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
                <CardHeader className="pb-6 bg-gradient-to-r from-accent/5 to-primary/5 rounded-t-lg border-b border-border/50">
                  <CardTitle className="text-lg font-bold">
                    Quick Stats
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Your account overview
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Account Status
                      </p>
                      <p className="text-lg font-bold text-green-600">Active</p>
                    </div>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Plan Type
                      </p>
                      <p className="text-lg font-bold text-blue-600">
                        {titlecase(user.selectedPlan)}
                      </p>
                    </div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  </div>
                </CardContent>
              </Card>

              {/* Info Box */}
              <Card className="border-0 shadow-xl bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
                <CardHeader className="pb-6 bg-gradient-to-r from-primary/5 to-accent/5 rounded-t-lg border-b border-border/50">
                  <CardTitle className="text-lg font-bold">
                    Need Help?
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-3 text-sm text-muted-foreground">
                  <p>
                    Click the <strong>Edit Profile</strong> button to update
                    your account information.
                  </p>
                  <p>
                    Your changes are automatically saved to the database when
                    you click <strong>Save Changes</strong>.
                  </p>
                  <p>
                    For security reasons, email changes require contacting
                    support.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </ProtectedRoute>
  );
}
