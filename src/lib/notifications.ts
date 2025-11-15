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
}

export async function createNotification(params: CreateNotificationParams) {
  try {
    const notificationsCollection = await getCollection("notifications");

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
    return { ...notification, _id: result.insertedId };
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
