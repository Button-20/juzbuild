export interface WebsiteTheme {
  id: string;
  name: string;
  description: string;
  previewImage: string;
  thumbnailImage: string;
  category: "modern" | "classic" | "minimal" | "luxury" | "corporate";
  features: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface OnboardingData {
  // Step 1 - Account Setup
  fullName: string;
  email: string;
  password: string;
  companyName: string;
  domainName: string;
  country: string;
  city: string;

  // Step 2 - Business Profile
  logo?: File;
  brandColors: string[];
  tagline: string;
  aboutSection: string;

  // Step 3 - Website Setup
  propertyTypes: string[];
  layoutStyle: "Classic" | "Modern" | "Minimal";
  selectedTheme: string; // Theme ID selected by user
  includedPages: string[];
  leadCapturePreference: ("Contact Form" | "WhatsApp" | "Email Only")[];

  // Step 4 - Marketing Setup
  adsConnections: string[];
  preferredContactMethod: ("Phone" | "Email" | "WhatsApp")[];

  // Step 5 - Payment & Launch
  selectedPlan: "starter" | "pro" | "agency";
  billingCycle: "monthly" | "yearly";
  agreeToTerms: boolean;
  paymentMethod?: {
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    cardholderName: string;
  };
}

export interface WizardStep {
  id: number;
  title: string;
  description: string;
  component: React.ComponentType<WizardStepProps>;
}

export interface WizardStepProps {
  data: Partial<OnboardingData>;
  updateData: (data: Partial<OnboardingData>) => void;
  errors: Record<string, string>;
  onNext: () => void;
  onBack: () => void;
  isFirst: boolean;
  isLast: boolean;
  isSubmitting?: boolean;
  isStepValid?: boolean;
  isValidatingEmail?: boolean;
}
