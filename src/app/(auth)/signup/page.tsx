"use client";

import WaitingList from "@/components/marketing/waiting-list";
import OnboardingWizard from "@/components/onboarding/onboarding-wizard";
import { isLive } from "@/constants";
import { useAuth } from "@/contexts/AuthContext";
import { OnboardingData } from "@/types/onboarding";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  // Redirect to waitlist if app is not live
  if (!isLive) {
    return <WaitingList />;
  }
  const router = useRouter();

  const { refreshAuth } = useAuth();

  const handleOnboardingComplete = async (
    data: OnboardingData,
    result?: any
  ) => {
    // Handle successful onboarding completion
    console.log("Onboarding completed:", data, result);

    // Refresh auth state to pick up the new user session
    await refreshAuth();

    // Redirect to dashboard since user is now logged in
    router.push("/app/dashboard");
  };

  return (
    <div>
      <OnboardingWizard onComplete={handleOnboardingComplete} />
    </div>
  );
}
