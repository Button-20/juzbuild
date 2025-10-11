import { verifyToken } from "@/lib/auth";
import { getCollection } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // Verify authentication
    const token = req.cookies.get("auth-token")?.value;
    if (!token) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    const userId = decoded.userId;

    // Get user's sites
    const sitesCollection = await getCollection("sites");
    const userSites = await sitesCollection
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();

    // Get themes for display names
    const themesCollection = await getCollection("themes");
    const themes = await themesCollection.find({}).toArray();
    const themeMap = new Map(
      themes.map((theme: any) => [theme._id.toString(), theme.name])
    );

    // Transform the data for frontend consumption
    const sites = userSites.map((site: any) => ({
      id: site._id.toString(),
      websiteName: site.websiteName || site.websitename || site.companyName, // Handle both camelCase and lowercase
      companyName: site.companyName,
      domain: site.domain,
      status: site.status,
      theme: themeMap.get(site.theme) || site.theme, // Get theme name from map
      layoutStyle: site.layoutStyle,
      repoUrl: site.repoUrl,
      templatePath: site.templatePath,
      createdAt: site.createdAt,
      updatedAt: site.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      sites,
      count: sites.length,
    });
  } catch (error) {
    console.error("Error fetching user sites:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch sites",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const token = req.cookies.get("auth-token")?.value;
    if (!token) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    const body = await req.json();
    const { action, siteId, data } = body;

    const sitesCollection = await getCollection("sites");

    switch (action) {
      case "update-status":
        await sitesCollection.updateOne(
          { _id: siteId, userId: decoded.userId },
          {
            $set: {
              status: data.status,
              updatedAt: new Date(),
            },
          }
        );

        return NextResponse.json({
          success: true,
          message: "Site status updated successfully",
        });

      case "update-settings":
        await sitesCollection.updateOne(
          { _id: siteId, userId: decoded.userId },
          {
            $set: {
              ...data,
              updatedAt: new Date(),
            },
          }
        );

        return NextResponse.json({
          success: true,
          message: "Site settings updated successfully",
        });

      default:
        return NextResponse.json(
          { message: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error managing site:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to manage site",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Handle DELETE requests for site removal
export async function DELETE(req: NextRequest) {
  try {
    // Verify authentication
    const token = req.cookies.get("auth-token")?.value;
    if (!token) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const siteId = searchParams.get("siteId");

    if (!siteId) {
      return NextResponse.json(
        { message: "Site ID is required" },
        { status: 400 }
      );
    }

    const sitesCollection = await getCollection("sites");

    // Mark site as inactive instead of deleting
    await sitesCollection.updateOne(
      { _id: siteId, userId: decoded.userId },
      {
        $set: {
          status: "inactive",
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: "Site deactivated successfully",
    });
  } catch (error) {
    console.error("Error deactivating site:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to deactivate site",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
