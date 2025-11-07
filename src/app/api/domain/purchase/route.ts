import { verifyToken } from "@/lib/auth";
import { getCollection } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

/**
 * Format phone number to Namecheap format: +NNN.NNNNNNNNNN
 * @param phone - Phone number in any format
 * @returns Formatted phone number
 */
function formatPhoneNumber(phone?: string): string {
  if (!phone) return "+1.0000000000";

  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, "");

  // If it starts with +, use it; otherwise add +1
  let formatted = cleaned.startsWith("+") ? cleaned : `+1${cleaned}`;

  // Extract country code and number
  const match = formatted.match(/^\+(\d{1,3})(.+)$/);
  if (match) {
    const countryCode = match[1];
    const number = match[2];
    // Format as +countrycode.number
    return `+${countryCode}.${number}`;
  }

  // Fallback to default if parsing fails
  return "+1.0000000000";
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = decoded.userId;
    const { domain } = await request.json();

    if (!domain || typeof domain !== "string") {
      return NextResponse.json(
        { error: "Domain is required" },
        { status: 400 }
      );
    }

    // Get user's active website
    const sitesCollection = await getCollection("sites");
    const site = await sitesCollection.findOne({
      userId: userId,
      status: "active",
    });

    if (!site) {
      return NextResponse.json(
        { error: "No active website found" },
        { status: 404 }
      );
    }

    // Get user information for domain registration
    const usersCollection = await getCollection("users");
    const { ObjectId } = require("mongodb");
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prepare website URL (use domain or construct from site data)
    const websiteUrl = site.vercelUrl || site.url || `https://${site.domain}`;

    console.log("Preparing domain purchase request:", {
      domain,
      userId,
      siteId: site._id,
      websiteUrl,
      hasUserInfo: !!user,
    });

    // Call the background processor to purchase domain
    const backgroundProcessorUrl =
      process.env.BACKGROUND_PROCESSOR_URL || "http://localhost:3001";

    const response = await fetch(
      `${backgroundProcessorUrl}/api/domain/purchase`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.BACKGROUND_PROCESSOR_SECRET}`,
        },
        body: JSON.stringify({
          domain,
          userId,
          siteId: site._id.toString(),
          websiteUrl,
          userInfo: {
            firstName: user.firstName || user.fullName?.split(" ")[0] || "User",
            lastName:
              user.lastName ||
              user.fullName?.split(" ").slice(1).join(" ") ||
              "Name",
            email: user.email,
            phone: formatPhoneNumber(user.phoneNumber || user.phone),
            address: user.address || "123 Main St",
            city: user.city || "City",
            state: user.state || "State",
            zip: user.zip || user.zipCode || "00000",
            country: user.country || "US",
            organization:
              user.companyName ||
              `${user.firstName || "User"} ${user.lastName || "Name"}`,
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to purchase domain");
    }

    // Update the site record with the custom domain
    await sitesCollection.updateOne(
      { _id: site._id },
      {
        $set: {
          customDomain: domain,
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: "Domain purchased successfully",
      domain,
    });
  } catch (error) {
    console.error("Error purchasing domain:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to purchase domain",
      },
      { status: 500 }
    );
  }
}
