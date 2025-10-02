import { isLive } from "@/constants";
import { getCollection } from "@/lib";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const onboardingSchema = z.object({
  // Step 1 - Account Setup
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phoneNumber: z.string().optional(),
  companyName: z.string().min(2, "Business name is required"),
  country: z.string().min(2, "Country is required"),
  city: z.string().min(2, "City is required"),

  // Step 2 - Business Profile
  brandColors: z.array(z.string()).max(3, "Maximum 3 colors allowed"),
  tagline: z.string().min(2, "Tagline is required"),
  aboutSection: z.string().min(10, "About section is required"),

  // Step 3 - Website Setup
  propertyTypes: z
    .array(z.string())
    .min(1, "Select at least one property type"),
  layoutStyle: z.enum(["Classic", "Modern", "Minimal"]),
  includedPages: z.array(z.string()).min(1, "Select at least one page"),
  leadCapturePreference: z
    .array(z.enum(["Contact Form", "WhatsApp", "Email Only"]))
    .min(1, "Select at least one lead capture method"),

  // Step 4 - Marketing Setup
  adsConnections: z
    .array(z.string())
    .min(1, "Select at least one ads connection"),
  preferredContactMethod: z
    .array(z.enum(["Phone", "Email", "WhatsApp"]))
    .min(1, "Select at least one contact method"),

  // Step 5 - Payment
  selectedPlan: z.enum(["starter", "pro", "agency"]),
  billingCycle: z.enum(["monthly", "annually"]),
  paymentMethod: z.enum(["card", "paypal"]),
});

export async function POST(req: NextRequest) {
  // Check if the app is live
  if (!isLive) {
    return NextResponse.json(
      {
        message: "Service temporarily unavailable. Please join our waitlist.",
        error: "Service not live",
      },
      { status: 503 }
    );
  }

  try {
    // Parse and validate request body
    const body = await req.json();
    const data = onboardingSchema.parse(body);

    // Additional validations can be added here if needed

    // Save onboarding data to database
    try {
      const onboardingCollection = await getCollection("onboarding");
      const onboardingRecord = {
        ...data,
        createdAt: new Date(),
        ipAddress:
          req.headers.get("x-forwarded-for") ||
          req.headers.get("x-real-ip") ||
          "unknown",
        userAgent: req.headers.get("user-agent") || "unknown",
        status: "completed",
        websiteStatus: "pending", // Will be updated when website is created
      };

      const result = await onboardingCollection.insertOne(onboardingRecord);

      // TODO: Trigger website creation process here
      // This could involve:
      // 1. Creating website structure
      // 2. Setting up database collections for the user
      // 3. Generating initial pages
      // 4. Setting up user account
      // 5. Sending welcome email

      return NextResponse.json({
        message:
          "Signup completed successfully! Your website is being created.",
        success: true,
        onboardingId: result.insertedId,
        next_steps: [
          "Your website is being generated",
          "You'll receive an email with login details",
          "Initial setup should complete within 5-10 minutes",
        ],
      });
    } catch (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json(
        {
          message: "Failed to save signup data. Please try again.",
          error: "Database error",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return NextResponse.json(
        {
          message: firstError.message,
          field: firstError.path[0],
          error: "Validation failed",
        },
        { status: 400 }
      );
    }

    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          message:
            "Invalid request format. Please check your data and try again.",
          error: "Invalid JSON",
        },
        { status: 400 }
      );
    }

    // Handle other errors
    return NextResponse.json(
      {
        message:
          "We're sorry, but something went wrong. Please try again later.",
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { message: "Method not allowed. Please use POST to submit signup data." },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { message: "Method not allowed. Please use POST to submit signup data." },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { message: "Method not allowed. Please use POST to submit signup data." },
    { status: 405 }
  );
}
