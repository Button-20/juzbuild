import { websiteCreationService } from "@/lib/website-creation-service";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const createSiteSchema = z.object({
  userId: z.string(),
  websiteName: z.string().min(2),
  userEmail: z.string().email(),
  fullName: z.string().min(2),
  companyName: z.string().min(2),
  domainName: z.string().min(3),
  brandColors: z.array(z.string()).max(3),
  tagline: z.string().min(2),
  aboutSection: z.string().min(10),
  selectedTheme: z.string(),
  layoutStyle: z.string(),
  propertyTypes: z.array(z.string()).min(1),
  includedPages: z.array(z.string()).min(1),
  preferredContactMethod: z.array(z.string()).min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = createSiteSchema.parse(body);

    console.log(`Starting website creation workflow for: ${data.websiteName}`);

    // Execute the automated workflow
    const result = await websiteCreationService.createWebsite(data);

    if (!result.success) {
      console.error(
        `Website creation failed at step: ${result.step}`,
        result.error
      );
      return NextResponse.json(
        {
          success: false,
          message: `Website creation failed: ${result.error}`,
          step: result.step,
          error: result.error,
        },
        { status: 500 }
      );
    }

    console.log(`Website creation completed for: ${data.websiteName}`);

    return NextResponse.json({
      success: true,
      message: `Website ${data.websiteName} created successfully!`,
      data: result.data,
      website: {
        name: data.websiteName,
        domain: `${data.domainName}.juzbuild.com`,
        status: "active",
        createdAt: new Date().toISOString(),
      },
    });
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
