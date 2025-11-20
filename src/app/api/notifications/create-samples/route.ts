import { NextRequest, NextResponse } from "next/server";
import { createNotification, NotificationTemplates } from "@/lib/notifications";
import { verifyToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // Only allow this in development
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Not available in production" },
        { status: 403 }
      );
    }

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

    // Create sample notifications for testing
    const sampleNotifications = [
      {
        ...NotificationTemplates.WELCOME,
        userId: decoded.userId,
        message:
          "Welcome to Juzbuild! Your account has been successfully created. Start by setting up your profile and creating your first website.",
      },
      {
        title: "Website Deployed Successfully! 🚀",
        message:
          "Your MyCompany website has been successfully deployed and is now live at mycompany.onjuzbuild.com",
        type: "success" as const,
        category: "system" as const,
        actionUrl: "https://mycompany.onjuzbuild.com",
        actionText: "View Website",
        userId: decoded.userId,
      },
      {
        title: "Plan Upgrade Available",
        message:
          "Upgrade to Pro plan to unlock unlimited websites and advanced features. Limited time offer - 20% off!",
        type: "info" as const,
        category: "billing" as const,
        actionUrl: "/app/settings",
        actionText: "Upgrade Now",
        userId: decoded.userId,
      },
      {
        title: "New Feature: Custom Domains",
        message:
          "You can now connect your own custom domain to your websites. Make your site truly yours!",
        type: "update" as const,
        category: "feature" as const,
        actionUrl: "/app/domain",
        actionText: "Setup Domain",
        userId: decoded.userId,
      },
      {
        title: "Monthly Report Ready 📊",
        message:
          "Your monthly analytics report is ready. See how your website performed this month.",
        type: "info" as const,
        category: "system" as const,
        actionUrl: "/app/analytics",
        actionText: "View Report",
        userId: decoded.userId,
      },
    ];

    const createdNotifications = [];

    for (const notification of sampleNotifications) {
      try {
        const created = await createNotification(notification);
        createdNotifications.push(created);
      } catch (error) {
        console.error("Failed to create sample notification:", error);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Created ${createdNotifications.length} sample notifications`,
      notifications: createdNotifications,
    });
  } catch (error) {
    console.error("Sample notifications error:", error);
    return NextResponse.json(
      { error: "Failed to create sample notifications" },
      { status: 500 }
    );
  }
}
