"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { WizardStepProps } from "@/types/onboarding";
import { ArrowLeft, Mail, Megaphone, MessageCircle, Phone } from "lucide-react";

// Platform logo components using SVG icons
const FacebookIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="#ffffff" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const GoogleIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path
      fill="#ffffff"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#ffffff"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#ffffff"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#ffffff"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

const InstagramIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="#ffffff" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const LinkedInIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="#ffffff" viewBox="0 0 24 24">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const YouTubeIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="#ffffff" viewBox="0 0 24 24">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const TikTokIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="#ffffff" viewBox="0 0 24 24">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
  </svg>
);

const PlatformIcon = ({
  platform,
}: {
  platform: (typeof ADS_PLATFORMS)[0];
}) => {
  switch (platform.id) {
    case "facebook":
      return <FacebookIcon />;
    case "google":
      return <GoogleIcon />;
    case "instagram":
      return <InstagramIcon />;
    case "linkedin":
      return <LinkedInIcon />;
    case "youtube":
      return <YouTubeIcon />;
    case "tiktok":
      return <TikTokIcon />;
    default:
      return <div className="w-6 h-6 bg-gray-300 rounded"></div>;
  }
};

const ADS_PLATFORMS = [
  {
    id: "facebook",
    name: "Facebook Ads",
    description: "Reach potential clients on Facebook with targeted ads",
    iconClass: "bi-facebook",
    color: "#1877F2",
  },
  {
    id: "google",
    name: "Google Ads",
    description: "Show up when people search for properties",
    iconClass: "bi-google",
    color: "#4285F4",
  },
  {
    id: "instagram",
    name: "Instagram Ads",
    description: "Visual property marketing on Instagram",
    iconClass: "bi-instagram",
    color: "#E4405F",
  },
  {
    id: "linkedin",
    name: "LinkedIn Ads",
    description: "Target professionals and business owners",
    iconClass: "bi-linkedin",
    color: "#0A66C2",
  },
  {
    id: "youtube",
    name: "YouTube Ads",
    description: "Video property tours and marketing",
    iconClass: "bi-youtube",
    color: "#FF0000",
  },
  {
    id: "tiktok",
    name: "TikTok Ads",
    description: "Reach younger audience with creative content",
    iconClass: "bi-tiktok",
    color: "#000000",
  },
];

const CONTACT_METHODS = [
  {
    value: "Phone",
    name: "Phone Call",
    description: "Direct phone calls for immediate connection",
    icon: Phone,
    color: "text-green-500",
  },
  {
    value: "Email",
    name: "Email",
    description: "Email communication for detailed inquiries",
    icon: Mail,
    color: "text-blue-500",
  },
  {
    value: "WhatsApp",
    name: "WhatsApp",
    description: "Instant messaging for quick responses",
    icon: MessageCircle,
    color: "text-emerald-500",
  },
];

export default function MarketingStep({
  data,
  updateData,
  errors,
  onNext,
  onBack,
}: WizardStepProps) {
  const handleAdsToggle = (platformId: string) => {
    const currentConnections = data.adsConnections || [];
    if (currentConnections.includes(platformId)) {
      updateData({
        adsConnections: currentConnections.filter((c) => c !== platformId),
      });
    } else {
      updateData({
        adsConnections: [...currentConnections, platformId],
      });
    }
  };

  const handleContactMethodToggle = (methodValue: string) => {
    const currentMethods = data.preferredContactMethod || [];
    if (currentMethods.includes(methodValue as any)) {
      updateData({
        preferredContactMethod: currentMethods.filter((m) => m !== methodValue),
      });
    } else {
      updateData({
        preferredContactMethod: [...currentMethods, methodValue as any],
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Ads Connections */}
      <div className="space-y-6">
        <div className="border-l-4 border-primary pl-4">
          <h3 className="text-lg font-semibold mb-1">Advertising Platforms</h3>
          <p className="text-sm text-muted-foreground">
            Select the advertising platforms you want to use for marketing
          </p>
        </div>

        <div className="space-y-4">
          <Label className="flex items-center gap-2">
            <Megaphone className="w-4 h-4" />
            Ads Connections *
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ADS_PLATFORMS.map((platform) => {
              const isSelected = data.adsConnections?.includes(platform.id);
              return (
                <div
                  key={platform.id}
                  className={`flex items-start space-x-3 p-4 border-2 rounded-lg transition-all cursor-pointer hover:border-primary/50 ${
                    isSelected ? "border-primary bg-primary/5" : "border-border"
                  }`}
                  onClick={() => handleAdsToggle(platform.id)}
                >
                  <Checkbox
                    id={platform.id}
                    checked={isSelected}
                    onCheckedChange={() => handleAdsToggle(platform.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center justify-center w-8 h-8">
                        <PlatformIcon platform={platform} />
                      </div>
                      <Label
                        htmlFor={platform.id}
                        className="font-medium cursor-pointer"
                      >
                        {platform.name}
                      </Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {platform.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          {errors.adsConnections && (
            <p className="text-destructive text-sm">{errors.adsConnections}</p>
          )}
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> We'll help you set up these advertising
              platforms later. For now, just select which ones you're interested
              in using.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Preference */}
      <div className="space-y-6">
        <div className="border-l-4 border-primary pl-4">
          <h3 className="text-lg font-semibold mb-1">
            Lead Contact Preference
          </h3>
          <p className="text-sm text-muted-foreground">
            How would you prefer to be contacted by potential clients?
          </p>
        </div>

        <div className="space-y-4">
          <Label className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Preferred Contact Methods (Select all that apply) *
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {CONTACT_METHODS.map((method) => {
              const isSelected =
                data.preferredContactMethod?.includes(method.value as any) ||
                false;
              const IconComponent = method.icon;

              return (
                <button
                  key={method.value}
                  type="button"
                  onClick={() => handleContactMethodToggle(method.value)}
                  className={`p-6 border-2 rounded-lg text-left transition-all hover:border-primary/50 ${
                    isSelected ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  <IconComponent className={`w-8 h-8 mb-3 ${method.color}`} />
                  <h4 className="font-semibold mb-1">{method.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {method.description}
                  </p>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground">
            Selected: {data.preferredContactMethod?.length || 0} method
            {data.preferredContactMethod?.length === 1 ? "" : "s"}
          </p>
          {errors.preferredContactMethod && (
            <p className="text-destructive text-sm">
              {errors.preferredContactMethod}
            </p>
          )}
        </div>
      </div>

      {/* Marketing Tips */}
      <div className="space-y-6">
        <div className="border-l-4 border-primary pl-4">
          <h3 className="text-lg font-semibold mb-1">
            Marketing Strategy Tips
          </h3>
          <p className="text-sm text-muted-foreground">
            Here's how we'll help you succeed with your marketing
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-muted/30 p-4 rounded-lg border border-border">
            <h4 className="font-semibold text-foreground mb-2">
              🎯 Targeted Advertising
            </h4>
            <p className="text-sm text-muted-foreground">
              We'll help you create targeted ads based on location,
              demographics, and property interests to reach the right buyers.
            </p>
          </div>

          <div className="bg-muted/30 p-4 rounded-lg border border-border">
            <h4 className="font-semibold text-foreground mb-2">
              📊 Performance Tracking
            </h4>
            <p className="text-sm text-muted-foreground">
              Track which platforms generate the most leads and optimize your
              marketing budget for better ROI.
            </p>
          </div>

          <div className="bg-muted/30 p-4 rounded-lg border border-border">
            <h4 className="font-semibold text-foreground mb-2">
              🤝 Lead Management
            </h4>
            <p className="text-sm text-muted-foreground">
              Automatically organize and follow up with leads from all your
              marketing channels in one place.
            </p>
          </div>

          <div className="bg-muted/30 p-4 rounded-lg border border-border">
            <h4 className="font-semibold text-foreground mb-2">
              📱 Multi-Channel Approach
            </h4>
            <p className="text-sm text-muted-foreground">
              Maintain consistent branding across all platforms while adapting
              content for each audience.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t">
        <Button variant="outline" onClick={onBack} size="lg" className="px-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button onClick={onNext} size="lg" className="px-8">
          Continue
        </Button>
      </div>
    </div>
  );
}
