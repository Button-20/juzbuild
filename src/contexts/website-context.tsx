"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface Website {
  id: string;
  websiteName: string;
  companyName: string;
  domain: string;
  status: string;
  theme: string;
}

interface WebsiteContextType {
  selectedWebsiteId: string | null;
  selectedWebsite: Website | null;
  websites: Website[];
  setSelectedWebsiteId: (id: string) => void;
  loading: boolean;
  refetchWebsites: () => Promise<void>;
}

const WebsiteContext = createContext<WebsiteContextType | null>(null);

export function WebsiteProvider({ children }: { children: React.ReactNode }) {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [selectedWebsiteId, setSelectedWebsiteId] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  const fetchWebsites = async () => {
    try {
      console.log("Fetching websites from /api/sites...");
      const response = await fetch("/api/sites");
      console.log("Response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Sites data received:", data);

        if (data.success) {
          console.log(`Found ${data.sites.length} websites`);
          setWebsites(data.sites);

          // Auto-select the first website if none is selected and we have websites
          if (data.sites.length > 0 && !selectedWebsiteId) {
            const savedWebsiteId = localStorage.getItem("selectedWebsite");
            const websiteToSelect = savedWebsiteId
              ? data.sites.find((site: Website) => site.id === savedWebsiteId)
                  ?.id || data.sites[0].id
              : data.sites[0].id;
            console.log("Auto-selecting website:", websiteToSelect);
            setSelectedWebsiteId(websiteToSelect);
          }
        } else {
          console.warn("API returned success: false");
        }
      } else {
        console.error("Failed to fetch websites, status:", response.status);
        const errorText = await response.text();
        console.error("Error response:", errorText);
      }
    } catch (error) {
      console.error("Failed to fetch websites:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWebsites();
  }, []);

  useEffect(() => {
    if (selectedWebsiteId) {
      localStorage.setItem("selectedWebsite", selectedWebsiteId);
    }
  }, [selectedWebsiteId]);

  const selectedWebsite =
    websites.find((w) => w.id === selectedWebsiteId) || null;

  const handleSetSelectedWebsiteId = (id: string) => {
    setSelectedWebsiteId(id);
  };

  return (
    <WebsiteContext.Provider
      value={{
        selectedWebsiteId,
        selectedWebsite,
        websites,
        setSelectedWebsiteId: handleSetSelectedWebsiteId,
        loading,
        refetchWebsites: fetchWebsites,
      }}
    >
      {children}
    </WebsiteContext.Provider>
  );
}

export function useWebsite() {
  const context = useContext(WebsiteContext);
  if (!context) {
    throw new Error("useWebsite must be used within a WebsiteProvider");
  }
  return context;
}
