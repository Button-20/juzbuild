import connectDB from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

// Lead interface
interface Lead {
  intent: "buy" | "rent" | "sell";
  budget?: string;
  area?: string;
  propertyType?: string;
  contactInfo?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  preferredVisitTime?: string;
  timestamp: string;
  source: string;
}

export async function POST(request: NextRequest) {
  try {
    const leadData: Lead = await request.json();

    // Validate required fields
    if (!leadData.intent || !leadData.contactInfo?.name) {
      return NextResponse.json(
        { error: "Intent and contact name are required" },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // For now, we'll just log the lead (you can create a Lead model later)
    console.log("📋 New Lead Received:", {
      ...leadData,
      timestamp: new Date().toISOString(),
    });

    // In a real implementation, you would save to database:
    // const lead = new Lead(leadData);
    // await lead.save();

    // You could also integrate with CRM systems, send notifications, etc.

    return NextResponse.json({
      success: true,
      message: "Lead captured successfully",
      leadId: Date.now().toString(), // Generate a simple lead ID
    });
  } catch (error) {
    console.error("Lead capture error:", error);
    return NextResponse.json(
      { error: "Failed to capture lead" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // This could be used to retrieve leads for analytics
    return NextResponse.json({
      message: "Leads endpoint - Use POST to submit leads",
      example: {
        intent: "rent",
        budget: "$1500-2000",
        area: "downtown",
        propertyType: "apartment",
        contactInfo: {
          name: "John Doe",
          email: "john@example.com",
          phone: "555-123-4567",
        },
        preferredVisitTime: "weekends",
        source: "AI Chatbot",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to retrieve leads" },
      { status: 500 }
    );
  }
}
