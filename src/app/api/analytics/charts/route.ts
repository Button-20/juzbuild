import {
  fetchGA4Report,
  fetchGA4DailyTrends,
  fetchGA4TrafficSources,
  fetchGA4DeviceBreakdown,
} from "@/lib/google-analytics";
import { MongoClient, ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const websiteId = searchParams.get("websiteId");

    if (!websiteId) {
      return NextResponse.json(
        { error: "websiteId is required" },
        { status: 400 }
      );
    }

    // Get MongoDB connection
    const client = new MongoClient(
      process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/Juzbuild"
    );

    try {
      await client.connect();
      const db = client.db("Juzbuild");

      // Fetch website data
      const website = await db.collection("sites").findOne({
        _id: new ObjectId(websiteId),
      });

      if (!website) {
        return NextResponse.json(
          { error: "Website not found" },
          { status: 404 }
        );
      }

      // Fetch GA4 detailed metrics if property ID or measurement ID exists
      let chartData: any = {
        dailyTrends: [],
        trafficSources: [],
        deviceBreakdown: [],
      };

      if (website.ga4PropertyId) {
        try {
          // Fetch all detailed data in parallel
          const [dailyTrends, trafficSources, deviceBreakdown] =
            await Promise.all([
              fetchGA4DailyTrends(website.ga4PropertyId),
              fetchGA4TrafficSources(website.ga4PropertyId),
              fetchGA4DeviceBreakdown(website.ga4PropertyId),
            ]);

          chartData = {
            dailyTrends: dailyTrends,
            trafficSources: trafficSources,
            deviceBreakdown: deviceBreakdown,
          };
        } catch (error) {
          console.error("Failed to fetch detailed GA4 data:", error);
          // Continue without chart data
        }
      } else if (website.ga4MeasurementId) {
        try {
          // Fetch all detailed data in parallel
          const [dailyTrends, trafficSources, deviceBreakdown] =
            await Promise.all([
              fetchGA4DailyTrends(website.ga4MeasurementId),
              fetchGA4TrafficSources(website.ga4MeasurementId),
              fetchGA4DeviceBreakdown(website.ga4MeasurementId),
            ]);

          chartData = {
            dailyTrends: dailyTrends,
            trafficSources: trafficSources,
            deviceBreakdown: deviceBreakdown,
          };
        } catch (error) {
          console.error(
            "Failed to fetch detailed GA4 data: Measurement ID requires Property ID. Please update your site configuration.",
            error
          );
          // Continue without detailed data
        }
      }

      return NextResponse.json(chartData);
    } finally {
      await client.close();
    }
  } catch (error) {
    console.error("Analytics charts API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
