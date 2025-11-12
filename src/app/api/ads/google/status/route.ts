/**
 * GET /api/ads/google/status
 * Fetch user's Google Ads connection status from database
 */

import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // Get user from request
    const userPayload = getUserFromRequest(request);
    if (!userPayload) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Fetch user's onboarding record
    const onboardingCollection = await getCollection("onboarding");
    const onboarding = await onboardingCollection.findOne({
      userId: userPayload.userId,
    });

    if (!onboarding) {
      return NextResponse.json({
        isConnected: false,
        accountId: "",
      });
    }

    return NextResponse.json({
      isConnected: onboarding.googleAdsEnabled || false,
      accountId: onboarding.googleAdsCustomerId || "",
      accessToken: onboarding.googleAdsAccessToken ? true : false,
      refreshToken: onboarding.googleAdsRefreshToken ? true : false,
    });
  } catch (error) {
    console.error("Failed to fetch Google Ads status:", error);
    return NextResponse.json(
      { message: "Failed to fetch status" },
      { status: 500 }
    );
  }
}
