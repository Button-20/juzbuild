import { verifyToken } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { domain } = await request.json();

    if (!domain || typeof domain !== "string") {
      return NextResponse.json(
        { error: "Domain is required" },
        { status: 400 }
      );
    }

    // Validate domain format
    const domainRegex =
      /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
    if (!domainRegex.test(domain)) {
      return NextResponse.json(
        { error: "Invalid domain format" },
        { status: 400 }
      );
    }

    // Call the background processor to check domain availability
    const backgroundProcessorUrl =
      process.env.BACKGROUND_PROCESSOR_URL || "http://localhost:3001";

    console.log(
      "Calling background processor:",
      `${backgroundProcessorUrl}/api/domain/check`
    );

    const response = await fetch(`${backgroundProcessorUrl}/api/domain/check`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.BACKGROUND_PROCESSOR_SECRET}`,
      },
      body: JSON.stringify({ domain }),
    });

    console.log("Background processor response status:", response.status);

    // Check if response is actually JSON
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      console.error(
        "Background processor returned non-JSON response:",
        text.substring(0, 200)
      );
      throw new Error(
        "Background processor is not responding correctly. Please ensure it is running on " +
          backgroundProcessorUrl
      );
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to check domain");
    }

    return NextResponse.json({
      success: true,
      result: data.result,
    });
  } catch (error) {
    console.error("Error checking domain:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to check domain",
      },
      { status: 500 }
    );
  }
}
