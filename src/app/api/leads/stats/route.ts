import { verifyToken } from "@/lib/auth";
import { getCollection } from "@/lib/mongodb";
import { LeadService } from "@/lib/services";
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

    // Get domain from query params (from website switcher)
    const domain = searchParams.get("domain");
    let websiteDatabaseName = null;

    if (domain) {
      // Get the specific website's database name by domain
      const websitesCollection = await getCollection("websites");
      const website = await websitesCollection.findOne({
        domainName: domain,
      });

      if (website) {
        websiteDatabaseName = website.dbName;
      }
    }

    // Fallback to user's profile domain if no specific website selected
    if (!websiteDatabaseName) {
      const usersCollection = await getCollection("users");
      const user = await usersCollection.findOne({ _id: userId });
      if (user && user.domainName) {
        const websiteName = user.domainName
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "");
        websiteDatabaseName = `juzbuild_${websiteName}`;
      } else {
        const emailPrefix = decoded.email
          ?.split("@")[0]
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "");
        websiteDatabaseName = `juzbuild_${emailPrefix}`;
      }
    }

    const stats = await LeadService.getStats(
      websiteDatabaseName ? undefined : userId,
      websiteDatabaseName || undefined
    );

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching lead stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch lead statistics" },
      { status: 500 }
    );
  }
}

export async function POST() {
  return NextResponse.json(
    { message: "Method not allowed. Use GET to fetch lead statistics." },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { message: "Method not allowed. Use GET to fetch lead statistics." },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { message: "Method not allowed. Use GET to fetch lead statistics." },
    { status: 405 }
  );
}
