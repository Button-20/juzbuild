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
import { AnimatePresence, motion } from "framer-motion";
import React, { useCallback, useState } from "react";

// Import step components
import BusinessInfoStep from "./steps/business-info-step";
import MarketingSetupStep from "./steps/marketing-setup-step";
import PaymentStep from "./steps/payment-step";
import SignupStep from "./steps/signup-step";
import WebsiteSetupStep from "./steps/website-setup-new-step";

const WIZARD_STEPS: WizardStep[] = [
  {
    id: 1,
    title: "Account Setup",
    description: "Create your account and business name",
    component: SignupStep,
  },
  {
    id: 2,
    title: "Business Profile",
    description: "Tell us about your business and brand",
    component: BusinessInfoStep,
  },
  {
    id: 3,
    title: "Website Setup",
    description: "Configure your website layout and features",
    component: WebsiteSetupStep,
  },
  {
    id: 4,
    title: "Marketing Setup",
    description: "Set up your marketing preferences",
    component: MarketingSetupStep,
  },
  {
    id: 5,
    title: "Choose Plan & Payment",
    description: "Select your plan and complete payment",
    component: PaymentStep,
  },
];

interface OnboardingWizardProps {
  onComplete?: (data: OnboardingData, result?: any) => void;
}

export default function OnboardingWizard({
  onComplete,
}: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<OnboardingData>>({
    brandColors: [],
    propertyTypes: [],
    includedPages: [],
    adsConnections: [],
    leadCapturePreference: [],
    preferredContactMethod: [],
    selectedPlan: "pro", // Default to Pro plan
    billingCycle: "yearly", // Default to yearly billing
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
        case 0: // Account Setup Step
          isValid = !!(
            (
              data.fullName?.trim() &&
              data.email?.trim() &&
              /\S+@\S+\.\S+/.test(data.email) &&
              data.password?.trim() &&
              data.password.length >= 8 &&
              data.companyName?.trim() &&
              data.country?.trim() &&
              data.city?.trim() &&
              !errors.email
            ) // Email should not have validation errors
          );
          break;

        case 1: // Business Profile Step
          isValid = !!(data.tagline?.trim() && data.aboutSection?.trim());
          break;

        case 2: // Website Setup Step
          isValid = !!(
            data.propertyTypes?.length &&
            data.layoutStyle &&
            data.includedPages?.length &&
            data.leadCapturePreference?.length
          );
          break;

        case 3: // Marketing Setup Step
          isValid = !!(
            data.adsConnections?.length && data.preferredContactMethod?.length
          );
          break;

        case 4: // Payment Step
          isValid = !!(data.selectedPlan && data.billingCycle);
          break;
      }

      setIsStepValid(isValid);
    },
    [currentStep, formData, errors.email]
  );

  const validateCurrentStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    switch (currentStep) {
      case 0: // Account Setup Step (now includes business name)
        if (!formData.fullName?.trim())
          newErrors.fullName = "Full name is required";
        if (!formData.email?.trim()) newErrors.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(formData.email))
          newErrors.email = "Email is invalid";
        if (!formData.password?.trim())
          newErrors.password = "Password is required";
        else if (formData.password.length < 8)
          newErrors.password = "Password must be at least 8 characters";
        if (!formData.companyName?.trim())
          newErrors.companyName = "Business name is required";
        if (!formData.country?.trim())
          newErrors.country = "Country is required";
        if (!formData.city?.trim()) newErrors.city = "City is required";
        break;

      case 1: // Business Profile Step (no business name, simplified)
        if (!formData.tagline?.trim())
          newErrors.tagline = "Tagline is required";
        if (!formData.aboutSection?.trim())
          newErrors.aboutSection = "About section is required";
        break;

      case 2: // Website Setup Step
        if (!formData.propertyTypes?.length)
          newErrors.propertyTypes = "Select at least one property type";
        if (!formData.layoutStyle)
          newErrors.layoutStyle = "Layout style is required";
        if (!formData.includedPages?.length)
          newErrors.includedPages = "Select at least one page";
        if (!formData.leadCapturePreference?.length)
          newErrors.leadCapturePreference =
            "Select at least one lead capture method";
        break;

      case 3: // Marketing Setup Step
        if (!formData.adsConnections?.length)
          newErrors.adsConnections = "Select at least one ads connection";
        if (!formData.preferredContactMethod?.length)
          newErrors.preferredContactMethod =
            "Select at least one contact method";
        break;

      case 4: // Payment Step
        if (!formData.selectedPlan)
          newErrors.selectedPlan = "Please select a plan";
        if (!formData.billingCycle)
          newErrors.billingCycle = "Please select a billing cycle";
        // Payment method is optional for free trial
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Email validation with debouncing
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
  React.useEffect(() => {
    if (currentStep === 0 && formData.email) {
      const timer = setTimeout(() => {
        validateEmailAsync(formData.email!);
      }, 500); // 500ms debounce

      return () => clearTimeout(timer);
    }
  }, [currentStep, formData.email, validateEmailAsync]);

  // Validate step when currentStep changes
  React.useEffect(() => {
    validateCurrentStepAndUpdateButton();
  }, [currentStep, validateCurrentStepAndUpdateButton]);

  const handleNext = async () => {
    // Use both validation methods for final check
    if (!validateCurrentStep() || !isStepValid) return;

    if (currentStep === WIZARD_STEPS.length - 1) {
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
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const currentStepData = WIZARD_STEPS[currentStep];
  const StepComponent = currentStepData.component;
  const progressPercentage = ((currentStep + 1) / WIZARD_STEPS.length) * 100;

  const getStepIllustration = (stepIndex: number) => {
    const illustrations = [
      {
        // Step 1 - Signup
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
        // Step 2 - Business Info
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
        // Step 3 - Property Preferences
        emoji: "🏠",
        title: "Property Focus",
        description:
          "Configure what types of properties you work with and your typical price ranges.",
        features: [
          "Property filtering",
          "Price optimization",
          "Market targeting",
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
        // Step 6 - Property Upload
        emoji: "📊",
        title: "Property Import",
        description:
          "Optionally upload your existing properties to get your website populated quickly.",
        features: ["Bulk import", "Easy management", "Quick setup"],
      },
    ];

    return illustrations[stepIndex] || illustrations[0];
  };

  const currentIllustration = getStepIllustration(currentStep);

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
                Step {currentStep + 1} of {WIZARD_STEPS.length}
              </span>
              <span>{Math.round(progressPercentage)}% Complete</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          {/* Step Indicators */}
          <div className="flex justify-center items-center space-x-2 mt-4">
            {WIZARD_STEPS.map((step, index) => (
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
                {index < WIZARD_STEPS.length - 1 && (
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
                        isLast={currentStep === WIZARD_STEPS.length - 1}
                        isSubmitting={isSubmitting}
                        isStepValid={isStepValid}
                        isValidatingEmail={isValidatingEmail}
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
