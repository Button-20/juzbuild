"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Website } from "@/types/website";

interface WebsiteContextType {
  websites: Website[];
  currentWebsite: Website | null;
  isLoading: boolean;
  switchWebsite: (websiteId: string) => void;
  refreshWebsites: () => Promise<void>;
  createWebsite: (params: any) => Promise<Website | null>;
  updateWebsite: (
    websiteId: string,
    updates: Partial<Website>
  ) => Promise<void>;
  deleteWebsite: (websiteId: string) => Promise<void>;

  // Backward compatibility (deprecated - use currentWebsite instead)
  selectedWebsite: Website | null;
  selectedWebsiteId: string | null;
  loading: boolean;
}

const WebsiteContext = createContext<WebsiteContextType | undefined>(undefined);

interface WebsiteProviderProps {
  children: React.ReactNode;
}

export function WebsiteProvider({ children }: WebsiteProviderProps) {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [currentWebsite, setCurrentWebsite] = useState<Website | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWebsites = async () => {
    try {
      const response = await fetch("/api/websites", {
        credentials: "include", // Use HTTP-only cookies for authentication
      });

      if (response.ok) {
        const data = await response.json();
        setWebsites(data.websites || []);

        // Set current website from localStorage or first website
        const savedWebsiteId = localStorage.getItem("currentWebsiteId");
        let current = null;

        if (savedWebsiteId) {
          current = data.websites.find(
            (w: Website) => w._id === savedWebsiteId
          );
        }

        if (!current && data.websites.length > 0) {
          current = data.websites[0];
          localStorage.setItem("currentWebsiteId", current._id);
        }

        setCurrentWebsite(current);
      }
    } catch (error) {
      console.error("Failed to fetch websites:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const switchWebsite = (websiteId: string) => {
    const website = websites.find((w) => w._id === websiteId);
    if (website) {
      setCurrentWebsite(website);
      localStorage.setItem("currentWebsiteId", websiteId);
    }
  };

  const createWebsite = async (params: any): Promise<Website | null> => {
    try {
      console.log("📤 Creating website with params:", {
        companyName: params.companyName,
        faviconUrl: params.faviconUrl || "MISSING",
        logoUrl: params.logoUrl || "MISSING",
      });
      console.log("📋 Full params object:", JSON.stringify(params, null, 2).substring(0, 800));
      
      const response = await fetch("/api/websites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include HTTP-only cookies
        body: JSON.stringify(params),
      });

      if (response.ok) {
        const data = await response.json();
        const newWebsite = data.website;

        setWebsites((prev) => [newWebsite, ...prev]);

        // If this is the first website, make it current
        if (websites.length === 0) {
          setCurrentWebsite(newWebsite);
          localStorage.setItem("currentWebsiteId", newWebsite._id);
        }

        return newWebsite;
      } else {
        const error = await response.json();
        throw new Error(error.message);
      }
    } catch (error) {
      console.error("Failed to create website:", error);
      throw error;
    }
  };

  const updateWebsite = async (
    websiteId: string,
    updates: Partial<Website>
  ) => {
    try {
      const response = await fetch(`/api/websites/${websiteId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Use HTTP-only cookies
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const data = await response.json();
        const updatedWebsite = data.website;

        setWebsites((prev) =>
          prev.map((w) => (w._id === websiteId ? updatedWebsite : w))
        );

        if (currentWebsite?._id === websiteId) {
          setCurrentWebsite(updatedWebsite);
        }
      }
    } catch (error) {
      console.error("Failed to update website:", error);
      throw error;
    }
  };

  const deleteWebsite = async (websiteId: string) => {
    try {
      const response = await fetch(`/api/websites?id=${websiteId}`, {
        method: "DELETE",
        credentials: "include", // Use HTTP-only cookies
      });

      if (response.ok) {
        setWebsites((prev) => prev.filter((w) => w._id !== websiteId));

        // If deleted website was current, switch to another one
        if (currentWebsite?._id === websiteId) {
          const remainingWebsites = websites.filter((w) => w._id !== websiteId);
          const newCurrent = remainingWebsites[0] || null;
          setCurrentWebsite(newCurrent);

          if (newCurrent) {
            localStorage.setItem("currentWebsiteId", newCurrent._id);
          } else {
            localStorage.removeItem("currentWebsiteId");
          }
        }
      }
    } catch (error) {
      console.error("Failed to delete website:", error);
      throw error;
    }
  };

  useEffect(() => {
    fetchWebsites();
  }, []);

  return (
    <WebsiteContext.Provider
      value={{
        websites,
        currentWebsite,
        isLoading,
        switchWebsite,
        refreshWebsites: fetchWebsites,
        createWebsite,
        updateWebsite,
        deleteWebsite,

        // Backward compatibility (deprecated)
        selectedWebsite: currentWebsite,
        selectedWebsiteId: currentWebsite?._id || null,
        loading: isLoading,
      }}
    >
      {children}
    </WebsiteContext.Provider>
  );
}

export function useWebsite() {
  const context = useContext(WebsiteContext);
  if (context === undefined) {
    throw new Error("useWebsite must be used within a WebsiteProvider");
  }
  return context;
}
