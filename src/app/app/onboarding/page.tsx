"use client";

import OnboardingWizard from "@/components/onboarding/onboarding-wizard";
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent } from "@/components/ui/card";
import { SidebarInset } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { OnboardingData } from "@/types/onboarding";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AppOnboardingPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Show loading spinner while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/50 py-12 px-4 flex items-center justify-center">
        <Card className="shadow-xl">
          <CardContent className="flex items-center justify-center p-8">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    router.push("/login");
    return null;
  }

  const handleOnboardingComplete = async (
    data: OnboardingData,
    result?: any
  ) => {
    setIsSubmitting(true);

    try {
      // Handle successful website creation
      console.log("New website created:", data, result);

      // Redirect to deployment page with job tracking
      const queryParams = new URLSearchParams();
      if (result?.jobId) queryParams.set("jobId", result.jobId);
      if (result?.websiteData?.domainName || data.domainName) {
        queryParams.set(
          "domainName",
          result?.websiteData?.domainName || data.domainName
        );
      }
      if (result?.websiteData?.companyName || data.companyName) {
        queryParams.set(
          "websiteName",
          result?.websiteData?.companyName || data.companyName
        );
      }

      const deploymentUrl = `/signup/deployment${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;

      console.log("Redirecting to deployment page:", deploymentUrl);
      router.push(deploymentUrl);
    } catch (error) {
      console.error("Error handling onboarding completion:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <SidebarInset>
      <SiteHeader />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            {/* Back to Dashboard Link */}
            <div className="px-4 lg:px-6">
              <Link
                href="/app/dashboard"
                className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </div>

            {/* Page Header */}
            <div className="px-4 lg:px-6 text-center">
              <h1 className="text-3xl font-bold mb-2">Create New Website</h1>
              <p className="text-muted-foreground">
                Set up a new real estate website in just a few steps
              </p>
            </div>

            {/* Onboarding Wizard */}
            <div className="px-4 lg:px-6">
              <OnboardingWizard
                onComplete={handleOnboardingComplete}
                isExistingUser={true}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Submitting Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="shadow-xl">
            <CardContent className="flex items-center justify-center p-8">
              <div className="flex flex-col items-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="text-muted-foreground">
                  Creating your website...
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </SidebarInset>
  );
}
