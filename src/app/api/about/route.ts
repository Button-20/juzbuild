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
      status: "active"
    });

    if (!site || !site.websiteUrl) {
      return NextResponse.json(
        { error: "No active website found" },
        { status: 404 }
      );
    }

    const websiteUrl = site.websiteUrl;

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
      status: "active"
    });

    if (!site || !site.websiteUrl) {
      return NextResponse.json(
        { error: "No active website found" },
        { status: 404 }
      );
    }

    const websiteUrl = site.websiteUrl;
    const body = await req.json();

    const response = await fetch(`${websiteUrl}/api/about`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating about page:", error);
    return NextResponse.json(
      { error: "Failed to update about page" },
      { status: 500 }
    );
  }
}
