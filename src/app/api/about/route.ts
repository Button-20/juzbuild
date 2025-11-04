import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = req.cookies.get("auth-token");
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's website URL from the session/database
    // For now, we'll need to implement getting the website URL
    const websiteUrl =
      process.env.NEXT_PUBLIC_USER_WEBSITE_URL || "http://localhost:3000";

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
    const session = req.cookies.get("auth-token");
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const websiteUrl =
      process.env.NEXT_PUBLIC_USER_WEBSITE_URL || "http://localhost:3000";

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
