import { getCollection } from "@/lib/mongodb";

interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
  type?: "info" | "success" | "warning" | "error" | "update" | "reminder";
  category?:
    | "system"
    | "profile"
    | "billing"
    | "security"
    | "feature"
    | "maintenance";
  actionUrl?: string;
  actionText?: string;
  metadata?: Record<string, any>;
  expiresAt?: Date;
  preventDuplicates?: boolean;
}

export async function createNotification(params: CreateNotificationParams) {
  try {
    const notificationsCollection = await getCollection("notifications");

    // Check for duplicates if requested
    if (params.preventDuplicates) {
      const existingNotification = await notificationsCollection.findOne({
        userId: params.userId,
        title: params.title,
        createdAt: {
          $gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      });

      if (existingNotification) {
        console.log(
          `Duplicate notification prevented: ${params.title} for user ${params.userId}`
        );
        return existingNotification;
      }
    }

    const notification = {
      userId: params.userId,
      title: params.title,
      message: params.message,
      type: params.type || "info",
      category: params.category || "system",
      isRead: false,
      readAt: null,
      actionUrl: params.actionUrl,
      actionText: params.actionText,
      metadata: params.metadata || {},
      expiresAt: params.expiresAt,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await notificationsCollection.insertOne(notification);
    const createdNotification = { ...notification, _id: result.insertedId };

    // Send real-time notification via SSE
    try {
      const { sendNotificationToUser } = await import(
        "@/app/api/notifications/ws/route"
      );
      sendNotificationToUser(params.userId, createdNotification);
    } catch (error) {
      // SSE is optional, don't fail if it's not available
      console.warn("Failed to send real-time notification:", error);
    }

    return createdNotification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
}

export async function createNotificationByEmail(
  email: string,
  params: Omit<CreateNotificationParams, "userId">
) {
  try {
    const usersCollection = await getCollection("users");

    const user = await usersCollection.findOne({ email });
    if (!user) {
      throw new Error("User not found");
    }

    return await createNotification({
      ...params,
      userId: user._id.toString(),
    });
  } catch (error) {
    console.error("Error creating notification by email:", error);
    throw error;
  }
}

// Pre-defined notification templates
export const NotificationTemplates = {
  WELCOME: {
    title: "Welcome to Juzbuild! 🎉",
    message:
      "Your account has been successfully created. Start by setting up your profile and creating your first website.",
    type: "success" as const,
    category: "system" as const,
    actionUrl: "/app/profile",
    actionText: "Complete Profile",
  },

  PROFILE_COMPLETED: {
    title: "Profile Updated",
    message: "Your profile information has been successfully updated.",
    type: "success" as const,
    category: "profile" as const,
  },

  DOMAIN_PURCHASED: {
    title: "Domain Purchased Successfully",
    message:
      "Your domain has been purchased and is being configured. This may take a few minutes.",
    type: "success" as const,
    category: "system" as const,
  },

  WEBSITE_DEPLOYED: {
    title: "Website Deployed! 🚀",
    message: "Your website has been successfully deployed and is now live.",
    type: "success" as const,
    category: "system" as const,
    actionText: "View Website",
  },

  PLAN_UPGRADED: {
    title: "Plan Upgraded Successfully! ⭐",
    message:
      "Your subscription has been upgraded. You now have access to new features and increased limits.",
    type: "success" as const,
    category: "billing" as const,
    actionUrl: "/app/settings",
    actionText: "View Settings",
  },

  PAYMENT_FAILED: {
    title: "Payment Failed ⚠️",
    message:
      "Your latest payment could not be processed. Please update your payment method to avoid service interruption.",
    type: "error" as const,
    category: "billing" as const,
    actionUrl: "/app/settings",
    actionText: "Update Payment",
  },

  SUBSCRIPTION_CANCELED: {
    title: "Subscription Canceled",
    message:
      "Your subscription has been canceled. You still have access to premium features until your billing period ends.",
    type: "warning" as const,
    category: "billing" as const,
    actionUrl: "/app/settings",
    actionText: "Reactivate",
  },

  WEBSITE_CREATION_STARTED: {
    title: "Website Creation Started 🔧",
    message:
      "We're building your website! This usually takes 2-3 minutes. We'll notify you when it's ready.",
    type: "info" as const,
    category: "system" as const,
  },

  DOMAIN_SETUP_REQUIRED: {
    title: "Domain Setup Required",
    message:
      "Your website is ready! Complete the domain setup to make it live on the internet.",
    type: "reminder" as const,
    category: "system" as const,
    actionUrl: "/app/domain",
    actionText: "Setup Domain",
  },

  ONBOARDING_INCOMPLETE: {
    title: "Complete Your Setup",
    message: "You're almost done! Complete your website setup to get it live.",
    type: "reminder" as const,
    category: "system" as const,
    actionUrl: "/app/onboarding",
    actionText: "Continue Setup",
  },

  WEBSITE_LIMIT_REACHED: {
    title: "Website Limit Reached",
    message:
      "You've reached your plan's website limit. Upgrade to create more websites.",
    type: "warning" as const,
    category: "billing" as const,
    actionUrl: "/app/settings",
    actionText: "Upgrade Plan",
  },

  SECURITY_ALERT: {
    title: "Security Alert",
    message:
      "A new login was detected from an unrecognized device. If this wasn't you, please secure your account immediately.",
    type: "warning" as const,
    category: "security" as const,
    actionUrl: "/app/profile",
    actionText: "Review Account",
  },

  NEWSLETTER_SUBSCRIBED: {
    title: "Newsletter Subscription",
    message:
      "Thank you for subscribing to our newsletter! You'll receive updates about new features and tips.",
    type: "info" as const,
    category: "system" as const,
  },

  MAINTENANCE_SCHEDULED: {
    title: "Scheduled Maintenance",
    message:
      "We have scheduled maintenance for tonight at 2:00 AM UTC. Services may be briefly unavailable.",
    type: "warning" as const,
    category: "maintenance" as const,
  },

  NEW_FEATURE: {
    title: "New Feature Available! ✨",
    message:
      "Check out our latest feature that makes building websites even easier.",
    type: "update" as const,
    category: "feature" as const,
  },
};
