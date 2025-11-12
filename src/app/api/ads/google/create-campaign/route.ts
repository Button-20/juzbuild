/**
 * POST /api/ads/google/create-campaign
 * Create a sample Google Ads campaign in the user's account
 */

import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";
import { getUserFromRequest } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const userPayload = getUserFromRequest(request);
    if (!userPayload) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Get user's Google Ads tokens from database
    const onboardingCollection = await getCollection("onboarding");
    const onboarding = await onboardingCollection.findOne({
      userId: userPayload.userId,
    });

    if (!onboarding?.googleAdsAccessToken) {
      return NextResponse.json(
        { message: "Google Ads not connected" },
        { status: 400 }
      );
    }

    const accessToken = onboarding.googleAdsAccessToken;
    const developerId = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;

    if (!developerId) {
      console.warn("Google Ads developer token not configured");
      return NextResponse.json(
        {
          message:
            "Developer token not configured. Contact admin to enable Google Ads features.",
          missingToken: true,
        },
        { status: 400 }
      );
    }

    // Try to get customer accounts first
    try {
      const customersResponse = await fetch(
        `https://googleads.googleapis.com/v17/customers:listAccessibleCustomers`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            "developer-token": developerId,
          },
        }
      );

      if (!customersResponse.ok) {
        const error = await customersResponse.text();
        console.error("Failed to get customers:", error);
        return NextResponse.json(
          {
            message: "Failed to access Google Ads account",
            details: error,
          },
          { status: 400 }
        );
      }

      const customersData = await customersResponse.json();
      const customerIds = (customersData.resourceNames || []).map(
        (name: string) => name.replace("customers/", "")
      );

      if (customerIds.length === 0) {
        return NextResponse.json(
          {
            message: "No Google Ads customer accounts found",
          },
          { status: 400 }
        );
      }

      const customerId = customerIds[0];

      // Update the user's record with the actual customer ID
      await onboardingCollection.updateOne(
        { userId: userPayload.userId },
        {
          $set: {
            googleAdsCustomerId: customerId,
            googleAdsAccountLinked: true,
            updatedAt: new Date(),
          },
        }
      );

      return NextResponse.json({
        message: "Successfully linked Google Ads account",
        customerId: customerId,
        accountLinked: true,
      });
    } catch (error) {
      console.error("Error linking Google Ads account:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return NextResponse.json(
        {
          message: "Failed to link Google Ads account",
          error: errorMessage,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in create campaign:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { message: "Failed to create campaign", error: errorMessage },
      { status: 500 }
    );
  }
}
