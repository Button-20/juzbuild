import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";
import { ObjectId } from "mongodb";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const { isRead } = await request.json();

    const notificationsCollection = await getCollection("notifications");

    const notification = await notificationsCollection.findOneAndUpdate(
      { _id: new ObjectId(id), userId: decoded.userId },
      {
        $set: {
          isRead: isRead !== undefined ? isRead : true,
          readAt: isRead !== false ? new Date() : null,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    if (!notification) {
      return NextResponse.json(
        { success: false, message: "Notification not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      notification,
      message: "Notification updated successfully",
    });
  } catch (error) {
    console.error("Notification update error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update notification" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    const notificationsCollection = await getCollection("notifications");

    const notification = await notificationsCollection.findOneAndDelete({
      _id: new ObjectId(id),
      userId: decoded.userId,
    });

    if (!notification) {
      return NextResponse.json(
        { success: false, message: "Notification not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.error("Notification deletion error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete notification" },
      { status: 500 }
    );
  }
}
