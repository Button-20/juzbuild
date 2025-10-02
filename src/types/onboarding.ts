export interface OnboardingData {
  // Step 1 - Signup
  fullName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  role: "Agent" | "Agency" | "Developer Partner";
  companyName: string;
  country: string;
  city: string;

  // Step 2 - Business Info
  businessName: string;
  logo?: File;
  brandColors: string[];
  tagline: string;
  aboutSection: string;

  // Step 3 - Property Preferences
  propertyTypes: string[];
  minPrice: number;
  maxPrice: number;
  locationCoverage: string[];
  currency: string;

  // Step 4 - Website Setup
  layoutStyle: "Classic" | "Modern" | "Minimal";
  includedPages: string[];
  leadCapturePreference: ("Contact Form" | "WhatsApp" | "Email Only")[];

  // Step 5 - Marketing & Ads
  adsConnections: string[];
  preferredContactMethod: ("Phone" | "Email" | "WhatsApp")[];

  // Step 6 - Property Upload (Optional)
  propertyFile?: File;
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
}
