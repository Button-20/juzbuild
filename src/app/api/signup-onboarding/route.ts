import { isLive } from "@/constants";
import { createSession, hashPassword } from "@/lib/auth";
import { getCollection } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const onboardingSchema = z.object({
  // Step 1 - Account Setup
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phoneNumber: z.string().optional(),
  companyName: z.string().min(2, "Business name is required"),
  domainName: z
    .string()
    .min(3, "Domain name is required")
    .regex(
      /^[a-zA-Z0-9-]+$/,
      "Domain name can only contain letters, numbers, and hyphens"
    ),
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
  selectedTheme: z.string().min(1, "Please select a theme"),
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
  billingCycle: z.enum(["monthly", "yearly"]),
  agreeToTerms: z.boolean().optional(),
  paymentMethod: z
    .object({
      cardNumber: z.string().optional(),
      expiryDate: z.string().optional(),
      cvv: z.string().optional(),
      cardholderName: z.string().optional(),
    })
    .optional(),
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

    // Check if user already exists
    const usersCollection = await getCollection("users");
    const existingUser = await usersCollection.findOne({
      email: data.email.toLowerCase(),
    });

    if (existingUser) {
      return NextResponse.json(
        {
          message: "An account with this email already exists.",
          error: "User exists",
        },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(data.password);

    // Create user account
    try {
      const userData = {
        fullName: data.fullName,
        email: data.email.toLowerCase(),
        password: hashedPassword,
        companyName: data.companyName,
        domainName: data.domainName.toLowerCase(),
        country: data.country,
        city: data.city,
        tagline: data.tagline,
        aboutSection: data.aboutSection,
        selectedTheme: data.selectedTheme,
        selectedPlan: data.selectedPlan,
        billingCycle: data.billingCycle,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
      };

      const userResult = await usersCollection.insertOne(userData);
      const userId = userResult.insertedId.toString();

      // Save onboarding data to database
      const onboardingCollection = await getCollection("onboarding");
      const onboardingRecord = {
        ...data,
        userId: userId,
        password: hashedPassword, // Store hashed password
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

      // Create session for the new user
      const newUser = await usersCollection.findOne({
        _id: userResult.insertedId,
      });
      const session = createSession(newUser);

      // Trigger automated website creation workflow
      try {
        console.log(`Triggering website creation for user: ${userId}`);

        // Prepare website creation data
        const websiteData = {
          userId: userId,
          websiteName: data.domainName, // Using domain name as website name
          userEmail: data.email,
          fullName: data.fullName,
          companyName: data.companyName,
          domainName: data.domainName,
          brandColors: data.brandColors,
          tagline: data.tagline,
          aboutSection: data.aboutSection,
          selectedTheme: data.selectedTheme,
          propertyTypes: data.propertyTypes,
          includedPages: data.includedPages,
          preferredContactMethod: data.preferredContactMethod,
        };

        // Create website in background (fire and forget for better UX)
        // In production, consider using a queue system for reliability
        fetch(
          `${
            process.env.NEXTAUTH_URL || "http://localhost:3000"
          }/api/workflow/create-site`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(websiteData),
          }
        ).catch((error) => {
          console.error("Background website creation failed:", error);
          // In production, this should be logged and potentially retried
        });

        console.log(`Website creation initiated for: ${data.domainName}`);
      } catch (workflowError) {
        console.error(
          "Failed to trigger website creation workflow:",
          workflowError
        );
        // Don't fail the signup if website creation fails - user can retry later
      }

      const response = NextResponse.json({
        message:
          "Signup completed successfully! Your website is being created.",
        success: true,
        onboardingId: result.insertedId,
        userId: userId,
        token: session.token,
        user: session.user,
        next_steps: [
          "Your website is being generated",
          "You'll receive an email with login details",
          "Initial setup should complete within 5-10 minutes",
        ],
      });

      // Set HTTP-only cookie
      response.cookies.set("auth-token", session.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: "/",
      });

      return response;
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
