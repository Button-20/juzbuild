import { verifyToken } from "@/lib/auth";
import { getCollection } from "@/lib/mongodb";
import { PropertyService } from "@/lib/services";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get("auth-token")?.value;
    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = decoded.userId;
    const { searchParams } = new URL(request.url);
    const websiteId = searchParams.get("websiteId");

    let websiteDatabaseName: string;

    if (websiteId) {
      // Get website database name from websites collection
      const websitesCollection = await getCollection("websites");
      const { ObjectId } = require("mongodb");
      const website = await websitesCollection.findOne({
        _id: new ObjectId(websiteId),
        userId: userId,
      });

      if (!website) {
        return NextResponse.json(
          { error: "Website not found" },
          { status: 404 }
        );
      }

      websiteDatabaseName = website.dbName;
    } else {
      // Fallback to user's domain
      let domain = searchParams.get("domain");
      if (!domain) {
        const usersCollection = await getCollection("users");
        const user = await usersCollection.findOne({ _id: userId });
        if (user && user.domainName) {
          domain = user.domainName + ".juzbuild.com";
        } else {
          // Fallback to email-based domain
          domain = decoded.email?.split("@")[0] + ".juzbuild.com";
        }
      }

      if (!domain) {
        return NextResponse.json(
          { error: "Domain is required" },
          { status: 400 }
        );
      }

      websiteDatabaseName = domain;
    }

    // Get property statistics
    const stats = await PropertyService.getStats(
      userId,
      websiteDatabaseName,
      websiteId ? websiteDatabaseName : undefined
    );

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching property stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch property stats" },
      { status: 500 }
    );
  }
}
