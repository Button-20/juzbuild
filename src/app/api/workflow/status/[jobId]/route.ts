import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(
  req: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const { jobId } = params;
    
    if (!jobId) {
      return NextResponse.json(
        { success: false, error: "Job ID is required" },
        { status: 400 }
      );
    }

    const backgroundProcessorUrl = process.env.BACKGROUND_PROCESSOR_URL || 'http://localhost:3001';
    
    const response = await axios.get(
      `${backgroundProcessorUrl}/job-status/${jobId}`,
      {
        headers: {
          'x-processor-secret': process.env.BACKGROUND_PROCESSOR_SECRET,
        },
        timeout: 5000,
      }
    );

    return NextResponse.json(response.data);
    
  } catch (error) {
    console.error("Failed to get job status:", error);
    
    if (axios.isAxiosError(error) && (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Background processor unavailable',
        },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}