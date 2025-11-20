"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useWebsite } from "@/contexts/website-context";
import { useAuth } from "@/contexts/AuthContext";
import { PRICING_PLANS, getPlanById } from "@/constants/pricing";
import { Globe, Plus, ExternalLink, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface WebsiteTheme {
  id: string;
  name: string;
  description: string;
  category: string;
}

export function WebsiteSwitcher() {
  const { websites, currentWebsite, isLoading, switchWebsite } = useWebsite();
  const { user } = useAuth();
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [themes, setThemes] = useState<WebsiteTheme[]>([]);
  const [themesLoading, setThemesLoading] = useState(true);

  // Check if user can create more websites
  const userPlan = getPlanById(user?.selectedPlan || "starter");
  const websiteLimit = userPlan?.websiteLimit || 1;
  const canCreateWebsite = websites.length < websiteLimit;
  const isStarterPlan = user?.selectedPlan === "starter";

  // Fetch themes on component mount
  useEffect(() => {
    const fetchThemes = async () => {
      try {
        const response = await fetch("/api/themes");
        if (response.ok) {
          const result = await response.json();
          setThemes(result.themes || []);
        } else {
          console.error("Failed to fetch themes");
        }
      } catch (error) {
        console.error("Error fetching themes:", error);
      } finally {
        setThemesLoading(false);
      }
    };

    fetchThemes();
  }, []);

  const getThemeName = (themeId: string) => {
    const theme = themes.find((t) => t.id === themeId);
    return theme ? theme.name : themeId;
  };

  const handleWebsiteChange = (websiteId: string) => {
    switchWebsite(websiteId);
    toast.success("Website switched successfully");
  };

  const handleCreateNew = () => {
    if (!canCreateWebsite) {
      toast.error(
        `You've reached your plan limit of ${websiteLimit} website${
          websiteLimit !== 1 ? "s" : ""
        }. Please upgrade your plan to create more websites.`
      );
      return;
    }
    router.push("/app/onboarding");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "creating":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "failed":
        return "bg-red-100 text-red-800 border-red-200";
      case "suspended":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-2">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span className="text-sm text-muted-foreground">
          Loading websites...
        </span>
      </div>
    );
  }

  if (websites.length === 0) {
    return (
      <div className="flex items-center justify-between gap-2 p-2">
        <span className="text-sm text-muted-foreground">No websites</span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCreateNew}
                className="text-xs"
                disabled={isCreating || !canCreateWebsite}
              >
                <Plus className="h-3 w-3 mr-1" />
                Create
              </Button>
            </TooltipTrigger>
            {!canCreateWebsite && (
              <TooltipContent>
                <p>
                  You've reached your plan limit. Upgrade to create more
                  websites.
                </p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 px-2 pb-2">
      <div className="flex items-center gap-2">
        <div className="flex-1 min-w-0">
          <Select
            value={currentWebsite?._id || ""}
            onValueChange={handleWebsiteChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">
                    {currentWebsite?.companyName || "Select Website"}
                  </span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {websites.map((website) => (
                <SelectItem key={website._id} value={website._id}>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex flex-col items-start">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {website.companyName}
                        </span>
                        {currentWebsite?._id === website._id && (
                          <Badge
                            variant="default"
                            className="text-xs bg-primary text-primary-foreground"
                          >
                            Current
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {website.domainName}
                      </span>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCreateNew}
                className="flex-shrink-0 h-9 w-9"
                disabled={isCreating || !canCreateWebsite}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {canCreateWebsite
                ? "Create new website"
                : `You've reached your plan limit (${websiteLimit}). Upgrade to create more websites.`}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {currentWebsite && (
        <div className="flex items-center justify-between px-1">
          <div className="text-xs text-muted-foreground truncate flex-1 min-w-0 mr-2">
            {websites.length}/{websiteLimit} website
            {websites.length !== 1 ? "s" : ""} •{" "}
            <span className="truncate">
              {themesLoading
                ? currentWebsite.selectedTheme
                : getThemeName(currentWebsite.selectedTheme)}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {currentWebsite.status === "active" &&
              currentWebsite.websiteUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() =>
                    window.open(currentWebsite.websiteUrl, "_blank")
                  }
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  View
                </Button>
              )}
          </div>
        </div>
      )}
    </div>
  );
}
