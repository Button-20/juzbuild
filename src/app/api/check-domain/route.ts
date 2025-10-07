import { getCollection } from "@/lib/mongodb";
import { getNamecheapInstance } from "@/lib/namecheap";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const domainName = searchParams.get("domain");
    const checkExternal = searchParams.get("external") === "true";

    if (!domainName) {
      return NextResponse.json(
        { message: "Domain name is required" },
        { status: 400 }
      );
    }

    // Clean the domain name
    const cleanDomain = domainName.toLowerCase().trim();

    // Validate domain format - allow TLDs if external checking is requested
    if (checkExternal && cleanDomain.includes(".")) {
      // Full domain validation for external checking
      const domainRegex =
        /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$/;
      if (!domainRegex.test(cleanDomain)) {
        return NextResponse.json(
          {
            exists: false,
            available: false,
            message: "Invalid domain name format",
          },
          { status: 400 }
        );
      }
    } else {
      // Subdomain validation for local checking
      if (!/^[a-zA-Z0-9-]+$/.test(cleanDomain)) {
        return NextResponse.json(
          {
            exists: false,
            available: false,
            message:
              "Domain name can only contain letters, numbers, and hyphens",
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

      if (cleanDomain.startsWith("-") || cleanDomain.endsWith("-")) {
        return NextResponse.json(
          {
            exists: false,
            available: false,
            message: "Domain name cannot start or end with a hyphen",
          },
          { status: 400 }
        );
      }
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

    const existsLocally = !!(existingUser || existingOnboarding);

    // Determine if this is an external domain check (has TLD) or local subdomain check
    const isExternalDomain = cleanDomain.includes(".");

    // For local subdomains, check our database
    if (!isExternalDomain) {
      // If domain exists locally, return immediately
      if (existsLocally) {
        return NextResponse.json({
          exists: true,
          available: false,
          domain: `${cleanDomain}.juzbuild.com`,
          message: "This domain name is already taken",
          source: "local",
        });
      }
    }

    // If external checking is requested, check with Namecheap
    let externalResult = null;
    let externalError = null;

    if (checkExternal) {
      try {
        const namecheap = getNamecheapInstance();
        // Use the domain as-is if it has a TLD, otherwise add .com
        const domainToCheck = isExternalDomain
          ? cleanDomain
          : `${cleanDomain}.com`;
        const result = await namecheap.checkDomain(domainToCheck);

        externalResult = {
          domain: result.domain,
          available: result.available,
          isPremium: result.isPremiumName || false,
          premiumPrice: result.premiumRegistrationPrice,
          description: result.description,
        };
      } catch (error) {
        console.error("Namecheap API error:", error);
        externalError =
          error instanceof Error ? error.message : "External API error";
      }
    }

    // Return result based on domain type
    if (isExternalDomain && checkExternal) {
      // For external domains, return the external result as primary
      return NextResponse.json({
        exists: externalResult ? !externalResult.available : false,
        available: externalResult ? externalResult.available : false,
        domain: cleanDomain,
        message: externalResult
          ? externalResult.available
            ? "Domain is available for registration"
            : "Domain is not available"
          : "Unable to check external domain availability",
        source: "external",
        external: {
          result: externalResult,
          error: externalError,
          hasConfiguration: !!(
            process.env.NAMECHEAP_API_USER &&
            process.env.NAMECHEAP_API_KEY &&
            process.env.NAMECHEAP_USERNAME
          ),
        },
      });
    } else {
      // For local subdomains, return local result
      return NextResponse.json({
        exists: false,
        available: true,
        domain: `${cleanDomain}.juzbuild.com`,
        message: "Domain name is available",
        source: "local",
        external: checkExternal
          ? {
              result: externalResult,
              error: externalError,
              hasConfiguration: !!(
                process.env.NAMECHEAP_API_USER &&
                process.env.NAMECHEAP_API_KEY &&
                process.env.NAMECHEAP_USERNAME
              ),
            }
          : undefined,
      });
    }
  } catch (error) {
    console.error("Error checking domain availability:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
