"use client";

import Icons from "@/components/global/icons";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { WizardStepProps } from "@/types/onboarding";
import { ArrowLeft, Mail, Megaphone, MessageCircle, Phone } from "lucide-react";

// Simplified ads platforms for marketing setup
const ADS_PLATFORMS = [
  {
    id: "facebook",
    name: "Facebook Ads",
    description: "Reach potential clients on Facebook",
    icon: Icons.facebook,
  },
  {
    id: "google",
    name: "Google Ads",
    description: "Show up when people search for properties",
    icon: Icons.google,
  },
  {
    id: "instagram",
    name: "Instagram Ads",
    description: "Visual property marketing on Instagram",
    icon: Icons.instagram,
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
    icon: Icons.whatsapp,
    color: "text-emerald-500",
  },
];

export default function MarketingSetupStep({
  data,
  updateData,
  errors,
  onNext,
  onBack,
  isStepValid,
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
      {/* Connect Ads */}
      <div className="space-y-6">
        <div className="border-l-4 border-primary pl-4">
          <h3 className="text-lg font-semibold mb-1">
            Connect Advertising Platforms
          </h3>
          <p className="text-sm text-muted-foreground">
            Choose which advertising platforms you'd like to connect (optional)
          </p>
        </div>

        <div className="space-y-4">
          <Label className="flex items-center gap-2">
            <Megaphone className="w-4 h-4" />
            Advertising Platforms
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      <div className="w-6 h-6">
                        <platform.icon className="w-6 h-6" />
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
          <div className="bg-muted/30 p-4 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> You can set up these advertising platforms
              later. For now, just select which ones you're interested in using.
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
          <h3 className="text-lg font-semibold mb-1">What's Next?</h3>
          <p className="text-sm text-muted-foreground">
            Here's how we'll help you succeed with your marketing
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-muted/30 p-4 rounded-lg border border-border">
            <h4 className="font-semibold text-foreground mb-2">
              🎯 Lead Generation
            </h4>
            <p className="text-sm text-muted-foreground">
              Set up lead capture forms and integrate with your preferred
              contact methods.
            </p>
          </div>

          <div className="bg-muted/30 p-4 rounded-lg border border-border">
            <h4 className="font-semibold text-foreground mb-2">
              📊 Campaign Setup
            </h4>
            <p className="text-sm text-muted-foreground">
              We'll help you create your first marketing campaigns on your
              selected platforms.
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
        <Button
          onClick={onNext}
          size="lg"
          className="px-8"
          disabled={!isStepValid}
        >
          Continue to Payment
        </Button>
      </div>
    </div>
  );
}
