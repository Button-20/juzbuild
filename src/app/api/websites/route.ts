import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";
import { ObjectId } from "mongodb";
import { Website, CreateWebsiteParams } from "@/types/website";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    const websitesCollection = await getCollection("websites");

    const websites = await websitesCollection
      .find({
        userId: decoded.userId,
      })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      websites,
      total: websites.length,
    });
  } catch (error) {
    console.error("Websites fetch error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch websites" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const websiteId = searchParams.get("id");

    if (!websiteId) {
      return NextResponse.json(
        { success: false, message: "Website ID is required" },
        { status: 400 }
      );
    }

    const websitesCollection = await getCollection("websites");

    // Verify ownership before deletion
    const website = await websitesCollection.findOne({
      _id: new ObjectId(websiteId),
      userId: decoded.userId,
    });

    if (!website) {
      return NextResponse.json(
        { success: false, message: "Website not found or unauthorized" },
        { status: 404 }
      );
    }

    // Delete the website
    const result = await websitesCollection.deleteOne({
      _id: new ObjectId(websiteId),
      userId: decoded.userId,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Failed to delete website" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Website deleted successfully",
    });
  } catch (error) {
    console.error("Website deletion error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete website" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    const params: CreateWebsiteParams = await request.json();

    // Validate required fields
    const {
      companyName,
      domainName,
      tagline,
      aboutSection,
      selectedTheme,
      selectedPlan,
      billingCycle,
      includedPages,
      propertyTypes,
      preferredContactMethod,
      brandColors,
      phoneNumber,
      supportEmail,
      whatsappNumber,
      address,
      facebookUrl,
      twitterUrl,
      instagramUrl,
      linkedinUrl,
      youtubeUrl,
    } = params;

    if (
      !companyName ||
      !domainName ||
      !tagline ||
      !aboutSection ||
      !selectedTheme ||
      !selectedPlan ||
      !billingCycle
    ) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    const websitesCollection = await getCollection("websites");

    // Check if domain already exists
    const existingDomain = await websitesCollection.findOne({ domainName });
    if (existingDomain) {
      return NextResponse.json(
        { success: false, message: "Domain name already exists" },
        { status: 409 }
      );
    }

    // Check user's website limit based on plan
    const userWebsites = await websitesCollection.countDocuments({
      userId: decoded.userId,
    });
    const websiteLimit =
      selectedPlan === "starter" ? 1 : selectedPlan === "pro" ? 5 : 20; // agency plan

    if (userWebsites >= websiteLimit) {
      return NextResponse.json(
        {
          success: false,
          message: `You've reached your website limit for the ${selectedPlan} plan`,
        },
        { status: 403 }
      );
    }

    // Create new website
    const website: Omit<Website, "_id"> = {
      userId: decoded.userId,
      companyName,
      domainName,
      tagline,
      aboutSection,
      selectedTheme,
      selectedPlan,
      billingCycle,
      status: "creating",
      deploymentStatus: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      analytics: {
        googleAnalytics: {
          measurementId: null,
          propertyId: null,
          isEnabled: false,
        },
      },
      seo: {},
      branding: {},
    };

    const result = await websitesCollection.insertOne(website);
    const newWebsite = { ...website, _id: result.insertedId.toString() };

    // Set as default website if it's the user's first
    if (userWebsites === 0) {
      const usersCollection = await getCollection("users");
      await usersCollection.updateOne(
        { _id: new ObjectId(decoded.userId) },
        {
          $set: {
            defaultWebsiteId: result.insertedId.toString(),
            updatedAt: new Date(),
          },
        }
      );
    }

    // Trigger background website creation process
    try {
      const backgroundProcessorUrl =
        process.env.BACKGROUND_PROCESSOR_URL || "http://localhost:3001";
      const workflowResponse = await fetch(
        `${backgroundProcessorUrl}/process-website-creation`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-processor-secret": process.env.BACKGROUND_PROCESSOR_SECRET || "",
          },
          body: JSON.stringify({
            websiteId: result.insertedId.toString(),
            userId: decoded.userId,
            websiteName: companyName,
            userEmail: decoded.email,
            fullName: companyName,
            companyName,
            domainName,
            brandColors: brandColors || [
              "#3B82F6",
              "#EF4444",
              "#10B981",
              "#F3F4F6",
            ],
            tagline: tagline || "",
            aboutSection: aboutSection || "",
            selectedTheme,
            propertyTypes: propertyTypes || ["house"],
            includedPages: includedPages || ["home", "about", "contact"],
            preferredContactMethod: preferredContactMethod || ["email"],
            phoneNumber: phoneNumber || "",
            supportEmail: supportEmail || decoded.email,
            whatsappNumber: whatsappNumber || "",
            address: address || "",
            facebookUrl: facebookUrl || "",
            twitterUrl: twitterUrl || "",
            instagramUrl: instagramUrl || "",
            linkedinUrl: linkedinUrl || "",
            youtubeUrl: youtubeUrl || "",
            instagramUrl: "",
            linkedinUrl: "",
            youtubeUrl: "",
          }),
        }
      );

      // Handle background processor response
      if (workflowResponse.ok) {
        const workflowResult = await workflowResponse.json();
        console.log(
          `Background process started with job ID: ${workflowResult.jobId}`
        );
        console.log(
          `Website creation initiated for: ${domainName} with website ID: ${result.insertedId.toString()}`
        );

        // Update website with job tracking info
        await websitesCollection.updateOne(
          { _id: result.insertedId },
          {
            $set: {
              jobId: workflowResult.jobId,
              deploymentStatus: "processing",
              updatedAt: new Date(),
            },
          }
        );

        // Update the newWebsite object to include jobId for response
        newWebsite.jobId = workflowResult.jobId;
      } else {
        const errorText = await workflowResponse.text();
        console.error("Background processor error:", errorText);
        throw new Error(`Background processor failed: ${errorText}`);
      }
    } catch (bgError) {
      console.error("Failed to trigger background process:", bgError);
      // Update website status to failed
      await websitesCollection.updateOne(
        { _id: result.insertedId },
        {
          $set: {
            status: "failed",
            updatedAt: new Date(),
          },
        }
      );
    }

    return NextResponse.json({
      success: true,
      website: newWebsite,
      message: "Website creation started successfully",
    });
  } catch (error) {
    console.error("Website creation error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create website" },
      { status: 500 }
    );
  }
}
