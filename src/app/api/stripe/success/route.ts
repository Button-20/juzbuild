import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getDatabase } from "@/lib/mongodb";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-10-29.clover",
});

export async function GET(request: NextRequest) {
  try {
    const origin = request.headers.get("origin") || "https://juzbuild.com";
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.redirect(
        `${origin}/app/settings?error=missing_session`
      );
    }

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return NextResponse.redirect(
        `${origin}/app/settings?error=invalid_session`
      );
    }

    // Check if this was a successful subscription purchase
    if (session.mode === "subscription" && session.payment_status === "paid") {
      const { userId, planId } = session.metadata || {};

      if (userId && planId) {
        // Verify the user's plan was updated in the database
        const db = await getDatabase();
        const usersCollection = db.collection("users");

        const user = await usersCollection.findOne({ _id: userId });
        if (user && user.selectedPlan === planId) {
          // Successfully upgraded
          return NextResponse.redirect(
            `${origin}/app/settings?success=upgrade&plan=${planId}`
          );
        }
      }
    }

    // Default redirect with processing status
    return NextResponse.redirect(
      `${origin}/app/settings?status=processing`
    );
  } catch (error) {
    const origin = request.headers.get("origin") || "https://juzbuild.com";
    console.error("Payment success handler error:", error);
    return NextResponse.redirect(
      `${origin}/app/settings?error=processing_failed`
    );
  }
}
