import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { createNotification, NotificationTemplates } from "@/lib/notifications";

export async function POST(request: NextRequest) {
  try {
    // Verify this is an internal request (you might want to add authentication)
    const authHeader = request.headers.get("authorization");
    const expectedSecret = process.env.INTERNAL_API_SECRET;

    if (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDatabase();
    const usersCollection = db.collection("users");
    const websitesCollection = db.collection("websites");
    const notificationsCollection = db.collection("notifications");

    // Find users who registered but haven't created a website in the last 24-72 hours
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const usersWithoutWebsites = await usersCollection
      .find({
        createdAt: { $gte: oneDayAgo, $lte: threeDaysAgo },
        selectedPlan: { $ne: "starter" }, // Only for paid users initially
      })
      .toArray();

    let remindersSent = 0;

    for (const user of usersWithoutWebsites) {
      // Check if user has any websites
      const userWebsites = await websitesCollection.countDocuments({
        userId: user._id.toString(),
      });

      if (userWebsites === 0) {
        // Check if we already sent an onboarding reminder in the last 24 hours
        const recentReminder = await notificationsCollection.findOne({
          userId: user._id.toString(),
          type: "reminder",
          category: "system",
          title: NotificationTemplates.ONBOARDING_INCOMPLETE.title,
          createdAt: { $gte: oneDayAgo },
        });

        if (!recentReminder) {
          // Send reminder notification
          try {
            await createNotification({
              ...NotificationTemplates.ONBOARDING_INCOMPLETE,
              userId: user._id.toString(),
              message: `Hi ${user.fullName}! You're almost done setting up your account. Complete your website setup to get it live on the internet.`,
            });
            remindersSent++;
          } catch (notifError) {
            console.error(
              `Failed to create onboarding reminder for user ${user._id}:`,
              notifError
            );
          }
        }
      }
    }

    // Find websites that are created but need domain setup
    const websitesNeedingDomain = await websitesCollection
      .find({
        status: "active",
        deploymentStatus: "deployed",
        createdAt: { $gte: oneDayAgo, $lte: threeDaysAgo },
        $or: [
          { customDomain: null },
          { customDomain: { $exists: false } },
          { domainSetupCompleted: { $ne: true } },
        ],
      })
      .toArray();

    let domainRemindersSent = 0;

    for (const website of websitesNeedingDomain) {
      // Check if we already sent a domain setup reminder recently
      const recentDomainReminder = await notificationsCollection.findOne({
        userId: website.userId,
        type: "reminder",
        category: "system",
        title: NotificationTemplates.DOMAIN_SETUP_REQUIRED.title,
        createdAt: { $gte: oneDayAgo },
      });

      if (!recentDomainReminder) {
        try {
          await createNotification({
            ...NotificationTemplates.DOMAIN_SETUP_REQUIRED,
            userId: website.userId,
            message: `Your ${website.companyName} website is ready! Complete the domain setup to make it live on the internet.`,
          });
          domainRemindersSent++;
        } catch (notifError) {
          console.error(
            `Failed to create domain reminder for website ${website._id}:`,
            notifError
          );
        }
      }
    }

    return NextResponse.json({
      success: true,
      remindersSent,
      domainRemindersSent,
      message: `Sent ${remindersSent} onboarding reminders and ${domainRemindersSent} domain setup reminders`,
    });
  } catch (error) {
    console.error("Reminder notifications error:", error);
    return NextResponse.json(
      { error: "Failed to send reminder notifications" },
      { status: 500 }
    );
  }
}
