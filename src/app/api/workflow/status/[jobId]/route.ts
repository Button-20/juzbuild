import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;

    if (!jobId) {
      return NextResponse.json(
        { success: false, error: "Job ID is required" },
        { status: 400 }
      );
    }

    const backgroundProcessorUrl =
      process.env.BACKGROUND_PROCESSOR_URL || "http://localhost:3001";

    const response = await fetch(
      `${backgroundProcessorUrl}/job-status/${jobId}`,
      {
        method: "GET",
        headers: {
          "x-processor-secret": process.env.BACKGROUND_PROCESSOR_SECRET || "",
        },
        signal: AbortSignal.timeout(5000),
      }
    );

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to get job status:", error);

    if (error instanceof TypeError && error.message.includes("fetch")) {
      return NextResponse.json(
        {
          success: false,
          error: "Background processor unavailable",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
