import { getCollection } from "@/lib";
import { getUserFromRequest } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Get user from JWT token
    const tokenPayload = getUserFromRequest(request);

    if (!tokenPayload) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Get users collection
    const usersCollection = await getCollection("users");

    // Find user by ID - Convert string ID to ObjectId for MongoDB query
    const { ObjectId } = require("mongodb");
    const user = await usersCollection.findOne({
      _id: new ObjectId(tokenPayload.userId),
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Return user data (without password)
    const userData = {
      id: user._id,
      fullName: user.fullName,
      avatar: user.avatar || null,
      email: user.email,
      companyName: user.companyName,
      domainName: user.domainName,
      selectedPlan: user.selectedPlan,
      country: user.country,
      city: user.city,
      tagline: user.tagline,
      aboutSection: user.aboutSection,
    };

    return NextResponse.json({
      user: userData,
    });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
