"use client";

import OnboardingWizard from "@/components/onboarding/onboarding-wizard";
import { OnboardingData } from "@/types/onboarding";
import { useRouter } from "next/navigation";

export default function SignupPage() {
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
