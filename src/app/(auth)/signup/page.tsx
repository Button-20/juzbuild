"use client";

import WaitingList from "@/components/marketing/waiting-list";
import OnboardingWizard from "@/components/onboarding/onboarding-wizard";
import { isLive } from "@/constants";
import { OnboardingData } from "@/types/onboarding";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  // Redirect to waitlist if app is not live
  if (!isLive) {
    return <WaitingList />;
  }
  const router = useRouter();

  const handleOnboardingComplete = (data: OnboardingData) => {
    // Handle successful onboarding completion
    console.log("Onboarding completed:", data);

    // Redirect to success page
    router.push("/signup/success");
  };

  return (
    <div>
      <OnboardingWizard onComplete={handleOnboardingComplete} />
    </div>
  );
}
