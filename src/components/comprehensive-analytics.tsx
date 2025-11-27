"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useWebsite } from "@/contexts/website-context";
import { useAuth } from "@/contexts/AuthContext";
import { PRICING_PLANS, getPlanById } from "@/constants/pricing";
import {
  AlertCircle,
  CheckCircle,
  Eye,
  FileText,
  Heart,
  MessageSquare,
  TrendingUp,
  Users,
  Info,
  Zap,
  Activity,
  Trash2,
  Crown,
  ArrowRight,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnalyticsCharts } from "./analytics-charts";

// Helper function to format numbers with commas
const formatNumber = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

interface ChartDataPoint {
  date: string;
  visitors: number;
  conversions: number;
  pageviews: number;
}

interface AnalyticsData {
  website: {
    id: string;
    name: string;
    company: string;
    domain: string;
    theme: string;
    status: string;
    createdAt: string;
  };
  googleAnalytics: {
    measurementId: string | null;
    propertyId?: string | null;
    metrics?: {
      users: number;
      newUsers: number;
      sessions: number;
      bounceRate: string;
      pageviews: number;
      avgSessionDuration: string;
      conversions: number;
      conversionRate: number;
    };
  };
  content: {
    pages: number;
    blogPosts: number;
    properties: number;
    testimonials: number;
  };
  leads: {
    total: number;
    propertiesWithInquiries: number;
    recentContacts: any[];
  };
  performance: {
    totalVisitors: number;
    totalPageviews: number;
    averageSessionDuration: string;
    bounceRate: string;
    conversionRate: number;
  };
  summary: {
    lastUpdated: string;
    healthScore: number;
  };
  chartData?: ChartDataPoint[];
}

export function ComprehensiveAnalytics() {
  const { currentWebsite, websites } = useWebsite();
  const { user } = useAuth();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDummyData, setIsDummyData] = useState(false);

  // Get user plan info
  const userPlan = getPlanById(user?.selectedPlan || "starter");
  const websiteLimit = userPlan?.websiteLimit || 1;
  const isStarterPlan = user?.selectedPlan === "starter";
  const isNearLimit = websites.length >= websiteLimit * 0.8; // Show upgrade when 80% of limit reached

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!currentWebsite?._id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Check if demo mode is enabled via URL parameter
        const params = new URLSearchParams(window.location.search);
        const isDemoMode = params.get("demo") === "true";

        if (isDemoMode) {
          throw new Error("Demo mode enabled - showing dummy data");
        }

        const response = await fetch(
          `/api/analytics?websiteId=${currentWebsite._id}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch analytics");
        }

        const data = await response.json();
        setAnalytics(data);
      } catch (err) {
        console.error("Analytics fetch error:", err);
        // Use dummy data for demo/screenshot purposes
        const dummyData: AnalyticsData = {
          website: {
            id: currentWebsite._id,
            name: currentWebsite.companyName || "My Property Website",
            company: currentWebsite.companyName || "My Company",
            domain: currentWebsite.domainName || "example.com",
            theme: currentWebsite.selectedTheme || "homely",
            status: "Active",
            createdAt: new Date().toISOString(),
          },
          googleAnalytics: {
            measurementId: "G-XXXXXXXXXX",
            propertyId: "123456789",
            metrics: {
              users: 2847,
              newUsers: 1256,
              sessions: 4321,
              bounceRate: "32.5%",
              pageviews: 8956,
              avgSessionDuration: "4m 23s",
              conversions: 284,
              conversionRate: 6.58,
            },
          },
          content: {
            pages: 12,
            blogPosts: 8,
            properties: 45,
            testimonials: 18,
          },
          leads: {
            total: 142,
            propertiesWithInquiries: 31,
            recentContacts: [
              {
                _id: "1",
                name: "John Smith",
                email: "john@example.com",
                phone: "(555) 123-4567",
                message: "Interested in the downtown condo",
                createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
              },
              {
                _id: "2",
                name: "Sarah Johnson",
                email: "sarah@example.com",
                phone: "(555) 234-5678",
                message: "Can I schedule a viewing?",
                createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
              },
              {
                _id: "3",
                name: "Michael Chen",
                email: "michael@example.com",
                phone: "(555) 345-6789",
                message: "Tell me more about the beachfront property",
                createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
              },
            ],
          },
          performance: {
            totalVisitors: 2847,
            totalPageviews: 8956,
            averageSessionDuration: "4m 23s",
            bounceRate: "32.5%",
            conversionRate: 6.58,
          },
          summary: {
            lastUpdated: new Date().toISOString(),
            healthScore: 87,
          },
          chartData: [
            { date: "Nov 20", visitors: 1820, conversions: 156, pageviews: 5420 },
            { date: "Nov 21", visitors: 2100, conversions: 178, pageviews: 6210 },
            { date: "Nov 22", visitors: 2340, conversions: 195, pageviews: 7100 },
            { date: "Nov 23", visitors: 1950, conversions: 162, pageviews: 5890 },
            { date: "Nov 24", visitors: 2580, conversions: 210, pageviews: 7650 },
            { date: "Nov 25", visitors: 2850, conversions: 235, pageviews: 8450 },
            { date: "Nov 26", visitors: 2760, conversions: 228, pageviews: 8200 },
          ],
        };
        setAnalytics(dummyData);
        setIsDummyData(true);
        
        // Auto-clear dummy data after 5 minutes
        const timer = setTimeout(() => {
          setAnalytics(null);
          setIsDummyData(false);
        }, 5 * 60 * 1000); // 5 minutes
        
        return () => clearTimeout(timer);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [currentWebsite]);

  const handleDeleteWebsite = async () => {
    if (!currentWebsite?._id) return;

    try {
      setIsDeleting(true);
      setDeleteError(null);

      const response = await fetch(`/api/websites?id=${currentWebsite._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to delete website");
      }

      // Show success message and redirect
      alert("Website deleted successfully. Redirecting to dashboard...");
      window.location.href = "/app/dashboard";
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to delete website";
      setDeleteError(errorMsg);
      console.error("Website deletion error:", err);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 px-4 lg:px-6 mt-7">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-64" />
        ))}
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-muted-foreground/25 p-8 text-center md:mx-12 mt-7">
        <AlertCircle className="mb-2 h-12 w-12 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">
          {error || "No analytics data available"}
        </p>
      </div>
    );
  }

  const healthScore = analytics.summary.healthScore;
  const healthColor =
    healthScore >= 80
      ? "text-green-600"
      : healthScore >= 60
      ? "text-yellow-600"
      : "text-red-600";

  return (
    <div className="space-y-6 px-4 py-6 lg:px-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold">Website Analytics Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            Comprehensive overview of {analytics.website.name}
          </p>
        </div>
      </div>

      {/* Dummy Data Notice Banner */}
      {!isDummyData && (
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-800">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">
                    📸 Preview Mode: Sample Data Displayed
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    This is demo data to showcase the dashboard. It will be cleared in 5 minutes or when you refresh the page.
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setAnalytics(null);
                  setIsDummyData(false);
                }}
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                Clear Now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upgrade Prompt for Starter Users */}
      {(isStarterPlan || isNearLimit) && (
        <Card className="border-slate-700/50 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-lg shadow-slate-900/20">
          <CardHeader className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-slate-700/50 p-2">
                  <Crown className="h-5 w-5 text-slate-300" />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold text-white">
                    {isStarterPlan
                      ? "Unlock More Websites"
                      : "Approaching Plan Limit"}
                  </CardTitle>
                  <p className="text-sm text-slate-400">
                    {isStarterPlan
                      ? "You're on the Starter plan (1 website). Upgrade to create multiple websites and unlock premium features."
                      : `You have ${websites.length}/${websiteLimit} websites. Consider upgrading for more capacity.`}
                  </p>
                </div>
              </div>
              <Button
                onClick={() => router.push("/app/settings")}
                size="sm"
                className="bg-slate-600 hover:bg-slate-700 text-white border-slate-600"
              >
                <ArrowRight className="h-4 w-4 mr-1" />
                Upgrade Plan
              </Button>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Google Analytics Status Alert - Compact */}
      {!analytics.googleAnalytics.measurementId && (
        <Card className="border-slate-700/50 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-lg shadow-slate-900/20">
          <CardHeader className="py-3 px-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-slate-700/50 p-2">
                  <AlertCircle className="h-4 w-4 text-slate-300" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <CardTitle className="text-sm font-semibold text-white">
                    Google Analytics Not Connected
                  </CardTitle>
                  <p className="text-xs text-slate-400">
                    Setup required to track visitor insights
                  </p>
                </div>
              </div>
              <div className="hidden flex-wrap gap-1 sm:flex">
                <div className="inline-flex items-center gap-1 rounded-full bg-slate-700/30 px-2.5 py-1 text-xs text-slate-300">
                  ✓ Tracking
                </div>
                <div className="inline-flex items-center gap-1 rounded-full bg-slate-700/30 px-2.5 py-1 text-xs text-slate-300">
                  ✓ Analysis
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Key Performance Indicators - 2x2 Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Row 1 - Visitors Card (Larger) */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 text-xs">
              <Users className="h-4 w-4" />
              Total Visitors
            </CardDescription>
            <CardTitle className="text-3xl font-bold">
              {formatNumber(analytics.performance.totalVisitors)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {formatNumber(analytics.googleAnalytics.metrics?.newUsers || 0)} new visitors
              this period
            </p>
          </CardContent>
        </Card>

        {/* Row 1 - Pageviews Card (Larger) */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 text-xs">
              <Eye className="h-4 w-4" />
              Total Pageviews
            </CardDescription>
            <CardTitle className="text-3xl font-bold">
              {formatNumber(analytics.performance.totalPageviews)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {parseFloat(
                analytics.performance.averageSessionDuration as string
              ).toFixed(1)}
              s average session duration
            </p>
          </CardContent>
        </Card>

        {/* Row 2 - Conversion Rate Card (Larger) */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 text-xs">
              <CheckCircle className="h-4 w-4" />
              Conversion Rate
            </CardDescription>
            <CardTitle className="text-3xl font-bold">
              {analytics.performance.conversionRate.toFixed(1)}%
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {formatNumber(analytics.googleAnalytics.metrics?.conversions || 0)} total
              conversions
            </p>
          </CardContent>
        </Card>

        {/* Row 2 - Bounce Rate Card (Larger) */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 text-xs">
              <TrendingUp className="h-4 w-4" />
              Bounce Rate
            </CardDescription>
            <CardTitle className="text-3xl font-bold">
              {parseFloat(analytics.performance.bounceRate as string).toFixed(
                1
              )}
              %
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {formatNumber(analytics.googleAnalytics.metrics?.sessions || 0)} sessions
              tracked
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Charts Section */}
      {analytics.googleAnalytics.measurementId && (
        <>
          <div className="flex items-center justify-between pt-4">
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-semibold">Analytics Charts</h3>
              <p className="text-sm text-muted-foreground">
                Detailed insights into visitor behavior and conversions
              </p>
            </div>
          </div>
          <AnalyticsCharts websiteId={analytics.website.id} chartData={analytics.chartData} />
        </>
      )}

      {/* Content & Lead Stats Grid - 2 Column */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Content Metrics */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4" />
              Content Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Pages</span>
              <Badge variant="secondary" className="text-xs">
                {formatNumber(analytics.content.pages)}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Blog Posts</span>
              <Badge variant="secondary" className="text-xs">
                {formatNumber(analytics.content.blogPosts)}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Properties</span>
              <Badge variant="secondary" className="text-xs">
                {formatNumber(analytics.content.properties)}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Testimonials</span>
              <Badge variant="secondary" className="text-xs">
                {formatNumber(analytics.content.testimonials)}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Lead Generation Stats */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <MessageSquare className="h-4 w-4" />
              Lead Generation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Total Leads</span>
              <Badge variant="secondary" className="text-xs">
                {formatNumber(analytics.leads.total)}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Inquiries</span>
              <Badge variant="secondary" className="text-xs">
                {formatNumber(analytics.leads.propertiesWithInquiries)}
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground">
              {analytics.leads.recentContacts.length > 0 ? (
                <span>
                  {analytics.leads.recentContacts.length} recent contacts
                </span>
              ) : (
                <span>No recent contacts</span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Health Score - Compact */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Heart className={`h-5 w-5 ${healthColor}`} />
                <CardTitle>Health Score</CardTitle>
              </div>
              <Info className="h-4 w-4 text-muted-foreground" />
            </div>
            <CardDescription>
              Website overall performance and optimization score
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Main Score */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-3 flex-1 rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full transition-all ${
                        healthScore >= 80
                          ? "bg-green-600"
                          : healthScore >= 60
                          ? "bg-yellow-600"
                          : "bg-red-600"
                      }`}
                      style={{ width: `${healthScore}%` }}
                    />
                  </div>
                  <span className={`text-2xl font-bold ${healthColor}`}>
                    {healthScore}%
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {healthScore >= 80
                    ? "Excellent! Your website is performing great."
                    : healthScore >= 60
                    ? "Good! Consider optimizing key areas."
                    : "Needs attention. Review recommendations below."}
                </p>
              </div>

              {/* Score Guide */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-500" />
                  Score Factors
                </h4>
                <div className="grid gap-2 text-sm">
                  <div className="flex items-start gap-2 p-2 rounded bg-slate-900 text-white">
                    <FileText className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Content Quality</p>
                      <p className="text-xs text-slate-300">
                        Pages, blog posts, properties
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-2 rounded bg-slate-900 text-white">
                    <Activity className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">User Engagement</p>
                      <p className="text-xs text-slate-300">
                        Visitors, sessions, conversions
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-2 rounded bg-slate-900 text-white">
                    <MessageSquare className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Lead Generation</p>
                      <p className="text-xs text-slate-300">
                        Customer inquiries and contacts
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Tips to Improve
                </h4>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  <li>✓ Add more content to your website</li>
                  <li>✓ Enable Google Analytics tracking</li>
                  <li>✓ Optimize your property listings</li>
                  <li>✓ Engage with customer leads</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Website Details */}
        <Card>
          <CardHeader>
            <CardTitle>Website Details</CardTitle>
            <CardDescription>
              Configuration and status information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 xl:grid-cols-2">
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">
                  Domain
                </p>
                <p className="text-sm font-medium">
                  {analytics.website.domain}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">
                  Theme
                </p>
                <Badge>{analytics.website.theme}</Badge>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">
                  Status
                </p>
                <Badge variant="outline" className="capitalize">
                  {analytics.website.status}
                </Badge>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">
                  Google Analytics ID
                </p>
                <p className="text-xs font-mono">
                  {analytics.googleAnalytics.measurementId || "Not configured"}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">
                  GA4 Property ID
                </p>
                <p className="text-xs font-mono">
                  {analytics.googleAnalytics.propertyId || "Not configured"}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">
                  Created
                </p>
                <p className="text-sm">
                  {new Date(analytics.website.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">
                  Last Updated
                </p>
                <p className="text-sm">
                  {new Date(analytics.summary.lastUpdated).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Delete Website Button */}
            <div className="mt-6 border-t pt-6">
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg border border-red-200 hover:border-red-300 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Delete Website
              </button>
              <p className="text-xs text-muted-foreground mt-2">
                This action will remove the website from Vercel, GitHub, and all
                databases. This cannot be undone.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Leads Section - Full Width */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Recent Leads & Contacts
              </CardTitle>
              <CardDescription>
                Latest customer inquiries and interactions
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {analytics.leads.recentContacts &&
          analytics.leads.recentContacts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                      Name
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                      Email
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                      Phone
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                      Property
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.leads.recentContacts
                    .slice(0, 10)
                    .map((contact, idx) => (
                      <tr key={idx} className="border-b hover:bg-muted/50">
                        <td className="px-4 py-3">
                          <p className="font-medium">{contact.name}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs text-muted-foreground">
                            {contact.email}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs text-muted-foreground">
                            {contact.phone || "-"}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs text-muted-foreground">
                            {contact.property || "-"}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs text-muted-foreground">
                            {contact.date
                              ? new Date(contact.date).toLocaleDateString()
                              : "-"}
                          </p>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex items-center justify-center rounded-lg border border-dashed border-muted-foreground/25 py-8 text-center">
              <p className="text-sm text-muted-foreground">
                No leads or contacts yet
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md text-white">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2 text-red-400">
                <Trash2 className="h-5 w-5" />
                Delete Website
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <p className="font-semibold text-white">
                  Are you sure you want to delete "{analytics?.website.name}"?
                </p>
                <p className="text-sm text-slate-400">
                  This will permanently remove:
                </p>
                <ul className="text-sm text-slate-400 list-disc list-inside space-y-1">
                  <li>Vercel deployment and project</li>
                  <li>GitHub repository</li>
                  <li>Google Analytics property</li>
                  <li>Namecheap domain records</li>
                  <li>Custom website database</li>
                  <li>All website data and configuration</li>
                </ul>
                <p className="text-sm text-red-400 font-semibold mt-4">
                  This action cannot be undone.
                </p>
              </div>

              {deleteError && (
                <div className="rounded-lg bg-red-950/50 border border-red-900 p-3">
                  <p className="text-sm text-red-300">{deleteError}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteError(null);
                  }}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 text-sm font-medium border border-slate-600 rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-colors text-slate-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteWebsite}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Delete Website
                    </>
                  )}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
