import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";
import { ObjectId } from "mongodb";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");

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

    const { id } = await params;
    const websitesCollection = await getCollection("websites");

    const website = await websitesCollection.findOne({
      _id: new ObjectId(id),
      userId: decoded.userId,
    });

    if (!website) {
      return NextResponse.json(
        { success: false, message: "Website not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      website,
    });
  } catch (error) {
    console.error("Website fetch error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch website" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");

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

    const { id } = await params;
    const updates = await request.json();

    // Remove fields that shouldn't be updated directly
    const {
      _id,
      userId,
      createdAt,
      status,
      deploymentStatus,
      ...allowedUpdates
    } = updates;

    const websitesCollection = await getCollection("websites");

    const result = await websitesCollection.findOneAndUpdate(
      {
        _id: new ObjectId(id),
        userId: decoded.userId,
      },
      {
        $set: {
          ...allowedUpdates,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    if (!result) {
      return NextResponse.json(
        { success: false, message: "Website not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      website: result,
      message: "Website updated successfully",
    });
  } catch (error) {
    console.error("Website update error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update website" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");

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

    const { id } = await params;
    const websitesCollection = await getCollection("websites");
    const usersCollection = await getCollection("users");

    // Check if website exists and belongs to user
    const website = await websitesCollection.findOne({
      _id: new ObjectId(id),
      userId: decoded.userId,
    });

    if (!website) {
      return NextResponse.json(
        { success: false, message: "Website not found" },
        { status: 404 }
      );
    }

    // Mark website as deleted instead of hard delete (for data recovery)
    await websitesCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: "suspended",
          isActive: false,
          deletedAt: new Date(),
          updatedAt: new Date(),
        },
      }
    );

    // If this was the default website, update user's defaultWebsiteId
    const user = await usersCollection.findOne({
      _id: new ObjectId(decoded.userId),
    });
    if (user?.defaultWebsiteId === id) {
      // Find another active website to set as default
      const activeWebsite = await websitesCollection.findOne({
        userId: decoded.userId,
        isActive: true,
        status: { $ne: "suspended" },
      });

      await usersCollection.updateOne(
        { _id: new ObjectId(decoded.userId) },
        {
          $set: {
            defaultWebsiteId: activeWebsite?._id?.toString() || null,
            updatedAt: new Date(),
          },
        }
      );
    }

    // Trigger background cleanup process
    try {
      await fetch(
        `${process.env.BACKGROUND_PROCESSOR_URL}/api/workflow/delete-site`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            websiteId: id,
            domainName: website.domainName,
            githubRepo: website.githubRepo,
            vercelProjectId: website.vercelProjectId,
          }),
        }
      );
    } catch (bgError) {
      console.error("Failed to trigger background cleanup:", bgError);
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
