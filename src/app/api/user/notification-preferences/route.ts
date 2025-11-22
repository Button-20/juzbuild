import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";
import { ObjectId } from "mongodb";

const defaultPreferences = {
  email: {
    newLeads: true,
    propertyInquiries: true,
    billingUpdates: true,
    systemAlerts: true,
    weeklyReports: false,
  },
  push: {
    newLeads: true,
    propertyInquiries: true,
    systemAlerts: false,
    urgentNotifications: true,
  },
  frequency: {
    emailDigest: "daily",
    leadNotifications: "immediate",
  },
};

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
    const user = await usersCollection.findOne({
      _id: new ObjectId(decoded.userId),
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Return existing preferences or defaults
    const preferences = user.notificationPreferences || defaultPreferences;
    
    return NextResponse.json({
      success: true,
      preferences: preferences,
    });
  } catch (error) {
    console.error("Get notification preferences error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to get notification preferences" },
      { status: 500 }
    );
  }
}

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

    const { preferences } = await request.json();

    if (!preferences || typeof preferences !== 'object') {
      return NextResponse.json(
        { success: false, message: "Valid preferences object is required" },
        { status: 400 }
      );
    }

    // Validate preferences structure
    const requiredStructure = {
      email: ['newLeads', 'propertyInquiries', 'billingUpdates', 'systemAlerts', 'weeklyReports'],
      push: ['newLeads', 'propertyInquiries', 'systemAlerts', 'urgentNotifications'],
      frequency: ['emailDigest', 'leadNotifications']
    };

    // Sanitize and validate preferences
    const sanitizedPreferences = {
      email: {},
      push: {},
      frequency: {}
    };

    // Validate email preferences
    if (preferences.email && typeof preferences.email === 'object') {
      for (const key of requiredStructure.email) {
        if (typeof preferences.email[key] === 'boolean') {
          sanitizedPreferences.email[key] = preferences.email[key];
        }
      }
    }

    // Validate push preferences
    if (preferences.push && typeof preferences.push === 'object') {
      for (const key of requiredStructure.push) {
        if (typeof preferences.push[key] === 'boolean') {
          sanitizedPreferences.push[key] = preferences.push[key];
        }
      }
    }

    // Validate frequency preferences
    if (preferences.frequency && typeof preferences.frequency === 'object') {
      const validEmailDigest = ['immediate', 'daily', 'weekly', 'never'];
      const validLeadNotifications = ['immediate', 'hourly', 'daily'];
      
      if (validEmailDigest.includes(preferences.frequency.emailDigest)) {
        sanitizedPreferences.frequency.emailDigest = preferences.frequency.emailDigest;
      }
      if (validLeadNotifications.includes(preferences.frequency.leadNotifications)) {
        sanitizedPreferences.frequency.leadNotifications = preferences.frequency.leadNotifications;
      }
    }

    const usersCollection = await getCollection("users");
    
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(decoded.userId) },
      {
        $set: {
          notificationPreferences: { ...defaultPreferences, ...sanitizedPreferences },
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Notification preferences updated successfully",
      preferences: { ...defaultPreferences, ...sanitizedPreferences }
    });
  } catch (error) {
    console.error("Update notification preferences error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update notification preferences" },
      { status: 500 }
    );
  }
}