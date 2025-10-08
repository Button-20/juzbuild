import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(req: NextRequest) {
  try {
    const backgroundProcessorUrl = process.env.BACKGROUND_PROCESSOR_URL || 'http://localhost:3001';
    
    const response = await axios.get(
      `${backgroundProcessorUrl}/health`,
      {
        timeout: 5000,
      }
    );

    return NextResponse.json({
      success: true,
      backgroundProcessor: {
        status: 'healthy',
        url: backgroundProcessorUrl,
        response: response.data,
      },
    });
    
  } catch (error) {
    console.error("Background processor health check failed:", error);
    
    return NextResponse.json(
      {
        success: false,
        backgroundProcessor: {
          status: 'unhealthy',
          url: process.env.BACKGROUND_PROCESSOR_URL || 'http://localhost:3001',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 503 }
    );
  }
}