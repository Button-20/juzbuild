import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, message, propertyName, propertyUrl } = body;

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Log the contact form submission
    console.log("===== NEW CONTACT FORM SUBMISSION =====");
    console.log("Time:", new Date().toLocaleString());
    console.log("Name:", name);
    console.log("Email:", email);
    if (phone) console.log("Phone:", phone);
    if (propertyName) {
      console.log("Property Inquiry:", propertyName);
      if (propertyUrl) console.log("Property URL:", propertyUrl);
    }
    console.log("Message:", message);
    console.log("========================================");

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Your message has been received! We'll get back to you soon.",
    });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to send message. Please try again." },
      { status: 500 }
    );
  }
}
