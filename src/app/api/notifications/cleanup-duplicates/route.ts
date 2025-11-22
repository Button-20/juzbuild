import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";
import { ObjectId } from "mongodb";

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

    const notificationsCollection = await getCollection("notifications");

    // Find duplicate welcome notifications for this user
    const duplicateWelcome = await notificationsCollection
      .find({
        userId: decoded.userId,
        title: { $regex: /Welcome to Juzbuild/i },
      })
      .sort({ createdAt: 1 }) // Oldest first
      .toArray();

    let removedCount = 0;

    if (duplicateWelcome.length > 1) {
      // Keep the first one, remove the rest
      const idsToRemove = duplicateWelcome.slice(1).map((notif) => notif._id);

      const result = await notificationsCollection.deleteMany({
        _id: { $in: idsToRemove },
      });

      removedCount = result.deletedCount || 0;
    }

    // Also look for other potential duplicates (same title and message within 1 hour)
    const allNotifications = await notificationsCollection
      .find({
        userId: decoded.userId,
      })
      .sort({ title: 1, createdAt: 1 })
      .toArray();

    const duplicateGroups = new Map();

    // Group notifications by title and message
    for (const notification of allNotifications) {
      const key = `${notification.title}|${notification.message}`;
      if (!duplicateGroups.has(key)) {
        duplicateGroups.set(key, []);
      }
      duplicateGroups.get(key).push(notification);
    }

    // Remove duplicates within each group (keep oldest)
    for (const [key, notifications] of duplicateGroups) {
      if (notifications.length > 1) {
        // Check if they were created within 1 hour of each other
        const sortedByDate = notifications.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );

        const firstTime = new Date(sortedByDate[0].createdAt).getTime();
        const duplicatesWithinHour = sortedByDate.filter((notif, index) => {
          if (index === 0) return false; // Keep the first one
          const timeDiff = new Date(notif.createdAt).getTime() - firstTime;
          return timeDiff <= 60 * 60 * 1000; // Within 1 hour
        });

        if (duplicatesWithinHour.length > 0) {
          const idsToRemove = duplicatesWithinHour.map((notif) => notif._id);
          const result = await notificationsCollection.deleteMany({
            _id: { $in: idsToRemove },
          });
          removedCount += result.deletedCount || 0;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Cleaned up ${removedCount} duplicate notifications`,
      removedCount,
    });
  } catch (error) {
    console.error("Cleanup duplicates error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to cleanup duplicates" },
      { status: 500 }
    );
  }
}
