import { verifyToken } from "@/lib/auth";
import { getCollection } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = decoded.userId;

    // Get user's active website
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

    const domain = site.customDomain || site.domain;
    const isCustomDomain = !!site.customDomain;

    return NextResponse.json({
      success: true,
      domain: {
        domain,
        isCustomDomain,
      },
    });
  } catch (error) {
    console.error("Error fetching current domain:", error);
    return NextResponse.json(
      { error: "Failed to fetch current domain" },
      { status: 500 }
    );
  }
}
