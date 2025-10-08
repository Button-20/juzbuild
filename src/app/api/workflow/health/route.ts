import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const backgroundProcessorUrl =
      process.env.BACKGROUND_PROCESSOR_URL || "http://localhost:3001";

    const response = await fetch(`${backgroundProcessorUrl}/health`, {
      method: "GET",
      signal: AbortSignal.timeout(5000),
    });

    const data = await response.json();

    return NextResponse.json({
      success: true,
      backgroundProcessor: {
        status: "healthy",
        url: backgroundProcessorUrl,
        response: data,
      },
    });
  } catch (error) {
    console.error("Background processor health check failed:", error);

    return NextResponse.json(
      {
        success: false,
        backgroundProcessor: {
          status: "unhealthy",
          url: process.env.BACKGROUND_PROCESSOR_URL || "http://localhost:3001",
          error: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 503 }
    );
  }
}
