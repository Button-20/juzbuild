import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;

    if (!jobId) {
      return NextResponse.json(
        { success: false, message: "Job ID is required" },
        { status: 400 }
      );
    }

    // Call background processor to get job status
    const backgroundProcessorUrl =
      process.env.BACKGROUND_PROCESSOR_URL || "http://localhost:3001";

    console.log(
      `Fetching job status for ${jobId} from ${backgroundProcessorUrl}`
    );

    try {
      const response = await fetch(
        `${backgroundProcessorUrl}/job-status/${jobId}`,
        {
          headers: {
            "x-processor-secret": process.env.BACKGROUND_PROCESSOR_SECRET || "",
          },
        }
      );

      console.log(`Background processor response status: ${response.status}`);

      if (response.ok) {
        const jobStatus = await response.json();
        return NextResponse.json({
          success: true,
          status: jobStatus,
        });
      } else {
        return NextResponse.json(
          {
            success: false,
            message: "Job not found or processor unavailable",
          },
          { status: 404 }
        );
      }
    } catch (processorError) {
      console.error("Background processor connection error:", processorError);
      return NextResponse.json(
        {
          success: false,
          message: "Unable to connect to deployment service",
        },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error("Job status API error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to get job status" },
      { status: 500 }
    );
  }
}
