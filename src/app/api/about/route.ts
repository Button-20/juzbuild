import { verifyToken } from "@/lib/auth";
import { getCollection } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("auth-token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = decoded.userId;

    // Get user's website URL from the database
    const sitesCollection = await getCollection("sites");
    const site = await sitesCollection.findOne({
      userId: userId,
      status: "active",
    });

    if (!site) {
      return NextResponse.json(
        { error: "No active website found" },
        { status: 404 }
      );
    }

    // Use websiteUrl if available, otherwise construct from domain
    const websiteUrl = site.websiteUrl || `https://${site.domain}`;

    const response = await fetch(`${websiteUrl}/api/about`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching about page:", error);
    return NextResponse.json(
      { error: "Failed to fetch about page" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const token = req.cookies.get("auth-token")?.value;
    if (!token) {
      console.error("About PUT: No auth token found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      console.error("About PUT: Invalid token");
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = decoded.userId;
    console.log("About PUT: User ID:", userId);

    // Get user's website URL from the database
    const sitesCollection = await getCollection("sites");
    const site = await sitesCollection.findOne({
      userId: userId,
      status: "active",
    });

    console.log("About PUT: Site found:", site ? "Yes" : "No");
    if (site) {
      console.log("About PUT: Site domain:", site.domain);
      console.log("About PUT: Site websiteUrl:", site.websiteUrl);
    }

    if (!site) {
      return NextResponse.json(
        { error: "No active website found" },
        { status: 404 }
      );
    }

    // Use websiteUrl if available, otherwise construct from domain
    const websiteUrl = site.websiteUrl || `https://${site.domain}`;
    console.log("About PUT: Constructed websiteUrl:", websiteUrl);

    const body = await req.json();
    console.log("About PUT: Request body received");

    console.log("About PUT: Fetching to:", `${websiteUrl}/api/about`);
    const response = await fetch(`${websiteUrl}/api/about`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    console.log("About PUT: Response status:", response.status);
    const data = await response.json();
    console.log("About PUT: Response data:", data);

    return NextResponse.json(data);
  } catch (error) {
    console.error("About PUT: Error details:", error);
    console.error(
      "About PUT: Error message:",
      error instanceof Error ? error.message : String(error)
    );
    console.error(
      "About PUT: Error stack:",
      error instanceof Error ? error.stack : "No stack trace"
    );
    return NextResponse.json(
      {
        error: "Failed to update about page",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
