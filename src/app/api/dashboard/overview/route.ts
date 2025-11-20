import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";
import { createNotification, NotificationTemplates } from "@/lib/notifications";
import { ObjectId } from "mongodb";

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

    const usersCollection = await getCollection("users");
    const websitesCollection = await getCollection("websites");
    const notificationsCollection = await getCollection("notifications");

    // Get user information
    const user = await usersCollection.findOne({
      _id: new ObjectId(decoded.userId),
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Get user's websites
    const websites = await websitesCollection
      .find({ userId: decoded.userId })
      .sort({ createdAt: -1 })
      .toArray();

    // Get recent notifications (last 10)
    const notifications = await notificationsCollection
      .find({ userId: decoded.userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();

    // Check if user needs any reminders and create them
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    // Check for incomplete onboarding (no websites created in 24+ hours)
    if (websites.length === 0) {
      const userAge = Date.now() - new Date(user.createdAt).getTime();
      const twentyFourHours = 24 * 60 * 60 * 1000;
      
      if (userAge > twentyFourHours) {
        // Check if we already sent an onboarding reminder recently
        const recentOnboardingReminder = await notificationsCollection.findOne({
          userId: decoded.userId,
          type: "reminder",
          title: NotificationTemplates.ONBOARDING_INCOMPLETE.title,
          createdAt: { $gte: oneDayAgo },
        });

        if (!recentOnboardingReminder) {
          await createNotification({
            ...NotificationTemplates.ONBOARDING_INCOMPLETE,
            userId: decoded.userId,
            message: `Hi ${user.fullName}! You're almost done setting up your account. Complete your website setup to get it live on the internet.`,
          });
        }
      }
    }

    // Check for websites needing domain setup
    for (const website of websites) {
      if (website.status === "active" && 
          (!website.customDomain || !website.domainSetupCompleted)) {
        
        const websiteAge = Date.now() - new Date(website.createdAt).getTime();
        const sixHours = 6 * 60 * 60 * 1000;
        
        if (websiteAge > sixHours) {
          const recentDomainReminder = await notificationsCollection.findOne({
            userId: decoded.userId,
            type: "reminder",
            title: NotificationTemplates.DOMAIN_SETUP_REQUIRED.title,
            createdAt: { $gte: oneDayAgo },
            "metadata.websiteId": website._id.toString(),
          });

          if (!recentDomainReminder) {
            await createNotification({
              ...NotificationTemplates.DOMAIN_SETUP_REQUIRED,
              userId: decoded.userId,
              message: `Your ${website.companyName} website is ready! Complete the domain setup to make it live on the internet.`,
              metadata: { websiteId: website._id.toString() },
            });
          }
        }
      }
    }

    // Calculate dashboard statistics
    const stats = {
      totalWebsites: websites.length,
      activeWebsites: websites.filter(w => w.status === "active").length,
      pendingWebsites: websites.filter(w => w.status === "creating" || w.deploymentStatus === "processing").length,
      unreadNotifications: await notificationsCollection.countDocuments({
        userId: decoded.userId,
        isRead: false,
      }),
    };

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        selectedPlan: user.selectedPlan,
        subscriptionStatus: user.subscriptionStatus,
      },
      websites,
      notifications,
      stats,
    });
  } catch (error) {
    console.error("Dashboard overview error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard overview" },
      { status: 500 }
    );
  }
}
