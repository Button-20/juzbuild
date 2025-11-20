import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";

export async function PATCH(request: NextRequest) {
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

    const notificationsCollection = await getCollection("notifications");

    const result = await notificationsCollection.updateMany(
      { userId: decoded.userId, isRead: false },
      {
        $set: {
          isRead: true,
          readAt: new Date(),
          updatedAt: new Date(),
        },
      }
    );

    // Send updated unread count (should be 0) via SSE
    try {
      const { sendUnreadCountUpdate } = await import(
        "@/app/api/notifications/ws/route"
      );
      sendUnreadCountUpdate(decoded.userId, 0);
    } catch (error) {
      console.warn("Failed to send unread count update:", error);
    }

    return NextResponse.json({
      success: true,
      updatedCount: result.modifiedCount,
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error("Mark all read error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to mark all notifications as read" },
      { status: 500 }
    );
  }
}
