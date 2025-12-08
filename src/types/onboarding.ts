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

// User profile data that gets stored in the users collection
export interface UserProfileData {
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
  companyName: string;
  domainName: string;
  country: string;
  city: string;
  tagline: string;
  aboutSection: string;
  selectedTheme: string; // Theme ID selected by user
  selectedPlan: "starter" | "pro" | "agency";
  billingCycle: "monthly" | "yearly";

  // Contact Information (for next.config.ts)
  supportEmail?: string;
  whatsappNumber?: string;
  address?: string;

  // Social Media Links (for next.config.ts)
  facebookUrl?: string;
  twitterUrl?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
  youtubeUrl?: string;
}

// Onboarding-specific data that is stored separately in onboarding collection
export interface OnboardingSpecificData {
  // Business branding (used for website creation)
  logoUrl?: string; // Cloudinary URL for uploaded light mode logo
  darkModeLogoUrl?: string; // Cloudinary URL for uploaded dark mode logo
  faviconUrl?: string; // Browser tab icon
  brandColors: string[]; // Array of 4 colors from selected palette [primary, skyblue, lightskyblue, dark]

  // Website setup preferences (used for website generation)
  propertyTypes: string[];
  includedPages: string[];
  leadCaptureMethods: ("AI Chatbot" | "Contact Form" | "Inquiry Form")[];
  geminiApiKey?: string; // Required if AI Chatbot is selected

  // Marketing setup (used for integrations)
  adsConnections: ("facebook" | "google" | "instagram")[];
  preferredContactMethod: ("Phone" | "Email" | "WhatsApp")[];

  // Ads integrations (optional, only if user selected during onboarding)
  facebookAdsEnabled?: boolean;
  facebookAdsAccountId?: string;
  googleAdsEnabled?: boolean;
  googleAdsAccountId?: string;
  instagramAdsEnabled?: boolean;
  instagramAdsAccountId?: string;

  // Payment and legal (onboarding workflow only)
  agreeToTerms: boolean;
  paymentMethod?: {
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    cardholderName: string;
  };
}

// Complete onboarding data (combines user profile + onboarding-specific data)
export interface OnboardingData
  extends UserProfileData,
    OnboardingSpecificData {}

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
  emailAvailable?: boolean | null;
  isFeatureAvailable?: (feature: string) => boolean;
}
