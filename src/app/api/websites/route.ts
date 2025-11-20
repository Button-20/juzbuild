import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";
import { verifyToken, toObjectId } from "@/lib/auth";
import { ObjectId } from "mongodb";
import { Website, CreateWebsiteParams } from "@/types/website";
import { createNotification, NotificationTemplates } from "@/lib/notifications";

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
      !selectedTheme
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
      // If it's the same user trying to create the same website, return the existing one
      if (existingDomain.userId === decoded.userId) {
        return NextResponse.json(
          {
            success: false,
            message: "Website already exists for this domain",
            existingWebsite: {
              _id: existingDomain._id,
              domainName: existingDomain.domainName,
              jobId: existingDomain.jobId,
              status: existingDomain.status,
              deploymentStatus: existingDomain.deploymentStatus,
            },
          },
          { status: 409 }
        );
      } else {
        // Different user trying to use same domain
        return NextResponse.json(
          { success: false, message: "Domain name already exists" },
          { status: 409 }
        );
      }
    }

    // Check if user already has a website with this exact configuration (prevent duplicates)
    const existingUserWebsite = await websitesCollection.findOne({
      userId: decoded.userId,
      domainName: domainName,
    });

    if (existingUserWebsite) {
      // If existing website has a valid jobId, return it
      if (existingUserWebsite.jobId) {
        return NextResponse.json(
          {
            success: false,
            message: "You already have a website with this domain name",
            existingWebsite: {
              _id: existingUserWebsite._id,
              domainName: existingUserWebsite.domainName,
              jobId: existingUserWebsite.jobId,
              status: existingUserWebsite.status,
              deploymentStatus: existingUserWebsite.deploymentStatus,
            },
          },
          { status: 409 }
        );
      } else {
        // Existing website has no jobId, trigger a new background job
        try {
          const backgroundProcessorUrl =
            process.env.BACKGROUND_PROCESSOR_URL || "http://localhost:3001";
          const workflowResponse = await fetch(
            `${backgroundProcessorUrl}/process-website-creation`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-processor-secret":
                  process.env.BACKGROUND_PROCESSOR_SECRET || "",
              },
              body: JSON.stringify({
                websiteId: existingUserWebsite._id.toString(),
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
                tagline: tagline || existingUserWebsite.tagline || "",
                aboutSection:
                  aboutSection || existingUserWebsite.aboutSection || "",
                selectedTheme:
                  selectedTheme || existingUserWebsite.selectedTheme,
                propertyTypes: propertyTypes || ["house"],
                includedPages: includedPages || ["home", "about", "contact"],
                preferredContactMethod: preferredContactMethod || ["email"],
              }),
            }
          );

          if (workflowResponse.ok) {
            const workflowResult = await workflowResponse.json();

            // Update the existing website with the new jobId
            await websitesCollection.updateOne(
              { _id: existingUserWebsite._id },
              {
                $set: {
                  jobId: workflowResult.jobId,
                  deploymentStatus: "processing",
                  status: "creating",
                  updatedAt: new Date(),
                },
              }
            );

            return NextResponse.json(
              {
                success: false,
                message: "Resuming deployment for existing website",
                existingWebsite: {
                  _id: existingUserWebsite._id,
                  domainName: existingUserWebsite.domainName,
                  jobId: workflowResult.jobId,
                  status: "creating",
                  deploymentStatus: "processing",
                },
              },
              { status: 409 }
            );
          } else {
            console.error(
              "Failed to start background job for existing website"
            );
            // Return existing website info even without jobId
            return NextResponse.json(
              {
                success: false,
                message: "Website exists but deployment job failed to start",
                existingWebsite: {
                  _id: existingUserWebsite._id,
                  domainName: existingUserWebsite.domainName,
                  jobId: null,
                  status: existingUserWebsite.status,
                  deploymentStatus: "failed",
                },
              },
              { status: 409 }
            );
          }
        } catch (error) {
          console.error(
            "Error starting background job for existing website:",
            error
          );
          return NextResponse.json(
            {
              success: false,
              message: "Website exists but failed to resume deployment",
              existingWebsite: {
                _id: existingUserWebsite._id,
                domainName: existingUserWebsite.domainName,
                jobId: null,
                status: existingUserWebsite.status,
                deploymentStatus: "failed",
              },
            },
            { status: 409 }
          );
        }
      }

      // If we reach here, we've handled the existing website case
      // This should not happen due to the return statements above, but let's be safe
      console.error("Unexpected: existing website case not handled properly");
      return NextResponse.json(
        {
          success: false,
          message: "Website already exists but handling failed",
          existingWebsite: {
            _id: existingUserWebsite._id,
            domainName: existingUserWebsite.domainName,
            jobId: existingUserWebsite.jobId || null,
            status: existingUserWebsite.status,
            deploymentStatus: existingUserWebsite.deploymentStatus,
          },
        },
        { status: 409 }
      );
    }

    // Get user's plan from user record
    const usersCollection = await getCollection("users");
    const user = await usersCollection.findOne({
      _id: toObjectId(decoded.userId),
    });
    const userPlan = user?.selectedPlan || "starter";

    // Check user's website limit based on plan
    const userWebsites = await websitesCollection.countDocuments({
      userId: decoded.userId,
    });
    const websiteLimit =
      userPlan === "starter" ? 1 : userPlan === "pro" ? 5 : 20; // agency plan

    if (userWebsites >= websiteLimit) {
      // Create notification about website limit reached
      try {
        await createNotification({
          ...NotificationTemplates.WEBSITE_LIMIT_REACHED,
          userId: decoded.userId,
          message: `You've reached your ${userPlan} plan limit of ${websiteLimit} website${
            websiteLimit > 1 ? "s" : ""
          }. Upgrade to create more websites.`,
        });
      } catch (notifError) {
        console.error(
          "Failed to create website limit notification:",
          notifError
        );
      }

      return NextResponse.json(
        {
          success: false,
          message: `You've reached your website limit for the ${userPlan} plan`,
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
    };

    const result = await websitesCollection.insertOne(website);
    const newWebsite = { ...website, _id: result.insertedId.toString() };

    // Set as default website if it's the user's first
    if (userWebsites === 0) {
      const usersCollection = await getCollection("users");
      await usersCollection.updateOne(
        { _id: toObjectId(decoded.userId) },
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

      const requestData = {
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
      };

      const workflowResponse = await fetch(
        `${backgroundProcessorUrl}/process-website-creation`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-processor-secret": process.env.BACKGROUND_PROCESSOR_SECRET || "",
          },
          body: JSON.stringify(requestData),
        }
      );

      // Handle background processor response
      if (workflowResponse.ok) {
        const workflowResult = await workflowResponse.json();

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

        // Create notification for website creation started
        try {
          await createNotification({
            ...NotificationTemplates.WEBSITE_CREATION_STARTED,
            userId: decoded.userId,
            message: `We're building your ${companyName} website! This usually takes 2-3 minutes. We'll notify you when it's ready.`,
          });
        } catch (notifError) {
          console.error(
            "Failed to create website creation notification:",
            notifError
          );
        }

        // Update the newWebsite object to include jobId for response
        const response = {
          ...newWebsite,
          jobId: workflowResult.jobId,
        };

        return NextResponse.json({
          success: true,
          website: response,
          jobId: workflowResult.jobId,
          message: "Website creation started successfully",
        });
      } else {
        const errorText = await workflowResponse.text();
        console.error(
          "Background processor HTTP error:",
          workflowResponse.status,
          errorText
        );
        console.error(
          "Response headers:",
          Object.fromEntries(workflowResponse.headers.entries())
        );
        throw new Error(
          `Background processor failed with status ${workflowResponse.status}: ${errorText}`
        );
      }
    } catch (bgError) {
      console.error("Failed to trigger background process:", bgError);
      console.error("Error details:", {
        name: bgError instanceof Error ? bgError.name : "Unknown",
        message: bgError instanceof Error ? bgError.message : String(bgError),
        stack: bgError instanceof Error ? bgError.stack : undefined,
      });
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

      return NextResponse.json({
        success: true,
        website: newWebsite,
        message:
          "Website creation started (background job failed, but website was created)",
      });
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
