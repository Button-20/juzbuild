import { getCollection } from "@/lib";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const domainName = searchParams.get("domain");

    if (!domainName) {
      return NextResponse.json(
        { message: "Domain name is required" },
        { status: 400 }
      );
    }

    // Clean the domain name
    const cleanDomain = domainName.toLowerCase().trim();

    // Validate domain format
    if (!/^[a-zA-Z0-9-]+$/.test(cleanDomain)) {
      return NextResponse.json(
        {
          exists: false,
          available: false,
          message: "Domain name can only contain letters, numbers, and hyphens",
        },
        { status: 400 }
      );
    }

    if (cleanDomain.length < 3) {
      return NextResponse.json(
        {
          exists: false,
          available: false,
          message: "Domain name must be at least 3 characters",
        },
        { status: 400 }
      );
    }

    // Check if domain already exists in users collection
    const usersCollection = await getCollection("users");
    const existingUser = await usersCollection.findOne({
      domainName: cleanDomain,
    });

    // Also check in onboarding collection for pending registrations
    const onboardingCollection = await getCollection("onboarding");
    const existingOnboarding = await onboardingCollection.findOne({
      domainName: cleanDomain,
    });

    const exists = !!(existingUser || existingOnboarding);

    return NextResponse.json({
      exists,
      available: !exists,
      domain: `${cleanDomain}.juzbuild.com`,
      message: exists
        ? "This domain name is already taken"
        : "Domain name is available",
    });
  } catch (error) {
    console.error("Error checking domain availability:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
