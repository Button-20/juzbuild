"use client";

import WaitingList from "@/components/marketing/waiting-list";
import OnboardingWizard from "@/components/onboarding/onboarding-wizard";
import { Card, CardContent } from "@/components/ui/card";
import { isLive } from "@/constants";
import { useAuth } from "@/contexts/AuthContext";
import { OnboardingData } from "@/types/onboarding";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SignupPage() {
  // Redirect to waitlist if app is not live
  if (!isLive) {
    return <WaitingList />;
  }
  const router = useRouter();
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);

  const { refreshAuth, isAuthenticated, isLoading: authLoading } = useAuth();

  // Auto-redirect authenticated users to dashboard (but not during onboarding completion)
  useEffect(() => {
    if (!authLoading && isAuthenticated && !isOnboardingComplete) {
      router.push("/app/dashboard");
    }
  }, [isAuthenticated, authLoading, router, isOnboardingComplete]);

  // Show loading spinner while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/50 py-12 px-4 flex items-center justify-center">
        <Card className="shadow-xl">
          <CardContent className="flex items-center justify-center p-8">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="text-muted-foreground">
                Checking authentication...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Don't render signup form if user is authenticated (redirect is in progress)
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/50 py-12 px-4 flex items-center justify-center">
        <Card className="shadow-xl">
          <CardContent className="flex items-center justify-center p-8">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="text-muted-foreground">
                Redirecting to dashboard...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleOnboardingComplete = async (
    data: OnboardingData,
    result?: any
  ) => {
    // Set flag to prevent auto-redirect to dashboard
    setIsOnboardingComplete(true);

    // Handle successful onboarding completion
    console.log("Onboarding completed:", data, result);

    // Refresh auth state to pick up the new user session
    await refreshAuth();

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
  };

  return (
    <div>
      <OnboardingWizard onComplete={handleOnboardingComplete} />
    </div>
  );
}
