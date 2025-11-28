import { getUserFromRequest } from "@/lib/auth";
import { MongoClient, ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);

    if (!user) {
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

      // Convert userId to ObjectId
      let userId: ObjectId | string = user.userId;
      if (ObjectId.isValid(user.userId)) {
        userId = new ObjectId(user.userId);
      }

      // Update user's advertising connections
      const result = await usersCollection.updateOne(
        { _id: userId as any },
        {
          $set: {
            adsConnections: platforms,
            updatedAt: new Date(),
          },
        }
      );

      if (result.matchedCount === 0) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        platforms,
        message: "Advertising platforms updated successfully",
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
    const user = getUserFromRequest(req);

    if (!user) {
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

      // Convert userId to ObjectId
      let userId: ObjectId | string = user.userId;
      if (ObjectId.isValid(user.userId)) {
        userId = new ObjectId(user.userId);
      }

      // Get user's marketing platforms
      const userData = await usersCollection.findOne({
        _id: userId as any,
      });

      if (!userData) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      return NextResponse.json({
        platforms: userData.marketingPlatforms || [],
      });
    } finally {
      await client.close();
    }
  } catch (error) {
    console.error("Error fetching marketing platforms:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch platforms",
      },
      { status: 500 }
    );
  }
}
