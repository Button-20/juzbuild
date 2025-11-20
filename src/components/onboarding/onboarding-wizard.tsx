"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { OnboardingData, WizardStep } from "@/types/onboarding";
import { debounce } from "@/utils/helpers";
import { AnimatePresence, motion } from "framer-motion";
import React, { useCallback, useState } from "react";

// Import step components
import BusinessInfoStep from "./steps/business-info-step";
import MarketingSetupStep from "./steps/marketing-setup-step";
import PaymentStep from "./steps/payment-step";
import ReviewStep from "./steps/review-step";
import SignupStep from "./steps/signup-step";
import WebsiteSetupStep from "./steps/website-setup-new-step";

// Helper function to check if a feature is available for the selected plan
const isFeatureAvailable = (feature: string, selectedPlan: string): boolean => {
  const planHierarchy = ["starter", "pro", "agency"];
  const currentPlanIndex = planHierarchy.indexOf(selectedPlan);

  // AI Chatbot is only available for Pro and Agency plans
  if (feature === "AI Chatbot") {
    return currentPlanIndex >= 1; // Pro (index 1) and above
  }

  // Advanced marketing features for Agency plans
  if (feature === "Advanced Marketing") {
    return currentPlanIndex >= 2; // Agency (index 2) only
  }

  // Default: feature is available for all plans
  return true;
};

const WIZARD_STEPS: WizardStep[] = [
  {
    id: 1,
    title: "Choose Plan",
    description: "Select your subscription plan",
    component: PaymentStep,
  },
  {
    id: 2,
    title: "Account Setup",
    description: "Create your account and business name",
    component: SignupStep,
  },
  {
    id: 3,
    title: "Business Profile",
    description: "Tell us about your business and brand",
    component: BusinessInfoStep,
  },
  {
    id: 4,
    title: "Website Setup",
    description: "Configure your website layout and features",
    component: WebsiteSetupStep,
  },
  {
    id: 5,
    title: "Marketing Setup",
    description: "Set up your marketing preferences",
    component: MarketingSetupStep,
  },
  {
    id: 6,
    title: "Review Details",
    description: "Review your information and proceed to payment",
    component: ReviewStep,
  },
];

interface OnboardingWizardProps {
  onComplete?: (data: OnboardingData, result?: any) => void;
  isExistingUser?: boolean; // Flag to indicate if user is already logged in
}

export default function OnboardingWizard({
  onComplete,
  isExistingUser = false,
}: OnboardingWizardProps) {
  // Filter steps based on user type - skip signup step for existing users
  const activeSteps = isExistingUser
    ? WIZARD_STEPS.filter((step) => step.id !== 2) // Remove signup step (now id 2)
    : WIZARD_STEPS;

  // If existing user, start at first step (Business Profile, formerly step 2)
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<OnboardingData>>({
    brandColors: [],
    propertyTypes: [],
    includedPages: [],
    adsConnections: [],
    leadCaptureMethods: [],
    geminiApiKey: "",
    preferredContactMethod: [],
    selectedPlan: "pro", // Default to Pro plan
    billingCycle: "yearly", // Default to yearly billing
    // Initialize new contact and social fields
    supportEmail: "",
    whatsappNumber: "",
    address: "",
    facebookUrl: "",
    twitterUrl: "",
    instagramUrl: "",
    linkedinUrl: "",
    youtubeUrl: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidatingEmail, setIsValidatingEmail] = useState(false);
  const [isStepValid, setIsStepValid] = useState(false);

  const updateData = useCallback((newData: Partial<OnboardingData>) => {
    setFormData((prev) => {
      const updated = { ...prev, ...newData };
      // Validate step after data update
      setTimeout(() => validateCurrentStepAndUpdateButton(updated), 0);
      return updated;
    });
    // Clear errors for updated fields
    const updatedFields = Object.keys(newData);
    setErrors((prev) => {
      const newErrors = { ...prev };
      updatedFields.forEach((field) => {
        if (newErrors[field]) {
          delete newErrors[field];
        }
      });
      return newErrors;
    });
  }, []);

  // Validate current step without setting errors (for button state)
  const validateCurrentStepAndUpdateButton = useCallback(
    (data = formData) => {
      let isValid = true;

      switch (currentStep) {
        case 0: // Choose Plan & Payment Step - Plan selection required
          isValid = !!(
            data.selectedPlan &&
            data.selectedPlan.trim() &&
            data.billingCycle &&
            data.billingCycle.trim()
          );
          break;

        case 1: // Account Setup Step - All fields are required
          isValid = !!(
            // Personal Information
            (
              data.fullName?.trim() &&
              data.email?.trim() &&
              /\S+@\S+\.\S+/.test(data.email) &&
              data.phoneNumber?.trim() &&
              data.password?.trim() &&
              data.password.length >= 8 &&
              // Business Information
              data.companyName?.trim() &&
              data.domainName?.trim() &&
              /^[a-zA-Z0-9-]+$/.test(data.domainName || "") &&
              data.domainName.length >= 3 &&
              // Location Information
              data.country?.trim() &&
              data.city?.trim() &&
              // No validation errors
              !errors.email &&
              !errors.domainName &&
              !errors.fullName &&
              !errors.phoneNumber &&
              !errors.password &&
              !errors.companyName &&
              !errors.country &&
              !errors.city
            )
          );
          break;

        case 2: // Business Profile Step - Tagline and About section required, contact/social optional
          isValid = !!(
            data.tagline?.trim() &&
            data.tagline.trim().length >= 2 &&
            data.aboutSection?.trim() &&
            data.aboutSection.trim().length >= 10 &&
            !errors.tagline &&
            !errors.aboutSection &&
            // Contact and social media fields are optional, but if provided should be valid
            !errors.supportEmail &&
            !errors.whatsappNumber &&
            !errors.address &&
            !errors.facebookUrl &&
            !errors.twitterUrl &&
            !errors.instagramUrl &&
            !errors.linkedinUrl &&
            !errors.youtubeUrl
          );
          break;

        case 3: // Website Setup Step - All fields are required
          isValid = !!(
            data.propertyTypes?.length &&
            data.propertyTypes.length > 0 &&
            data.selectedTheme &&
            data.selectedTheme.trim() &&
            data.includedPages?.length &&
            data.includedPages.length > 0 &&
            data.leadCaptureMethods?.length &&
            data.leadCaptureMethods.length > 0 &&
            // If AI Chatbot is selected, geminiApiKey is required
            (!data.leadCaptureMethods.includes("AI Chatbot") ||
              data.geminiApiKey?.trim()) &&
            !errors.propertyTypes &&
            !errors.selectedTheme &&
            !errors.includedPages &&
            !errors.leadCaptureMethods &&
            !errors.geminiApiKey
          );
          break;

        case 4: // Marketing Setup Step - Only preferred contact method is required
          isValid = !!(
            // adsConnections is optional (marked as such in UI)
            (
              data.preferredContactMethod?.length &&
              data.preferredContactMethod.length > 0 &&
              !errors.preferredContactMethod
            )
          );
          break;

        case 4: // Payment Step - Plan and billing cycle required, payment info optional for trial
          isValid = !!(
            data.selectedPlan &&
            data.selectedPlan.trim() &&
            data.billingCycle &&
            data.billingCycle.trim() &&
            !errors.selectedPlan &&
            !errors.billingCycle
          );
          // Payment details are optional for free trial, but if provided, must be complete
          if (
            data.paymentMethod &&
            (data.paymentMethod.cardNumber ||
              data.paymentMethod.expiryDate ||
              data.paymentMethod.cvv ||
              data.paymentMethod.cardholderName)
          ) {
            isValid =
              isValid &&
              !!(
                data.paymentMethod.cardNumber?.trim() &&
                data.paymentMethod.expiryDate?.trim() &&
                data.paymentMethod.cvv?.trim() &&
                data.paymentMethod.cardholderName?.trim() &&
                !errors.cardNumber &&
                !errors.expiryDate &&
                !errors.cvv &&
                !errors.cardholderName
              );
          }
          break;
      }

      setIsStepValid(isValid);
    },
    [currentStep, formData, errors.email]
  );

  const validateCurrentStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    switch (currentStep) {
      case 0: // Choose Plan - Plan selection required
        if (!formData.selectedPlan)
          newErrors.selectedPlan = "Please select a plan";
        if (!formData.billingCycle)
          newErrors.billingCycle = "Please select a billing cycle";
        break;

      case 1: // Account Setup Step - All fields are required
        // Personal Information
        if (!formData.fullName?.trim())
          newErrors.fullName = "Full name is required";
        else if (formData.fullName.trim().length < 2)
          newErrors.fullName = "Full name must be at least 2 characters";

        if (!formData.email?.trim()) newErrors.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(formData.email))
          newErrors.email = "Email is invalid";

        if (!formData.phoneNumber?.trim())
          newErrors.phoneNumber = "Phone number is required";
        else if (formData.phoneNumber.trim().length < 10)
          newErrors.phoneNumber = "Phone number must be at least 10 characters";

        if (!formData.password?.trim())
          newErrors.password = "Password is required";
        else if (formData.password.length < 8)
          newErrors.password = "Password must be at least 8 characters";

        // Business Information
        if (!formData.companyName?.trim())
          newErrors.companyName = "Company/Agency name is required";
        else if (formData.companyName.trim().length < 2)
          newErrors.companyName = "Company name must be at least 2 characters";

        if (!formData.domainName?.trim())
          newErrors.domainName = "Website domain name is required";
        else if (!/^[a-zA-Z0-9-]+$/.test(formData.domainName))
          newErrors.domainName =
            "Domain name can only contain letters, numbers, and hyphens";
        else if (formData.domainName.length < 3)
          newErrors.domainName = "Domain name must be at least 3 characters";

        // Location Information
        if (!formData.country?.trim())
          newErrors.country = "Country is required";
        if (!formData.city?.trim()) newErrors.city = "City is required";
        else if (formData.city.trim().length < 2)
          newErrors.city = "City must be at least 2 characters";
        break;

      case 2: // Business Profile Step - Tagline and About section required, contact/social optional but validated
        if (!formData.tagline?.trim())
          newErrors.tagline = "Tagline/Slogan is required";
        else if (formData.tagline.trim().length < 2)
          newErrors.tagline = "Tagline must be at least 2 characters";

        if (!formData.aboutSection?.trim())
          newErrors.aboutSection = "About your business is required";
        else if (formData.aboutSection.trim().length < 10)
          newErrors.aboutSection =
            "About section must be at least 10 characters";

        // Optional field validation - only validate if provided
        if (
          formData.supportEmail?.trim() &&
          !/\S+@\S+\.\S+/.test(formData.supportEmail)
        )
          newErrors.supportEmail = "Please enter a valid email address";

        if (
          formData.whatsappNumber?.trim() &&
          !/^\+[1-9]\d{6,14}$/.test(formData.whatsappNumber.replace(/\s/g, ""))
        )
          newErrors.whatsappNumber =
            "Please enter a valid WhatsApp number with country code (e.g., +1234567890)";

        // Social media URL validation - only if provided
        const urlPattern = /^https?:\/\/.+/;
        if (
          formData.facebookUrl?.trim() &&
          !urlPattern.test(formData.facebookUrl)
        )
          newErrors.facebookUrl =
            "Please enter a valid URL starting with http:// or https://";

        if (
          formData.twitterUrl?.trim() &&
          !urlPattern.test(formData.twitterUrl)
        )
          newErrors.twitterUrl =
            "Please enter a valid URL starting with http:// or https://";

        if (
          formData.instagramUrl?.trim() &&
          !urlPattern.test(formData.instagramUrl)
        )
          newErrors.instagramUrl =
            "Please enter a valid URL starting with http:// or https://";

        if (
          formData.linkedinUrl?.trim() &&
          !urlPattern.test(formData.linkedinUrl)
        )
          newErrors.linkedinUrl =
            "Please enter a valid URL starting with http:// or https://";

        if (
          formData.youtubeUrl?.trim() &&
          !urlPattern.test(formData.youtubeUrl)
        )
          newErrors.youtubeUrl =
            "Please enter a valid URL starting with http:// or https://";
        break;

      case 3: // Website Setup Step - All fields are required
        if (!formData.propertyTypes?.length)
          newErrors.propertyTypes = "Select at least one property type";

        if (!formData.selectedTheme)
          newErrors.selectedTheme = "Please select a theme";

        if (!formData.includedPages?.length)
          newErrors.includedPages = "Select at least one page";

        if (!formData.leadCaptureMethods?.length)
          newErrors.leadCaptureMethods =
            "Select at least one lead capture method";

        // If AI Chatbot is selected, geminiApiKey is required
        if (
          formData.leadCaptureMethods?.includes("AI Chatbot") &&
          !formData.geminiApiKey?.trim()
        )
          newErrors.geminiApiKey =
            "Gemini API key is required when AI Chatbot is selected";
        break;

      case 4: // Marketing Setup Step - Only preferred contact method is required
        // adsConnections is optional (marked as optional in UI)
        if (!formData.preferredContactMethod?.length)
          newErrors.preferredContactMethod =
            "Select at least one preferred contact method";
        break;

      case 5: // Review Details Step - Check terms agreement
        if (!formData.agreeToTerms) {
          newErrors.agreeToTerms =
            "You must agree to the terms and conditions to proceed";
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Email validation function
  const validateEmailAsync = useCallback(async (email: string) => {
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      return;
    }

    setIsValidatingEmail(true);
    try {
      const response = await fetch(
        `/api/check-email?email=${encodeURIComponent(email)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (data.exists) {
        setErrors((prev) => ({
          ...prev,
          email: "An account with this email already exists",
        }));
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev };
          if (newErrors.email === "An account with this email already exists") {
            delete newErrors.email;
          }
          return newErrors;
        });
      }
    } catch (error) {
      console.error("Error validating email:", error);
    } finally {
      setIsValidatingEmail(false);
    }
  }, []);

  // Debounced email validation
  const debouncedValidateEmail = useCallback(
    debounce((email: string) => {
      if (currentStep === 0 && email) {
        validateEmailAsync(email);
      }
    }, 500),
    [currentStep, validateEmailAsync]
  );

  // Trigger debounced email validation when email changes
  React.useEffect(() => {
    if (formData.email) {
      debouncedValidateEmail(formData.email);
    }
  }, [formData.email, debouncedValidateEmail]);

  // Validate step when currentStep or formData changes
  React.useEffect(() => {
    validateCurrentStepAndUpdateButton();
  }, [currentStep, formData, validateCurrentStepAndUpdateButton]);

  // Scroll to top when step changes (additional safeguard)
  React.useEffect(() => {
    scrollToTop();
  }, [currentStep]);

  const scrollToTop = () => {
    // Multiple scroll approaches for better compatibility
    try {
      // Try scrolling the window first
      window.scrollTo({ top: 0, behavior: "smooth" });

      // Also try scrolling document elements as fallback
      document.documentElement.scrollTo({ top: 0, behavior: "smooth" });
      document.body.scrollTo({ top: 0, behavior: "smooth" });

      // Force immediate scroll if smooth scroll doesn't work
      setTimeout(() => {
        if (window.scrollY > 100) {
          window.scrollTo(0, 0);
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
        }
      }, 100);
    } catch (error) {
      // Fallback to immediate scroll
      console.warn("Smooth scroll failed, using immediate scroll:", error);
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  };

  const handleNext = async () => {
    // Use both validation methods for final check
    if (!validateCurrentStep() || !isStepValid) return;

    if (currentStep === activeSteps.length - 1) {
      // Final submission
      setIsSubmitting(true);
      try {
        const response = await fetch("/api/signup-onboarding", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          throw new Error("Failed to submit onboarding data");
        }

        const result = await response.json();
        onComplete?.(formData as OnboardingData, result);
      } catch (error) {
        console.error("Error submitting onboarding:", error);
        setErrors({ submit: "Failed to submit. Please try again." });
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setCurrentStep((prev) => Math.min(prev + 1, WIZARD_STEPS.length - 1));
      // Scroll to top of the page when moving to next step
      scrollToTop();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => Math.max(prev - 1, 0));
      // Scroll to top of the page when going back
      scrollToTop();
    }
  };

  // Safety check - ensure currentStep is within valid bounds
  React.useEffect(() => {
    if (currentStep < 0 || currentStep >= WIZARD_STEPS.length) {
      console.warn(
        `Invalid step index: ${currentStep}. Valid range: 0-${
          WIZARD_STEPS.length - 1
        }. Resetting to step 0.`
      );
      setCurrentStep(0);
    }
  }, [currentStep]);

  const currentStepData = activeSteps[currentStep] || activeSteps[0];
  const StepComponent = currentStepData.component;
  const progressPercentage = ((currentStep + 1) / activeSteps.length) * 100;

  const getStepIllustration = (stepIndex: number) => {
    const illustrations = [
      {
        // Step 1 - Payment
        emoji: "💳",
        title: "Choose Your Plan",
        description:
          "Select the perfect plan for your business needs and start building your success.",
        features: [
          "Flexible pricing",
          "All features included",
          "Cancel anytime",
        ],
      },
      {
        // Step 2 - Signup
        emoji: "👋",
        title: "Welcome!",
        description:
          "Let's create your account and get you started with your real estate website.",
        features: [
          "Secure account setup",
          "Quick registration",
          "Professional profiles",
        ],
      },
      {
        // Step 3 - Business Info
        emoji: "🏢",
        title: "Brand Identity",
        description:
          "Tell us about your business so we can create a website that represents you perfectly.",
        features: [
          "Custom branding",
          "Logo integration",
          "Professional appearance",
        ],
      },
      {
        // Step 4 - Website Setup
        emoji: "✨",
        title: "Website Design",
        description:
          "Choose your layout style and decide which pages to include on your website.",
        features: ["Modern layouts", "Custom pages", "Professional design"],
      },
      {
        // Step 5 - Marketing
        emoji: "📢",
        title: "Marketing Power",
        description:
          "Set up your marketing preferences to attract more leads and grow your business.",
        features: ["Lead generation", "Social media", "Ad management"],
      },
      {
        // Step 6 - Review
        emoji: "📋",
        title: "Review & Payment",
        description:
          "Review your details and complete payment to activate your subscription.",
        features: ["Secure payment", "Order summary", "Easy checkout"],
      },
    ];

    return illustrations[stepIndex] || illustrations[0];
  };

  const currentIllustration = getStepIllustration(currentStep);

  // If existing user, render a simplified layout without full-screen wrapper
  if (isExistingUser) {
    return (
      <div className="w-full">
        {/* Progress Bar */}
        <div className="mb-6 max-w-2xl mx-auto">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>
              Step {currentStep + 1} of {activeSteps.length}
            </span>
            <span>{Math.round(progressPercentage)}% Complete</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Step Indicators */}
        <div className="flex justify-center items-center space-x-2 mb-8">
          {activeSteps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div
                className={`flex items-center justify-center w-6 h-6 md:w-8 md:h-8 rounded-full text-xs font-medium transition-colors ${
                  index < currentStep
                    ? "bg-primary text-primary-foreground"
                    : index === currentStep
                    ? "bg-primary/20 text-primary border-2 border-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {index + 1}
              </div>
              {index < activeSteps.length - 1 && (
                <div
                  className={`w-4 md:w-8 h-0.5 transition-colors ${
                    index < currentStep ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left Side - Form */}
            <div className="order-2 lg:order-1 col-span-2">
              <Card className="border-2 border-border/50 shadow-xl bg-card/50 backdrop-blur-sm">
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-xl md:text-2xl font-bold">
                    {currentStepData.title}
                  </CardTitle>
                  <CardDescription className="text-sm md:text-base">
                    {currentStepData.description}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentStep}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <StepComponent
                        data={formData}
                        updateData={updateData}
                        errors={errors}
                        onNext={handleNext}
                        onBack={handleBack}
                        isFirst={currentStep === 0}
                        isLast={currentStep === activeSteps.length - 1}
                        isSubmitting={isSubmitting}
                        isStepValid={isStepValid}
                        isValidatingEmail={isValidatingEmail}
                        isFeatureAvailable={(feature: string) =>
                          isFeatureAvailable(
                            feature,
                            formData.selectedPlan || "pro"
                          )
                        }
                      />
                    </motion.div>
                  </AnimatePresence>
                </CardContent>
              </Card>
            </div>

            {/* Right Side - Illustration */}
            <div className="order-1 lg:order-2">
              <Card className="sticky top-6 border-2 border-primary/20 shadow-xl bg-gradient-to-br from-primary/5 to-primary/10">
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    <span className="text-6xl">
                      {currentIllustration.emoji}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-center">
                    {currentIllustration.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 text-center">
                    {currentIllustration.description}
                  </p>
                  <ul className="space-y-2">
                    {currentIllustration.features.map((feature, index) => (
                      <li key={index} className="flex items-start text-sm">
                        <span className="text-primary mr-2">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Original full-screen layout for new signups
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/50">
      <div className="container mx-auto px-4 py-6">
        {/* Progress Header */}
        <div className="mb-6 text-center max-w-4xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-2">
            Welcome to Juzbuild
          </h1>
          <p className="text-muted-foreground mb-4">
            Let's get your real estate website set up in just a few steps
          </p>

          {/* Progress Bar */}
          <div className="max-w-2xl mx-auto mb-4">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>
                Step {currentStep + 1} of {activeSteps.length}
              </span>
              <span>{Math.round(progressPercentage)}% Complete</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          {/* Step Indicators */}
          <div className="flex justify-center items-center space-x-2 mt-4">
            {activeSteps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div
                  className={`flex items-center justify-center w-6 h-6 md:w-8 md:h-8 rounded-full text-xs font-medium transition-colors ${
                    index < currentStep
                      ? "bg-primary text-primary-foreground"
                      : index === currentStep
                      ? "bg-primary/20 text-primary border-2 border-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {index + 1}
                </div>
                {index < activeSteps.length - 1 && (
                  <div
                    className={`w-4 md:w-8 h-0.5 transition-colors ${
                      index < currentStep ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Main Content with Split Layout */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left Side - Form */}
            <div className="order-2 lg:order-1 col-span-2">
              <Card className="border-2 border-border/50 shadow-xl bg-card/50 backdrop-blur-sm">
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-xl md:text-2xl font-bold">
                    {currentStepData.title}
                  </CardTitle>
                  <CardDescription className="text-sm md:text-base">
                    {currentStepData.description}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentStep}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <StepComponent
                        data={formData}
                        updateData={updateData}
                        errors={errors}
                        onNext={handleNext}
                        onBack={handleBack}
                        isFirst={currentStep === 0}
                        isLast={currentStep === activeSteps.length - 1}
                        isSubmitting={isSubmitting}
                        isStepValid={isStepValid}
                        isValidatingEmail={isValidatingEmail}
                        isFeatureAvailable={(feature: string) =>
                          isFeatureAvailable(
                            feature,
                            formData.selectedPlan || "pro"
                          )
                        }
                      />
                    </motion.div>
                  </AnimatePresence>

                  {/* Error Display */}
                  {errors.submit && (
                    <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <p className="text-destructive text-sm">
                        {errors.submit}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Side - Illustration */}
            <div className="order-1 lg:order-2 lg:sticky lg:top-16">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="relative bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-2xl p-8 text-center overflow-hidden"
              >
                {/* Large Emoji/Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-6xl md:text-8xl mb-6"
                >
                  {currentIllustration.emoji}
                </motion.div>

                {/* Title */}
                <motion.h3
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                  className="text-xl md:text-2xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent"
                >
                  {currentIllustration.title}
                </motion.h3>

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                  className="text-muted-foreground mb-6 leading-relaxed text-sm md:text-base"
                >
                  {currentIllustration.description}
                </motion.p>

                {/* Features */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                  className="space-y-3"
                >
                  {currentIllustration.features.map((feature, index) => (
                    <motion.div
                      key={feature}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                      className="flex items-center gap-3 text-sm text-muted-foreground"
                    >
                      <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                      {feature}
                    </motion.div>
                  ))}
                </motion.div>

                {/* Decorative Elements */}
                <div className="absolute top-4 right-4 w-20 h-20 bg-primary/5 rounded-full blur-xl"></div>
                <div className="absolute bottom-4 left-4 w-16 h-16 bg-primary/10 rounded-full blur-lg"></div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>
            Need help? Contact our support team at{" "}
            <a
              href="mailto:support@juzbuild.com"
              className="text-primary hover:underline"
            >
              support@juzbuild.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
