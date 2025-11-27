import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getUserFromRequest } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-10-29.clover",
});

export async function POST(request: NextRequest) {
  try {
    const origin = request.headers.get("origin") || "https://juzbuild.com";
    // Verify authentication
    const userInfo = getUserFromRequest(request);
    if (!userInfo) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's Stripe customer ID from database
    const db = await getDatabase();
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne({ _id: userInfo.userId });
    if (!user || !user.stripeCustomerId) {
      return NextResponse.json(
        { error: "No billing information found" },
        { status: 400 }
      );
    }

    // Create billing portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${origin}/app/settings`,
    });

    return NextResponse.json({
      url: session.url,
    });
  } catch (error) {
    console.error("Stripe portal error:", error);
    return NextResponse.json(
      { error: "Failed to create billing portal session" },
      { status: 500 }
    );
  }
}
