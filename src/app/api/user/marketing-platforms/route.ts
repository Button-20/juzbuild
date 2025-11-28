import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { MongoClient } from "mongodb";

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { platforms } = body;

    if (!Array.isArray(platforms)) {
      return NextResponse.json(
        { error: "Platforms must be an array" },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const client = new MongoClient(
      process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/Juzbuild"
    );

    try {
      await client.connect();
      const db = client.db("Juzbuild");
      const usersCollection = db.collection("users");

      // Update user's marketing platforms
      const result = await usersCollection.updateOne(
        { clerkId: userId },
        {
          $set: {
            marketingPlatforms: platforms,
            updatedAt: new Date(),
          },
        }
      );

      if (result.matchedCount === 0) {
        return NextResponse.json(
          { error: "User not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        platforms,
        message: "Marketing platforms updated successfully",
      });
    } finally {
      await client.close();
    }
  } catch (error) {
    console.error("Error updating marketing platforms:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to update platforms",
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Connect to MongoDB
    const client = new MongoClient(
      process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/Juzbuild"
    );

    try {
      await client.connect();
      const db = client.db("Juzbuild");
      const usersCollection = db.collection("users");

      // Get user's marketing platforms
      const user = await usersCollection.findOne({ clerkId: userId });

      if (!user) {
        return NextResponse.json(
          { error: "User not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        platforms: user.marketingPlatforms || [],
      });
    } finally {
      await client.close();
    }
  } catch (error) {
    console.error("Error fetching marketing platforms:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch platforms",
      },
      { status: 500 }
    );
  }
}
