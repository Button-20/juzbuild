/**
 * POST /api/ads/disconnect
 * Disconnect an ads platform integration
 */

import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";
import { getUserFromRequest } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { platform } = body;

    if (!platform) {
      return NextResponse.json(
        { message: "Platform is required" },
        { status: 400 }
      );
    }

    // Get user from request
    const userPayload = getUserFromRequest(request);
    if (!userPayload) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    console.log(`Disconnecting ${platform} for user ${userPayload.userId}`);

    // Build the update object based on platform
    const updateFields: { [key: string]: any } = {};

    switch (platform) {
      case "google":
        updateFields.googleAdsEnabled = false;
        updateFields.googleAdsAccessToken = null;
        updateFields.googleAdsRefreshToken = null;
        updateFields.googleAdsTokenExpiresAt = null;
        updateFields.googleAdsCustomerId = null;
        break;
      case "facebook":
        updateFields.facebookAdsEnabled = false;
        updateFields.facebookAdsAccessToken = null;
        updateFields.facebookAdsTokenExpiresAt = null;
        updateFields.facebookAdsAccountId = null;
        updateFields.facebookAdsBusinessName = null;
        break;
      case "instagram":
        updateFields.instagramAdsEnabled = false;
        updateFields.instagramAdsAccessToken = null;
        updateFields.instagramAdsTokenExpiresAt = null;
        updateFields.instagramBusinessAccountId = null;
        updateFields.instagramUsername = null;
        break;
      default:
        return NextResponse.json(
          { message: "Invalid platform" },
          { status: 400 }
        );
    }

    updateFields.updatedAt = new Date();

    // Update database
    const onboardingCollection = await getCollection("onboarding");
    const result = await onboardingCollection.updateOne(
      { userId: userPayload.userId },
      {
        $set: updateFields,
      }
    );

    console.log(`Disconnect result for ${platform}:`, result);

    return NextResponse.json({
      message: `${platform} ads disconnected successfully`,
      acknowledged: result.acknowledged,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Disconnect error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { message: "Failed to disconnect", error: errorMessage },
      { status: 500 }
    );
  }
}
