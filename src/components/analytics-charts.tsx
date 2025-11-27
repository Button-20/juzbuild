"use client";

import React, { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TrendingUp, Users, BarChart3, PieChart as PieChartIcon, Database } from "lucide-react";

interface AnalyticsChartProps {
  websiteId?: string;
  chartData?: Array<{
    date: string;
    visitors: number;
    conversions: number;
    pageviews: number;
  }>;
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
}

interface DailyTrendData {
  date: string;
  visitors: number;
  sessions: number;
  pageviews: number;
  bounceRate: number;
}

interface TrafficSourceData {
  source: string;
  users: number;
  sessions: number;
  percentage: number;
}

interface DeviceBreakdownData {
  device: string;
  users: number;
  sessions: number;
  bounceRate: number;
}

interface WeeklyPerformanceData {
  period: string;
  pageviews: number;
  sessions: number;
  bounceRate: number;
}

/**
 * Chart 1: Visitor Trends Over Time (Area Chart)
 * Shows daily visitor and session trends from real GA4 data
 */
export function VisitorTrendsChart({ websiteId, chartData }: AnalyticsChartProps) {
  const [data, setData] = useState<DailyTrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      // If chartData is provided (from demo mode), use it directly
      if (chartData && chartData.length > 0) {
        const formattedData = chartData.map((item) => ({
          date: new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          visitors: item.visitors,
          sessions: Math.round(item.visitors * 1.5), // Estimate sessions
          pageviews: item.pageviews,
          bounceRate: parseFloat((Math.random() * 50 + 25).toFixed(1)),
        }));
        setData(formattedData);
        setLoading(false);
        return;
      }

      if (!websiteId) {
        setError("No website ID provided");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/analytics/charts?websiteId=${websiteId}`);
        if (!response.ok) throw new Error("Failed to fetch chart data");
        const result = await response.json();
        
        // Format dates to "Mon D" format and prepare data
        const formattedData = (result.dailyTrends || []).map((item: DailyTrendData) => ({
          ...item,
          date: new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        }));
        
        setData(formattedData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [websiteId, chartData]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-500" />
          <div>
            <CardTitle>Visitor Trends</CardTitle>
            <CardDescription>Daily visitors and sessions over the last 30 days</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-[300px]">
            <p className="text-gray-500">Loading chart data...</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-[300px]">
            <p className="text-red-500">{error}</p>
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[300px] gap-2">
            <Database className="h-12 w-12 text-gray-300" />
            <p className="text-gray-500">No data available</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="visitors"
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#colorVisitors)"
                name="Visitors"
              />
              <Area
                type="monotone"
                dataKey="sessions"
                stroke="#10b981"
                fillOpacity={1}
                fill="url(#colorSessions)"
                name="Sessions"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Chart 2: Traffic Sources Breakdown (Pie Chart)
 * Shows distribution of traffic from different sources using real GA4 data
 */
export function TrafficSourcesChart({ websiteId, chartData }: AnalyticsChartProps) {
  const [data, setData] = useState<(TrafficSourceData & { color: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899"];

  useEffect(() => {
    const fetchData = async () => {
      // If chartData is provided (from demo mode), use it to create traffic sources
      if (chartData && chartData.length > 0) {
        const demoSources = [
          { source: "Organic Search", users: Math.round(2847 * 0.45), sessions: Math.round(4321 * 0.45), percentage: 45 },
          { source: "Direct", users: Math.round(2847 * 0.30), sessions: Math.round(4321 * 0.30), percentage: 30 },
          { source: "Social Media", users: Math.round(2847 * 0.15), sessions: Math.round(4321 * 0.15), percentage: 15 },
          { source: "Referral", users: Math.round(2847 * 0.10), sessions: Math.round(4321 * 0.10), percentage: 10 },
        ];
        const trafficWithColors = demoSources.map(
          (item: TrafficSourceData, index: number) => ({
            ...item,
            color: colors[index % colors.length],
          })
        );
        setData(trafficWithColors);
        setLoading(false);
        return;
      }

      if (!websiteId) {
        setError("No website ID provided");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/analytics/charts?websiteId=${websiteId}`);
        if (!response.ok) throw new Error("Failed to fetch chart data");
        const result = await response.json();
        
        // Add colors to traffic sources data
        const trafficWithColors = (result.trafficSources || []).map(
          (item: TrafficSourceData, index: number) => ({
            ...item,
            color: colors[index % colors.length],
          })
        );
        
        setData(trafficWithColors);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [websiteId, chartData]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <PieChartIcon className="h-5 w-5 text-amber-500" />
          <div>
            <CardTitle>Traffic Sources</CardTitle>
            <CardDescription>Distribution of traffic by source</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-[300px]">
            <p className="text-gray-500">Loading chart data...</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-[300px]">
            <p className="text-red-500">{error}</p>
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[300px] gap-2">
            <Database className="h-12 w-12 text-gray-300" />
            <p className="text-gray-500">No data available</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ source, percentage }) => `${source}: ${percentage}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="percentage"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value}%`} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Chart 3: Conversion Performance (Bar Chart)
 * Shows engagement and performance metrics from real GA4 data
 */
export function ConversionPerformanceChart({ websiteId, chartData }: AnalyticsChartProps) {
  const [data, setData] = useState<WeeklyPerformanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      // If chartData is provided (from demo mode), use it directly
      if (chartData && chartData.length > 0) {
        const weeklyData: WeeklyPerformanceData[] = [
          {
            period: "Week 1",
            pageviews: 7050,
            sessions: 2000,
            bounceRate: 32.5,
          },
        ];
        setData(weeklyData);
        setLoading(false);
        return;
      }

      if (!websiteId) {
        setError("No website ID provided");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/analytics/charts?websiteId=${websiteId}`);
        if (!response.ok) throw new Error("Failed to fetch chart data");
        const result = await response.json();
        
        // Use daily trends data grouped by week for chart display
        const dailyData = result.dailyTrends || [];
        const weeklyData: WeeklyPerformanceData[] = [];
        
        for (let i = 0; i < dailyData.length; i += 7) {
          const weekChunk = dailyData.slice(i, i + 7);
          const weekNum = Math.floor(i / 7) + 1;
          const avgPageviews = Math.round(
            weekChunk.reduce((sum: number, d: DailyTrendData) => sum + d.pageviews, 0) / weekChunk.length
          );
          const avgBounceRate = (
            weekChunk.reduce((sum: number, d: DailyTrendData) => sum + d.bounceRate, 0) / weekChunk.length
          ).toFixed(2);
          
          weeklyData.push({
            period: `Week ${weekNum}`,
            pageviews: avgPageviews,
            sessions: weekChunk.reduce((sum: number, d: DailyTrendData) => sum + d.sessions, 0),
            bounceRate: parseFloat(avgBounceRate),
          });
        }
        
        setData(weeklyData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [websiteId, chartData]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-green-500" />
          <div>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>Weekly pageviews, sessions, and bounce rates</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-[300px]">
            <p className="text-gray-500">Loading chart data...</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-[300px]">
            <p className="text-red-500">{error}</p>
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[300px] gap-2">
            <Database className="h-12 w-12 text-gray-300" />
            <p className="text-gray-500">No data available</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="pageviews" fill="#10b981" name="Pageviews" />
              <Bar yAxisId="left" dataKey="sessions" fill="#3b82f6" name="Sessions" />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="bounceRate"
                stroke="#f59e0b"
                name="Bounce Rate (%)"
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Chart 4: User Engagement Metrics (Line Chart)
 * Shows engagement patterns from real GA4 data
 */
export function EngagementMetricsChart({ websiteId, chartData }: AnalyticsChartProps) {
  const [data, setData] = useState<DeviceBreakdownData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      // If chartData is provided (from demo mode), use it to create device breakdown
      if (chartData && chartData.length > 0) {
        const demoDevices: DeviceBreakdownData[] = [
          { device: "Desktop", users: Math.round(2847 * 0.55), sessions: Math.round(4321 * 0.55), bounceRate: 28.5 },
          { device: "Mobile", users: Math.round(2847 * 0.35), sessions: Math.round(4321 * 0.35), bounceRate: 38.2 },
          { device: "Tablet", users: Math.round(2847 * 0.10), sessions: Math.round(4321 * 0.10), bounceRate: 32.1 },
        ];
        setData(demoDevices);
        setLoading(false);
        return;
      }

      if (!websiteId) {
        setError("No website ID provided");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/analytics/charts?websiteId=${websiteId}`);
        if (!response.ok) throw new Error("Failed to fetch chart data");
        const result = await response.json();
        
        setData(result.deviceBreakdown || []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [websiteId, chartData]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-purple-500" />
          <div>
            <CardTitle>Engagement by Device</CardTitle>
            <CardDescription>User metrics across device types</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-[300px]">
            <p className="text-gray-500">Loading chart data...</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-[300px]">
            <p className="text-red-500">{error}</p>
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[300px] gap-2">
            <Database className="h-12 w-12 text-gray-300" />
            <p className="text-gray-500">No data available</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="device" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="users"
                stroke="#3b82f6"
                name="Users"
                strokeWidth={2}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="sessions"
                stroke="#10b981"
                name="Sessions"
                strokeWidth={2}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="bounceRate"
                stroke="#ef4444"
                name="Bounce Rate (%)"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Main Analytics Charts Container
 * Displays all 4 charts in a responsive grid layout
 * Fetches real data from Google Analytics via the charts API
 */
export function AnalyticsCharts({ websiteId, chartData }: AnalyticsChartProps) {
  return (
    <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
      <VisitorTrendsChart websiteId={websiteId} chartData={chartData} />
      <TrafficSourcesChart websiteId={websiteId} chartData={chartData} />
      <ConversionPerformanceChart websiteId={websiteId} chartData={chartData} />
      <EngagementMetricsChart websiteId={websiteId} chartData={chartData} />
    </div>
  );
}
