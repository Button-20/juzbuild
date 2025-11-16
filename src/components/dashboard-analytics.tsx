"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useWebsite } from "@/contexts/website-context";
import {
  CheckCircle,
  Eye,
  FileText,
  Globe,
  MessageSquare,
  Settings,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

interface WebsiteStats {
  pages: number;
  properties: number;
  testimonials: number;
  blog: number;
  contacts: number;
  domainStatus: string;
  seoStatus: string;
  lastUpdated: string;
}

interface WebsiteTheme {
  id: string;
  name: string;
  description: string;
  category: string;
}

export function DashboardAnalytics() {
  const { currentWebsite } = useWebsite();
  const [stats, setStats] = useState<WebsiteStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [themes, setThemes] = useState<WebsiteTheme[]>([]);
  const [themesLoading, setThemesLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!currentWebsite?._id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Fetch data for current website
        const [pagesRes, propertiesRes, testimonialsRes, contactsRes] =
          await Promise.all([
            fetch(`/api/pages?websiteId=${currentWebsite._id}`),
            fetch(`/api/properties?websiteId=${currentWebsite._id}`),
            fetch(`/api/testimonials?websiteId=${currentWebsite._id}`),
            fetch(`/api/contact?websiteId=${currentWebsite._id}`),
          ]);

        let pages = 0;
        let properties = 0;
        let testimonials = 0;
        let contacts = 0;

        if (pagesRes.ok) {
          const data = await pagesRes.json();
          pages = data.pages?.length || 0;
        }

        if (propertiesRes.ok) {
          const data = await propertiesRes.json();
          properties = data.properties?.length || 0;
        }

        if (testimonialsRes.ok) {
          const data = await testimonialsRes.json();
          testimonials = data.testimonials?.length || 0;
        }

        if (contactsRes.ok) {
          const data = await contactsRes.json();
          contacts = data.contacts?.length || 0;
        }

        setStats({
          pages,
          properties,
          testimonials,
          contacts,
          blog: 0,
          domainStatus: currentWebsite?.domainName ? "Connected" : "Not Set",
          seoStatus: "Optimized",
          lastUpdated: new Date().toLocaleDateString(),
        });
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [currentWebsite]);

  // Fetch themes
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

  if (loading) {
    return (
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 px-4 lg:px-6">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  if (!currentWebsite) {
    return (
      <Card className="mx-4 lg:mx-6">
        <CardContent className="pt-6">
          <p className="text-muted-foreground">No website selected</p>
        </CardContent>
      </Card>
    );
  }

  const statCards = [
    {
      icon: FileText,
      label: "Pages",
      value: stats?.pages || 0,
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-950/30",
    },
    {
      icon: Globe,
      label: "Properties",
      value: stats?.properties || 0,
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-950/30",
    },
    {
      icon: Users,
      label: "Testimonials",
      value: stats?.testimonials || 0,
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-950/30",
    },
    {
      icon: MessageSquare,
      label: "Contacts",
      value: stats?.contacts || 0,
      color: "text-orange-500",
      bgColor: "bg-orange-50 dark:bg-orange-950/30",
    },
    {
      icon: CheckCircle,
      label: "Domain Status",
      value: stats?.domainStatus,
      color: "text-emerald-500",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
    },
    {
      icon: Eye,
      label: "SEO Status",
      value: stats?.seoStatus,
      color: "text-indigo-500",
      bgColor: "bg-indigo-50 dark:bg-indigo-950/30",
    },
  ];

  return (
    <div className="space-y-6 px-4 lg:px-6 py-6">
      {/* Website Overview */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Website Overview</h2>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="overflow-hidden">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground mb-1">
                        {stat.label}
                      </p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                      <Icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Website Details */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Website Details</h2>
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Domain Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Website Name</p>
                <p className="font-medium">{currentWebsite.companyName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Domain</p>
                <p className="font-medium font-mono text-sm">
                  {currentWebsite.domainName}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge className="mt-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  {currentWebsite.status}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Theme & Customization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Current Theme</p>
                <p className="font-medium capitalize">
                  {themesLoading
                    ? currentWebsite.selectedTheme
                    : getThemeName(currentWebsite.selectedTheme)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p className="font-medium">{stats?.lastUpdated}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Content Status</p>
                <Badge className="mt-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  Active
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {[
            { label: "Pages", icon: FileText, href: "/app/pages" },
            { label: "Properties", icon: Globe, href: "/app/properties" },
            { label: "Testimonials", icon: Users, href: "/app/testimonials" },
            { label: "Contacts", icon: MessageSquare, href: "/app/contacts" },
            { label: "Domain", icon: Globe, href: "/app/domain" },
            { label: "Settings", icon: Settings, href: "/app/settings" },
          ].map((action, index) => {
            const Icon = action.icon;
            return (
              <a
                key={index}
                href={action.href}
                className="p-4 border rounded-lg hover:bg-accent transition-colors text-center"
              >
                <Icon className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm font-medium">{action.label}</p>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
