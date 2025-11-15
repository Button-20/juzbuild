import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
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

    const notificationsCollection = await getCollection("notifications");

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    const query: any = { userId: decoded.userId };
    if (unreadOnly) {
      query.isRead = false;
    }

    const notifications = await notificationsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit * page)
      .skip((page - 1) * limit)
      .toArray();

    const totalCount = await notificationsCollection.countDocuments(query);
    const unreadCount = await notificationsCollection.countDocuments({
      userId: decoded.userId,
      isRead: false,
    });

    return NextResponse.json({
      success: true,
      notifications,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
      unreadCount,
    });
  } catch (error) {
    console.error("Notifications fetch error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const {
      title,
      message,
      type,
      category,
      actionUrl,
      actionText,
      metadata,
      expiresAt,
    } = await request.json();

    if (!title || !message) {
      return NextResponse.json(
        { success: false, message: "Title and message are required" },
        { status: 400 }
      );
    }

    const notificationsCollection = await getCollection("notifications");

    const notification = {
      userId: decoded.userId,
      title,
      message,
      type: type || "info",
      category: category || "system",
      isRead: false,
      readAt: null,
      actionUrl,
      actionText,
      metadata: metadata || {},
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await notificationsCollection.insertOne(notification);

    return NextResponse.json({
      success: true,
      notification: { ...notification, _id: result.insertedId },
      message: "Notification created successfully",
    });
  } catch (error) {
    console.error("Notification creation error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create notification" },
      { status: 500 }
    );
  }
}
