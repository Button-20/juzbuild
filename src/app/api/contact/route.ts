import { getCollection } from "@/lib";
import { sendContactEmail } from "@/lib/email";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const contactSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  email: z
    .string()
    .email("Please enter a valid email address")
    .max(100, "Email must be less than 100 characters"),
  phone: z
    .string()
    .max(20, "Phone number must be less than 20 characters")
    .optional()
    .or(z.literal("")),
  company: z
    .string()
    .max(100, "Company name must be less than 100 characters")
    .optional()
    .or(z.literal("")),
  subject: z
    .string()
    .min(2, "Subject must be at least 2 characters")
    .max(100, "Subject must be less than 100 characters"),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(1000, "Message must be less than 1000 characters"),
});

export async function POST(req: NextRequest) {
  try {
    // Parse and validate request body
    const body = await req.json();
    const data = contactSchema.parse(body);

    // Save contact to database
    try {
      const contactCollection = await getCollection("contacts");
      const contactRecord = {
        ...data,
        createdAt: new Date(),
        ipAddress:
          req.headers.get("x-forwarded-for") ||
          req.headers.get("x-real-ip") ||
          "unknown",
        userAgent: req.headers.get("user-agent") || "unknown",
        status: "new",
      };

      const result = await contactCollection.insertOne(contactRecord);
    } catch (dbError) {
      // Continue with email sending even if database fails
    }

    // Send email notifications
    try {
      await sendContactEmail(data);
    } catch (emailError) {
      // Return error if email fails since it's the primary functionality
      return NextResponse.json(
        {
          message:
            "Your message was saved but we couldn't send the confirmation email. We'll still respond to your inquiry.",
          error: "Email delivery issue",
        },
        { status: 202 } // Accepted but with issues
      );
    }

    return NextResponse.json({
      message:
        "Thank you for your message! We've received your inquiry and will get back to you within 24 hours.",
      success: true,
    });
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
          "We're sorry, but something went wrong. Please try again later or contact us directly.",
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { message: "Method not allowed. Please use POST to submit contact forms." },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { message: "Method not allowed. Please use POST to submit contact forms." },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { message: "Method not allowed. Please use POST to submit contact forms." },
    { status: 405 }
  );
}
