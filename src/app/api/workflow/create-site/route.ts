import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const createSiteSchema = z.object({
  userId: z.string(),
  websiteName: z.string().min(2),
  userEmail: z.string().email(),
  fullName: z.string().min(2),
  companyName: z.string().min(2),
  domainName: z.string().min(3),
  logoUrl: z.string().url().optional(),
  brandColors: z.array(z.string()).length(4),
  tagline: z.string().min(2),
  aboutSection: z.string().min(10),
  selectedTheme: z.string(),
  propertyTypes: z.array(z.string()).min(1),
  includedPages: z.array(z.string()).min(1),
  preferredContactMethod: z.array(z.string()).min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = createSiteSchema.parse(body);

    console.log(`Starting website creation workflow for: ${data.websiteName}`);

    // Send to background processor
    try {
      const backgroundProcessorUrl =
        process.env.BACKGROUND_PROCESSOR_URL || "http://localhost:3001";
      const response = await fetch(
        `${backgroundProcessorUrl}/process-website-creation`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-processor-secret": process.env.BACKGROUND_PROCESSOR_SECRET || "",
          },
          body: JSON.stringify(data),
          signal: AbortSignal.timeout(10000), // 10 second timeout for the initial request
        }
      );

      const responseData = await response.json();

      if (responseData.success) {
        console.log(`Website creation job queued for: ${data.websiteName}`);

        return NextResponse.json({
          success: true,
          message: `Website creation started for ${data.websiteName}. You'll receive an email when it's ready.`,
          jobId: responseData.jobId,
          website: {
            name: data.websiteName,
            domain: `${data.domainName}.onjuzbuild.com`,
            status: "building",
            createdAt: new Date().toISOString(),
          },
        });
      } else {
        throw new Error(
          responseData.error || "Background processor rejected the request"
        );
      }
    } catch (error) {
      console.error("Failed to queue website creation job:", error);

      // If background processor is unavailable, return a meaningful error
      if (error instanceof TypeError && error.message.includes("fetch")) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Website creation service is temporarily unavailable. Please try again in a few minutes.",
            error: "Background processor unavailable",
          },
          { status: 503 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          message:
            "Failed to start website creation process. Please try again.",
          error: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Website creation API error:", error);

    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return NextResponse.json(
        {
          success: false,
          message: firstError.message,
          field: firstError.path[0],
          error: "Validation failed",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Website creation failed. Please try again.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json(
    { message: "Method not allowed. Use POST to create a website." },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { message: "Method not allowed. Use POST to create a website." },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { message: "Method not allowed. Use POST to create a website." },
    { status: 405 }
  );
}
