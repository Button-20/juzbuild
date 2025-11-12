/**
 * Ads Integration Context
 * Manages selected ads integrations throughout the app
 */

import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export interface AdsIntegration {
  platform: "facebook" | "google" | "instagram";
  enabled: boolean;
  accountId?: string;
  connectedAt?: Date;
}

interface AdsContextType {
  integrations: AdsIntegration[];
  isLoading: boolean;
  isConnected: (platform: "facebook" | "google" | "instagram") => boolean;
  addIntegration: (
    platform: "facebook" | "google" | "instagram",
    accountId: string
  ) => void;
  removeIntegration: (platform: "facebook" | "google" | "instagram") => void;
  refreshIntegrations: () => Promise<void>;
}

const AdsContext = createContext<AdsContextType | undefined>(undefined);

export function AdsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [integrations, setIntegrations] = useState<AdsIntegration[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      refreshIntegrations();
    }
  }, [user?.id]);

  const refreshIntegrations = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/ads/integrations");
      if (response.ok) {
        const data = await response.json();
        setIntegrations(data.integrations || []);
      }
    } catch (error) {
      console.error("Failed to fetch ads integrations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const isConnected = (platform: "facebook" | "google" | "instagram") => {
    return integrations.some((int) => int.platform === platform && int.enabled);
  };

  const addIntegration = (
    platform: "facebook" | "google" | "instagram",
    accountId: string
  ) => {
    setIntegrations((prev) => {
      const filtered = prev.filter((int) => int.platform !== platform);
      return [
        ...filtered,
        {
          platform,
          enabled: true,
          accountId,
          connectedAt: new Date(),
        },
      ];
    });
  };

  const removeIntegration = (platform: "facebook" | "google" | "instagram") => {
    setIntegrations((prev) => prev.filter((int) => int.platform !== platform));
  };

  return (
    <AdsContext.Provider
      value={{
        integrations,
        isLoading,
        isConnected,
        addIntegration,
        removeIntegration,
        refreshIntegrations,
      }}
    >
      {children}
    </AdsContext.Provider>
  );
}

export function useAdsIntegrations() {
  const context = useContext(AdsContext);
  if (context === undefined) {
    throw new Error("useAdsIntegrations must be used within AdsProvider");
  }
  return context;
}
