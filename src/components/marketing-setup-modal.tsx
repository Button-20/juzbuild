"use client";

import Icons from "@/components/global/icons";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useCallback, useState } from "react";
import { toast } from "sonner";

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

interface MarketingSetupModalProps {
  trigger?: React.ReactNode;
  onComplete?: () => void;
}

export function MarketingSetupModal({
  trigger,
  onComplete,
}: MarketingSetupModalProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if user has access to marketing tools
  const planHierarchy = ["starter", "pro", "agency"];
  const currentPlanIndex = planHierarchy.indexOf(
    user?.selectedPlan || "starter"
  );
  const hasMarketingAccess = currentPlanIndex >= 1; // Pro and above

  const handlePlatformToggle = useCallback((platformId: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platformId)
        ? prev.filter((p) => p !== platformId)
        : [...prev, platformId]
    );
  }, []);

  const handleSave = async () => {
    if (!hasMarketingAccess) {
      toast.error(
        "Marketing automation tools are only available on Pro and Agency plans"
      );
      return;
    }

    setIsSubmitting(true);
    try {
      // Save the selected platforms to the user's account
      const response = await fetch("/api/user/marketing-platforms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          platforms: selectedPlatforms,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save marketing platforms");
      }

      toast.success("Marketing platforms saved successfully!");
      setOpen(false);
      setSelectedPlatforms([]);

      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error("Error saving marketing platforms:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to save marketing platforms"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!hasMarketingAccess) {
    return null; // Don't show modal if user doesn't have access
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="w-full sm:w-auto">
            🎯 Set Up Marketing Tools
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Connect Advertising Platforms</DialogTitle>
          <DialogDescription>
            Choose which advertising platforms you'd like to connect and manage
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-4">
            <Label className="text-base font-semibold">
              Available Platforms
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ADS_PLATFORMS.map((platform) => {
                const isSelected = selectedPlatforms.includes(platform.id);

                return (
                  <div
                    key={platform.id}
                    className={`relative flex items-start space-x-3 p-4 border-2 rounded-lg transition-all cursor-pointer ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => handlePlatformToggle(platform.id)}
                  >
                    <Checkbox
                      id={platform.id}
                      checked={isSelected}
                      onCheckedChange={() => handlePlatformToggle(platform.id)}
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
          </div>

          <div className="bg-muted/30 p-4 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> You can update these settings anytime from
              your dashboard. Our team will guide you through the setup process
              for each platform.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
