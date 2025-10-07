import { getEmailConfig, sendEmail, validateEmailConfig } from "@/lib/email";
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

    // Get email configuration from environment variables
    const emailConfig = getEmailConfig();

    // Create email content
    const emailContent = {
      to: emailConfig.to,
      from: emailConfig.from,
      subject: propertyName
        ? `Property Inquiry: ${propertyName}`
        : "New Contact Form Submission",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
            ${propertyName ? "Property Inquiry" : "New Contact Form Submission"}
          </h2>
          
          <div style="margin: 20px 0;">
            <h3 style="color: #374151;">Contact Information:</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            ${
              phone
                ? `<p><strong>Phone:</strong> <a href="tel:${phone}">${phone}</a></p>`
                : ""
            }
          </div>

          ${
            propertyName
              ? `
            <div style="margin: 20px 0; padding: 15px; background-color: #f3f4f6; border-radius: 8px;">
              <h3 style="color: #374151;">Property Details:</h3>
              <p><strong>Property:</strong> ${propertyName}</p>
              ${
                propertyUrl
                  ? `<p><strong>Property URL:</strong> <a href="${propertyUrl}">${propertyUrl}</a></p>`
                  : ""
              }
            </div>
          `
              : ""
          }

          <div style="margin: 20px 0;">
            <h3 style="color: #374151;">Message:</h3>
            <div style="padding: 15px; background-color: #f9fafb; border-left: 4px solid #2563eb; border-radius: 4px;">
              <p style="white-space: pre-wrap;">${message}</p>
            </div>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
            <p>This email was sent from your real estate website contact form.</p>
            <p>Time: ${new Date().toLocaleString()}</p>
          </div>
        </div>
      `,
    };

    // Try to send the email using nodemailer
    try {
      // Validate email configuration first
      validateEmailConfig();

      // Send the email
      const emailSent = await sendEmail(emailContent);

      if (emailSent) {
        return NextResponse.json({
          success: true,
          message:
            "Your message has been sent successfully! We'll get back to you soon.",
        });
      } else {
        throw new Error("Failed to send email");
      }
    } catch (emailError) {
      console.error("Email sending error:", emailError);

      // Check if it's a configuration error
      if (
        emailError instanceof Error &&
        emailError.message.includes("Missing email configuration")
      ) {
        console.log("Email configuration missing, falling back to console log");
        console.log("Email would be sent with content:", emailContent);

        return NextResponse.json({
          success: true,
          message:
            "Your message has been received! We'll get back to you soon. (Email service not configured)",
        });
      }

      // For other email errors, still return success to user but log the error
      console.log(
        "Email failed to send, but returning success to user:",
        emailError
      );
      return NextResponse.json({
        success: true,
        message: "Your message has been received! We'll get back to you soon.",
      });
    }
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to send message. Please try again." },
      { status: 500 }
    );
  }
}
