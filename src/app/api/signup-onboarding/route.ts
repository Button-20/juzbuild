import { isLive } from "@/constants";
import { createSession, hashPassword } from "@/lib/auth";
import { getCollection } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// User profile schema - fields that get stored in users collection
const userProfileSchema = z.object({
  // Step 1 - Account Setup
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email is required").toLowerCase(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phoneNumber: z.string().min(10, "Phone number is required"),
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
  tagline: z.string().min(2, "Tagline is required"),
  aboutSection: z.string().min(10, "About section is required"),

  // Contact Information (optional)
  supportEmail: z
    .string()
    .email("Valid email is required")
    .optional()
    .or(z.literal("")),
  whatsappNumber: z.string().optional(),
  address: z.string().optional(),

  // Social Media Links (optional)
  facebookUrl: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
  twitterUrl: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
  instagramUrl: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
  linkedinUrl: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
  youtubeUrl: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),

  // Step 3 - Website Setup
  selectedTheme: z.string().min(1, "Please select a theme"),

  // Step 5 - Payment
  selectedPlan: z.enum(["starter", "pro", "agency"]),
  billingCycle: z.enum(["monthly", "yearly"]),
});

// Onboarding-specific schema - fields that get stored in onboarding collection
const onboardingSpecificSchema = z.object({
  // Step 2 - Business Profile
  logoUrl: z.string().optional(), // Cloudinary URL for uploaded logo
  brandColors: z
    .array(z.string())
    .length(4, "Color palette must contain exactly 4 colors"),

  // Step 3 - Website Setup
  propertyTypes: z
    .array(z.string())
    .min(1, "Select at least one property type"),
  includedPages: z.array(z.string()).min(1, "Select at least one page"),
  leadCaptureMethods: z
    .array(z.enum(["AI Chatbot", "Contact Form", "Inquiry Form"]))
    .min(1, "Select at least one lead capture method"),
  geminiApiKey: z.string().optional(),

  // Step 4 - Marketing Setup
  adsConnections: z
    .array(z.string())
    .min(1, "Select at least one ads connection"),
  preferredContactMethod: z
    .array(z.enum(["Phone", "Email", "WhatsApp"]))
    .min(1, "Select at least one contact method"),

  // Step 5 - Payment & Legal
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

// Complete onboarding schema combining both
const onboardingSchema = userProfileSchema.merge(onboardingSpecificSchema);

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

    // Create user account with only user profile data
    try {
      const userData = {
        fullName: data.fullName,
        email: data.email.toLowerCase(),
        password: hashedPassword,
        phoneNumber: data.phoneNumber,
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

      // Save onboarding-specific data to database (not user profile data which is already in users collection)
      const onboardingCollection = await getCollection("onboarding");
      const onboardingRecord = {
        userId: userId,
        // Only onboarding-specific fields (not duplicated in users collection)
        logoUrl: data.logoUrl,
        brandColors: data.brandColors,
        propertyTypes: data.propertyTypes,
        includedPages: data.includedPages,
        leadCaptureMethods: data.leadCaptureMethods,
        geminiApiKey: data.geminiApiKey,
        adsConnections: data.adsConnections,
        preferredContactMethod: data.preferredContactMethod,
        agreeToTerms: data.agreeToTerms,
        paymentMethod: data.paymentMethod,
        // Onboarding metadata
        createdAt: new Date(),
        ipAddress:
          req.headers.get("x-forwarded-for") ||
          req.headers.get("x-real-ip") ||
          "unknown",
        userAgent: req.headers.get("user-agent") || "unknown",
        status: "completed",
      };

      const result = await onboardingCollection.insertOne(onboardingRecord);

      // Create session for the new user
      const newUser = await usersCollection.findOne({
        _id: userResult.insertedId,
      });
      const session = createSession(newUser);

      // Trigger automated website creation workflow
      let websiteJobId = null; // Declare jobId in wider scope
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
          logoUrl: data.logoUrl,
          brandColors: data.brandColors,
          tagline: data.tagline,
          aboutSection: data.aboutSection,
          selectedTheme: data.selectedTheme,
          propertyTypes: data.propertyTypes,
          includedPages: data.includedPages,
          preferredContactMethod: data.preferredContactMethod,
          leadCaptureMethods: data.leadCaptureMethods,
          geminiApiKey: data.geminiApiKey,

          // Contact Information
          phoneNumber: data.phoneNumber,
          supportEmail: data.supportEmail,
          whatsappNumber: data.whatsappNumber,
          address: data.address,

          // Social Media Links
          facebookUrl: data.facebookUrl,
          twitterUrl: data.twitterUrl,
          instagramUrl: data.instagramUrl,
          linkedinUrl: data.linkedinUrl,
          youtubeUrl: data.youtubeUrl,
        };

        // Create website and get jobId for tracking
        try {
          const websiteResponse = await fetch(
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
          );

          if (websiteResponse.ok) {
            const websiteResult = await websiteResponse.json();
            websiteJobId = websiteResult.jobId;
            console.log(
              `Website creation initiated for: ${data.domainName} with jobId: ${websiteJobId}`
            );
          } else {
            console.error(
              "Website creation request failed:",
              await websiteResponse.text()
            );
          }
        } catch (error) {
          console.error("Background website creation failed:", error);
          // Don't fail the signup if website creation fails - user can retry later
        }
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
        jobId: websiteJobId, // Include jobId for deployment tracking
        websiteData: {
          domainName: data.domainName,
          companyName: data.companyName,
          selectedTheme: data.selectedTheme,
        },
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
    } catch (dbError: any) {
      console.error("Database error:", dbError);

      // Handle MongoDB duplicate key error (unique constraint violation)
      if (dbError.code === 11000) {
        // Check if it's an email duplicate
        if (dbError.message && dbError.message.includes("email")) {
          return NextResponse.json(
            {
              message: "An account with this email already exists.",
              error: "Duplicate email",
              field: "email",
            },
            { status: 409 }
          );
        }

        // Handle other duplicate key errors
        return NextResponse.json(
          {
            message:
              "This information is already in use. Please try different values.",
            error: "Duplicate data",
          },
          { status: 409 }
        );
      }

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
