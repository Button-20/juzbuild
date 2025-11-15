import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { verifyToken } from "@/lib/auth";
import { getCollection } from "@/lib/mongodb";
import { deletionService } from "@/lib/website-deletion-service";

/**
 * DELETE /api/sites/[siteId]/delete
 * Delete a website and all its configurations
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params;

    // Verify authentication
    const token = req.cookies.get("auth-token")?.value;
    if (!token) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    const userId = decoded.userId;

    // Get site details to verify ownership and collect resource info
    const websitesCollection = await getCollection("websites");
    const site = await websitesCollection.findOne({
      _id: new ObjectId(siteId),
      userId: userId,
    });

    if (!site) {
      return NextResponse.json(
        { message: "Site not found or access denied" },
        { status: 404 }
      );
    }

    // Prepare deletion options
    // Extract github owner and repo from repoUrl
    const repoUrl = site.repoUrl || "";
    const repoMatch = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    const githubOwner = repoMatch?.[1] || process.env.GITHUB_USERNAME || "";
    const githubRepo = repoMatch?.[2] || "";

    // Project name is derived from website name (same as how it was created)
    const projectName = (site.websiteName || "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-");

    const deletionOptions = {
      siteId,
      userId,
      projectName: projectName,
      githubRepo: githubRepo,
      githubOwner: githubOwner,
      dbName: site.dbName,
      ga4PropertyId: site.analytics?.googleAnalytics?.propertyId,
      domain: site.domain,
    };

    console.log("🗑️ Starting website deletion for:", site.websiteName);
    console.log("Deletion options:", JSON.stringify(deletionOptions, null, 2));

    // Execute deletion
    const deletionResult = await deletionService.deleteWebsite(deletionOptions);

    // Mark site as deleted instead of removing it completely (for history)
    await websitesCollection.updateOne(
      { _id: new ObjectId(siteId) },
      {
        $set: {
          status: "deleted",
          deletedAt: new Date(),
          updatedAt: new Date(),
        },
      }
    );

    console.log("✅ Website deletion completed:", site.websiteName);

    return NextResponse.json({
      success: true,
      message: `Website "${site.websiteName}" has been deleted successfully`,
      result: deletionResult,
    });
  } catch (error) {
    console.error("Website deletion failed:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete website",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
