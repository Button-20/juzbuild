import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";

// This is a one-time migration script to add default notification preferences to existing users
export async function POST(request: NextRequest) {
  try {
    const usersCollection = await getCollection("users");
    
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

    // Add notification preferences to users who don't have them
    const result = await usersCollection.updateMany(
      { 
        notificationPreferences: { $exists: false }
      },
      {
        $set: {
          notificationPreferences: defaultPreferences,
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: `Updated ${result.modifiedCount} users with default notification preferences`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to migrate notification preferences" 
      },
      { status: 500 }
    );
  }
}

// This endpoint should be removed after running the migration once
export async function GET() {
  return NextResponse.json({
    message: "This is a one-time migration endpoint. Use POST to run the migration.",
  });
}