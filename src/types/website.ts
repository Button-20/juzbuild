export interface Website {
  _id: string;
  userId: string;
  companyName: string;
  domainName: string;
  tagline: string;
  aboutSection: string;
  selectedTheme: string;
  status: "active" | "pending" | "suspended" | "creating" | "failed";
  deploymentStatus: "pending" | "deploying" | "deployed" | "failed";

  // URLs and deployment info
  websiteUrl?: string;
  vercelUrl?: string;
  aliasUrl?: string;

  // Technical details
  githubRepo?: string;
  vercelProjectId?: string;
  databaseUrl?: string;
  dbName?: string;
  jobId?: string;

  // Website content configuration
  includedPages?: string[];
  propertyTypes?: string[];
  preferredContactMethod?: string[];

  // Contact and social information
  phoneNumber?: string;
  supportEmail?: string;
  whatsappNumber?: string;
  address?: string;
  facebookUrl?: string;
  twitterUrl?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
  youtubeUrl?: string;

  // Branding
  brandColors?: string[];
  logoUrl?: string;
  faviconUrl?: string;

  // Analytics and SEO
  analytics: {
    googleAnalytics: {
      measurementId: string | null;
      propertyId: string | null;
      isEnabled: boolean;
    };
  };

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastDeployedAt?: Date;
  completedAt?: Date;

  // Flags
  isActive: boolean;
}

export interface UpdatedUser {
  _id: string;
  fullName: string;
  email: string;
  password: string;
  country: string;
  city: string;
  phoneNumber?: string;
  avatar?: string;
  // Removed website-specific fields - they're now in Website collection
  adsConnections?: string[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  // User preferences
  defaultWebsiteId?: string; // Which website to show by default
  subscription?: {
    plan: "starter" | "pro" | "agency";
    billingCycle: "monthly" | "yearly";
    status: "active" | "past_due" | "canceled";
    currentPeriodEnd: Date;
  };
}

export interface CreateWebsiteParams {
  companyName: string;
  domainName: string;
  tagline: string;
  aboutSection: string;
  selectedTheme: string;
  includedPages?: string[];
  propertyTypes?: string[];
  preferredContactMethod?: string[];
  // New fields from onboarding
  logoUrl?: string;
  faviconUrl?: string;
  brandColors?: string[];
  leadCaptureMethods?: ("AI Chatbot" | "Contact Form" | "Inquiry Form")[];
  geminiApiKey?: string;
  phoneNumber?: string;
  supportEmail?: string;
  whatsappNumber?: string;
  address?: string;
  facebookUrl?: string;
  twitterUrl?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
  youtubeUrl?: string;
}
