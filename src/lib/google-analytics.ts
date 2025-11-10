// Google Analytics utility functions for the frontend and backend

import { google } from "googleapis";

// Types for GA4 metrics
export interface GAMetrics {
  users: number;
  newUsers: number;
  sessions: number;
  bounceRate: number;
  pageviews: number;
  avgSessionDuration: number;
  conversionRate: number;
  totalConversions: number;
}

// Types for detailed analytics data
export interface TrafficSourceData {
  source: string;
  users: number;
  sessions: number;
  percentage: number;
}

export interface DailyTrendData {
  date: string;
  visitors: number;
  sessions: number;
  pageviews: number;
  bounceRate: number;
}

export interface DeviceBreakdownData {
  device: string;
  users: number;
  sessions: number;
  bounceRate: number;
}

/**
 * Fetch GA4 metrics from Google Analytics API
 * Server-side function for use in API routes
 */
export async function fetchGA4Report(
  measurementId: string,
  startDate: string = "30daysAgo",
  endDate: string = "today"
): Promise<GAMetrics> {
  try {
    const keyFile = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    if (!keyFile) {
      throw new Error(
        "GOOGLE_SERVICE_ACCOUNT_KEY environment variable not set"
      );
    }

    const credentials = JSON.parse(
      Buffer.from(keyFile, "base64").toString("utf-8")
    );

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/analytics.readonly"],
    });

    const analyticsdata = google.analyticsdata({
      version: "v1beta",
      auth,
    });

    const response = await analyticsdata.properties.runReport({
      property: `properties/${measurementId}`,
      requestBody: {
        dateRanges: [{ startDate, endDate }],
        metrics: [
          { name: "activeUsers" },
          { name: "newUsers" },
          { name: "sessions" },
          { name: "bounceRate" },
          { name: "screenPageViews" },
          { name: "averageSessionDuration" },
          { name: "conversions" },
        ],
        dimensions: [{ name: "date" }],
      },
    });

    // Process and aggregate the data
    let totalUsers = 0;
    let totalNewUsers = 0;
    let totalSessions = 0;
    let totalBounceRate = 0;
    let totalPageviews = 0;
    let totalAvgDuration = 0;
    let totalConversions = 0;
    let rowCount = 0;

    const rows = response.data.rows || [];
    rows.forEach((row: any) => {
      const values = row.metricValues || [];
      if (values.length >= 7) {
        totalUsers += parseInt(values[0]?.value || "0", 10);
        totalNewUsers += parseInt(values[1]?.value || "0", 10);
        totalSessions += parseInt(values[2]?.value || "0", 10);
        totalBounceRate += parseFloat(values[3]?.value || "0");
        totalPageviews += parseInt(values[4]?.value || "0", 10);
        totalAvgDuration += parseFloat(values[5]?.value || "0");
        totalConversions += parseInt(values[6]?.value || "0", 10);
        rowCount++;
      }
    });

    const conversionRate =
      totalSessions > 0 ? (totalConversions / totalSessions) * 100 : 0;

    return {
      users: totalUsers,
      newUsers: totalNewUsers,
      sessions: totalSessions,
      bounceRate: rowCount > 0 ? totalBounceRate / rowCount : 0,
      pageviews: totalPageviews,
      avgSessionDuration: rowCount > 0 ? totalAvgDuration / rowCount : 0,
      conversionRate,
      totalConversions,
    };
  } catch (error) {
    console.error("Error fetching GA4 report:", error);
    // Return default metrics if API call fails
    return {
      users: 0,
      newUsers: 0,
      sessions: 0,
      bounceRate: 0,
      pageviews: 0,
      avgSessionDuration: 0,
      conversionRate: 0,
      totalConversions: 0,
    };
  }
}

/**
 * Fetch daily trend data from GA4 for visitor trends chart
 * Returns data for the last 30 days
 */
export async function fetchGA4DailyTrends(
  measurementId: string,
  startDate: string = "30daysAgo",
  endDate: string = "today"
): Promise<DailyTrendData[]> {
  try {
    const keyFile = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    if (!keyFile) {
      throw new Error(
        "GOOGLE_SERVICE_ACCOUNT_KEY environment variable not set"
      );
    }

    const credentials = JSON.parse(
      Buffer.from(keyFile, "base64").toString("utf-8")
    );

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/analytics.readonly"],
    });

    const analyticsdata = google.analyticsdata({
      version: "v1beta",
      auth,
    });

    const response = await analyticsdata.properties.runReport({
      property: `properties/${measurementId}`,
      requestBody: {
        dateRanges: [{ startDate, endDate }],
        metrics: [
          { name: "activeUsers" },
          { name: "sessions" },
          { name: "screenPageViews" },
          { name: "bounceRate" },
        ],
        dimensions: [{ name: "date" }],
        orderBys: [
          {
            dimension: { orderType: "ALPHANUMERIC", dimensionName: "date" },
          },
        ],
      },
    });

    const trends: DailyTrendData[] = [];
    const rows = response.data.rows || [];

    rows.forEach((row: any) => {
      const dateStr = row.dimensionValues?.[0]?.value || "";
      const values = row.metricValues || [];

      if (dateStr && values.length >= 4) {
        // Format date as "Mon D"
        const date = new Date(
          dateStr.substring(0, 4),
          parseInt(dateStr.substring(4, 6)) - 1,
          dateStr.substring(6, 8)
        );
        const formattedDate = date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });

        trends.push({
          date: formattedDate,
          visitors: parseInt(values[0]?.value || "0", 10),
          sessions: parseInt(values[1]?.value || "0", 10),
          pageviews: parseInt(values[2]?.value || "0", 10),
          bounceRate: parseFloat(values[3]?.value || "0"),
        });
      }
    });

    return trends;
  } catch (error) {
    console.error("Failed to fetch daily trends from GA4:", error);
    throw error;
  }
}

/**
 * Fetch traffic source breakdown from GA4
 * Returns traffic distribution by source
 */
export async function fetchGA4TrafficSources(
  measurementId: string,
  startDate: string = "30daysAgo",
  endDate: string = "today"
): Promise<TrafficSourceData[]> {
  try {
    const keyFile = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    if (!keyFile) {
      throw new Error(
        "GOOGLE_SERVICE_ACCOUNT_KEY environment variable not set"
      );
    }

    const credentials = JSON.parse(
      Buffer.from(keyFile, "base64").toString("utf-8")
    );

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/analytics.readonly"],
    });

    const analyticsdata = google.analyticsdata({
      version: "v1beta",
      auth,
    });

    const response = await analyticsdata.properties.runReport({
      property: `properties/${measurementId}`,
      requestBody: {
        dateRanges: [{ startDate, endDate }],
        metrics: [{ name: "activeUsers" }, { name: "sessions" }],
        dimensions: [{ name: "sessionSource" }],
        limit: "10",
      },
    });

    const sources: TrafficSourceData[] = [];
    const rows = response.data.rows || [];
    let totalUsers = 0;

    // Calculate total users first
    rows.forEach((row: any) => {
      const values = row.metricValues || [];
      if (values.length >= 1) {
        totalUsers += parseInt(values[0]?.value || "0", 10);
      }
    });

    // Calculate percentages
    rows.forEach((row: any) => {
      const sourceStr = row.dimensionValues?.[0]?.value || "Direct";
      const values = row.metricValues || [];

      if (values.length >= 2) {
        const users = parseInt(values[0]?.value || "0", 10);
        const sessions = parseInt(values[1]?.value || "0", 10);
        const percentage =
          totalUsers > 0 ? Math.round((users / totalUsers) * 100) : 0;

        sources.push({
          source: sourceStr,
          users,
          sessions,
          percentage,
        });
      }
    });

    return sources;
  } catch (error) {
    console.error("Failed to fetch traffic sources from GA4:", error);
    throw error;
  }
}

/**
 * Fetch device breakdown from GA4
 * Returns metrics by device type (mobile, desktop, tablet)
 */
export async function fetchGA4DeviceBreakdown(
  measurementId: string,
  startDate: string = "30daysAgo",
  endDate: string = "today"
): Promise<DeviceBreakdownData[]> {
  try {
    const keyFile = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    if (!keyFile) {
      throw new Error(
        "GOOGLE_SERVICE_ACCOUNT_KEY environment variable not set"
      );
    }

    const credentials = JSON.parse(
      Buffer.from(keyFile, "base64").toString("utf-8")
    );

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/analytics.readonly"],
    });

    const analyticsdata = google.analyticsdata({
      version: "v1beta",
      auth,
    });

    const response = await analyticsdata.properties.runReport({
      property: `properties/${measurementId}`,
      requestBody: {
        dateRanges: [{ startDate, endDate }],
        metrics: [
          { name: "activeUsers" },
          { name: "sessions" },
          { name: "bounceRate" },
        ],
        dimensions: [{ name: "deviceCategory" }],
      },
    });

    const devices: DeviceBreakdownData[] = [];
    const rows = response.data.rows || [];

    rows.forEach((row: any) => {
      const deviceStr = row.dimensionValues?.[0]?.value || "Mobile";
      const values = row.metricValues || [];

      if (values.length >= 3) {
        devices.push({
          device: deviceStr.charAt(0).toUpperCase() + deviceStr.slice(1),
          users: parseInt(values[0]?.value || "0", 10),
          sessions: parseInt(values[1]?.value || "0", 10),
          bounceRate: parseFloat(values[2]?.value || "0"),
        });
      }
    });

    return devices;
  } catch (error) {
    console.error("Failed to fetch device breakdown from GA4:", error);
    throw error;
  }
}

/**
 * Initialize Google Analytics 4 (Client-side)
 */
export function initializeGA4(measurementId: string) {
  if (typeof window === "undefined" || !measurementId) return;

  // Load the GA4 script
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  // Initialize gtag
  (window as any).dataLayer = (window as any).dataLayer || [];
  function gtag(...args: any[]) {
    (window as any).dataLayer.push(arguments);
  }
  (window as any).gtag = gtag;
  gtag("js", new Date());
  gtag("config", measurementId, {
    page_path: window.location.pathname,
    anonymize_ip: true,
    send_page_view: true,
  });
}

/**
 * Track form submission
 */
export function trackFormSubmission(formName: string) {
  if (typeof window === "undefined" || !(window as any).gtag) return;

  (window as any).gtag("event", "form_submission", {
    form_name: formName,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track property inquiry
 */
export function trackPropertyInquiry(propertyId: string, propertyName: string) {
  if (typeof window === "undefined" || !(window as any).gtag) return;

  (window as any).gtag("event", "property_inquiry", {
    property_id: propertyId,
    property_name: propertyName,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track contact click
 */
export function trackContactClick(contactType: string) {
  if (typeof window === "undefined" || !(window as any).gtag) return;

  (window as any).gtag("event", "contact_click", {
    contact_type: contactType,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track page view
 */
export function trackPageView(pageName: string, pagePath: string) {
  if (typeof window === "undefined" || !(window as any).gtag) return;

  (window as any).gtag("event", "page_view", {
    page_title: pageName,
    page_path: pagePath,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track custom event
 */
export function trackCustomEvent(
  eventName: string,
  eventData: Record<string, any>
) {
  if (typeof window === "undefined" || !(window as any).gtag) return;

  (window as any).gtag("event", eventName, {
    ...eventData,
    timestamp: new Date().toISOString(),
  });
}
