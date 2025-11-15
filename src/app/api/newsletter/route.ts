import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, message: "Valid email is required" },
        { status: 400 }
      );
    }

    const newsletterCollection = await getCollection("newsletter");

    // Check if email already exists
    const existingSubscriber = await newsletterCollection.findOne({ email });
    if (existingSubscriber) {
      return NextResponse.json(
        { success: false, message: "Email already subscribed" },
        { status: 409 }
      );
    }

    // Create new subscriber
    const newSubscriber = {
      email,
      subscribedAt: new Date(),
      isActive: true,
    };

    await newsletterCollection.insertOne(newSubscriber);

    return NextResponse.json(
      { success: true, message: "Successfully subscribed to newsletter!" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to subscribe. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const newsletterCollection = await getCollection("newsletter");

    const subscribers = await newsletterCollection
      .find({ isActive: true }, { projection: { email: 1, subscribedAt: 1 } })
      .sort({ subscribedAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      subscribers,
      total: subscribers.length,
    });
  } catch (error) {
    console.error("Newsletter fetch error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch subscribers" },
      { status: 500 }
    );
  }
}
