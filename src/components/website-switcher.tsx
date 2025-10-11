"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useWebsite } from "@/contexts/website-context";
import { Globe, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export function WebsiteSwitcher() {
  const {
    websites,
    selectedWebsiteId,
    selectedWebsite,
    setSelectedWebsiteId,
    loading,
  } = useWebsite();
  const router = useRouter();

  const handleWebsiteChange = (websiteId: string) => {
    setSelectedWebsiteId(websiteId);
    // Optionally refresh the current page to load data for the selected website
    window.location.reload();
  };

  const handleCreateNew = () => {
    router.push("/onboarding");
  };

  if (loading) {
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
        <Select
          value={selectedWebsiteId || ""}
          onValueChange={handleWebsiteChange}
        >
          <SelectTrigger className="flex-1">
            <SelectValue>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span className="truncate">
                  {selectedWebsite?.companyName ||
                    selectedWebsite?.websiteName ||
                    "Select Website"}
                </span>
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {websites.map((website) => (
              <SelectItem key={website.id} value={website.id}>
                <div className="flex flex-col items-start">
                  <span className="font-medium">{website.companyName}</span>
                  <span className="text-xs text-muted-foreground">
                    {website.domain}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleCreateNew}
          className="flex-shrink-0"
          title="Create new website"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {selectedWebsite && (
        <div className="text-xs text-muted-foreground px-1">
          Status: {selectedWebsite.status} • Theme: {selectedWebsite.theme}
        </div>
      )}
    </div>
  );
}
