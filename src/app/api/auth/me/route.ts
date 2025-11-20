import { getUserFromRequest, toObjectId } from "@/lib/auth";
import { getCollection } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Get user from JWT token
    const tokenPayload = getUserFromRequest(request);

    if (!tokenPayload) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Get users collection
    const usersCollection = await getCollection("users");

    // Find user by ID using safe ObjectId conversion
    const user = await usersCollection.findOne({
      _id: toObjectId(tokenPayload.userId),
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Get adsConnections - check user collection first, then onboarding collection
    let adsConnections = user.adsConnections || [];
    if (!user.adsConnections || user.adsConnections.length === 0) {
      try {
        const onboardingCollection = await getCollection("onboarding");
        const onboardingRecord = await onboardingCollection.findOne({
          userId: tokenPayload.userId,
        });
        if (onboardingRecord?.adsConnections) {
          adsConnections = onboardingRecord.adsConnections;
        }
      } catch (e) {
        // Silently continue if onboarding lookup fails
      }
    }

    // Return user data (without password)
    const userData = {
      id: user._id,
      fullName: user.fullName,
      avatar: user.avatar || null,
      email: user.email,
      companyName: user.companyName,
      domainName: user.domainName,
      selectedPlan: user.selectedPlan,
      billingCycle: user.billingCycle,
      country: user.country,
      city: user.city,
      phoneNumber: user.phoneNumber,
      tagline: user.tagline,
      aboutSection: user.aboutSection,
      selectedTheme: user.selectedTheme,
      adsConnections: adsConnections,
    };

    return NextResponse.json({
      user: userData,
    });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
