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
import { useWebsite } from "@/contexts/website-context";
import { Globe, Plus, ExternalLink, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function WebsiteSwitcher() {
  const { websites, currentWebsite, isLoading, switchWebsite } = useWebsite();
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  const handleWebsiteChange = (websiteId: string) => {
    switchWebsite(websiteId);
    toast.success("Website switched successfully");
  };

  const handleCreateNew = () => {
    router.push("/app/create-website");
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
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCreateNew}
          className="text-xs"
          disabled={isCreating}
        >
          <Plus className="h-3 w-3 mr-1" />
          Create
        </Button>
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
                        <Badge
                          variant="outline"
                          className={`text-xs ${getStatusColor(
                            website.status
                          )}`}
                        >
                          {website.status}
                        </Badge>
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

        <Button
          variant="ghost"
          size="icon"
          onClick={handleCreateNew}
          className="flex-shrink-0 h-9 w-9"
          title="Create new website"
          disabled={isCreating}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {currentWebsite && (
        <div className="flex items-center justify-between px-1">
          <div className="text-xs text-muted-foreground">
            {websites.length} website{websites.length !== 1 ? "s" : ""} •{" "}
            {currentWebsite.selectedTheme}
          </div>
          <div className="flex items-center gap-1">
            {currentWebsite.status === "active" && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() =>
                  window.open(`https://${currentWebsite.domainName}`, "_blank")
                }
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                View
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() =>
                router.push(`/app/websites/${currentWebsite._id}/settings`)
              }
            >
              <Settings className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
