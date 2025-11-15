import { fetchGA4Report } from "@/lib/google-analytics";
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
      const website = await db.collection("websites").findOne({
        _id: new ObjectId(websiteId),
      });

      if (!website) {
        return NextResponse.json(
          { error: "Website not found" },
          { status: 404 }
        );
      }

      // Fetch theme name from themes collection
      const themesCollection = db.collection("themes");
      const theme = await themesCollection.findOne({
        _id: new ObjectId(website.theme),
      });
      const themeName = theme?.name || website.theme;

      // Fetch GA4 metrics if property ID or measurement ID exists
      let gaMetrics: any = null;
      if (website.analytics?.googleAnalytics?.propertyId) {
        try {
          gaMetrics = await fetchGA4Report(website.analytics.googleAnalytics.propertyId);
        } catch (error) {
          console.error("Failed to fetch GA4 metrics:", error);
          // Continue without GA metrics
        }
      } else if (website.analytics?.googleAnalytics?.measurementId) {
        try {
          gaMetrics = await fetchGA4Report(website.analytics.googleAnalytics.measurementId);
        } catch (error) {
          console.error(
            "Failed to fetch GA4 metrics: Measurement ID requires Property ID. Please update your site configuration.",
            error
          );
          // Continue without GA metrics
        }
      }

      // Fetch local metrics from the website's database
      const siteDb = client.db(website.dbName);

      // Get contact submissions
      const contacts = await siteDb.collection("contacts").find({}).toArray();

      // Get properties
      const properties = await siteDb
        .collection("properties")
        .find({})
        .toArray();

      // Get testimonials
      const testimonials = await siteDb
        .collection("testimonials")
        .find({})
        .toArray();

      // Get pages
      const pages = await siteDb.collection("pages").find({}).toArray();

      // Get blog posts
      const blogPosts = await siteDb.collection("blog").find({}).toArray();

      // Calculate derived metrics
      const totalLeads = contacts.length;
      const propertiesWithInquiries = contacts.reduce(
        (acc: any, contact: any) => {
          if (contact.propertyId) {
            return acc.includes(contact.propertyId)
              ? acc
              : [...acc, contact.propertyId];
          }
          return acc;
        },
        []
      );

      const conversionRate = gaMetrics
        ? (
            (gaMetrics.totalConversions / (gaMetrics.sessions || 1)) *
            100
          ).toFixed(2)
        : 0;

      const analytics = {
        website: {
          id: website._id,
          name: website.websiteName,
          company: website.companyName,
          domain: website.domain,
          theme: themeName,
          status: website.status,
          createdAt: website.createdAt,
        },
        googleAnalytics: {
          measurementId: website.analytics?.googleAnalytics?.measurementId || null,
          propertyId: website.analytics?.googleAnalytics?.propertyId || null,
          ...(gaMetrics && {
            metrics: {
              users: gaMetrics.users,
              newUsers: gaMetrics.newUsers,
              sessions: gaMetrics.sessions,
              bounceRate: (gaMetrics.bounceRate || 0).toFixed(2),
              pageviews: gaMetrics.pageviews,
              avgSessionDuration: (gaMetrics.avgSessionDuration || 0).toFixed(
                2
              ),
              conversions: gaMetrics.totalConversions,
              conversionRate: parseFloat(conversionRate as string),
            },
          }),
        },
        content: {
          pages: pages.length,
          blogPosts: blogPosts.length,
          properties: properties.length,
          testimonials: testimonials.length,
        },
        leads: {
          total: totalLeads,
          propertiesWithInquiries: propertiesWithInquiries.length,
          recentContacts: contacts.slice(-5).reverse(),
        },
        performance: {
          totalVisitors: gaMetrics?.users || 0,
          totalPageviews: gaMetrics?.pageviews || 0,
          averageSessionDuration: gaMetrics?.avgSessionDuration || 0,
          bounceRate: gaMetrics?.bounceRate || 0,
          conversionRate: parseFloat(conversionRate as string),
        },
        summary: {
          lastUpdated: new Date().toISOString(),
          healthScore: calculateHealthScore(
            properties.length,
            testimonials.length,
            contacts.length,
            gaMetrics
          ),
        },
      };

      return NextResponse.json(analytics);
    } finally {
      await client.close();
    }
  } catch (error) {
    console.error("Analytics API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}

function calculateHealthScore(
  properties: number,
  testimonials: number,
  contacts: number,
  gaMetrics: any
): number {
  let score = 50; // Base score

  // Content score (0-20)
  if (properties > 10) score += 10;
  else if (properties > 5) score += 7;
  else if (properties > 0) score += 4;

  if (testimonials > 5) score += 5;
  else if (testimonials > 0) score += 3;

  // Engagement score (0-20)
  if (gaMetrics) {
    if (gaMetrics.users > 100) score += 10;
    else if (gaMetrics.users > 50) score += 6;
    else if (gaMetrics.users > 0) score += 3;

    if (gaMetrics.pageviews > 200) score += 5;
    else if (gaMetrics.pageviews > 100) score += 3;
    else if (gaMetrics.pageviews > 0) score += 1;

    if (gaMetrics.totalConversions > 5) score += 5;
    else if (gaMetrics.totalConversions > 0) score += 2;
  }

  // Lead generation score (0-10)
  if (contacts > 20) score += 10;
  else if (contacts > 10) score += 7;
  else if (contacts > 5) score += 4;
  else if (contacts > 0) score += 2;

  return Math.min(score, 100);
}
