import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { PRICING_PLANS } from "@/constants/pricing";
import { getUserFromRequest } from "@/lib/auth";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { planId, billingCycle, isSignup = false, customerEmail } = body;

    // For existing users (upgrades), verify authentication
    // For signup flow, skip authentication check
    let userInfo = null;
    if (!isSignup) {
      userInfo = getUserFromRequest(request);
      if (!userInfo) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    // Validate input
    if (!planId || !billingCycle) {
      return NextResponse.json(
        { error: "Missing required fields: planId, billingCycle" },
        { status: 400 }
      );
    }

    // Find the plan
    const plan = PRICING_PLANS.find((p) => p.id === planId);
    if (!plan) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    // Calculate price based on billing cycle
    const price =
      billingCycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
    const interval = billingCycle === "yearly" ? "year" : "month";

    // Determine customer email and user ID for metadata
    const email = isSignup ? customerEmail : userInfo?.email;
    const userId = isSignup ? null : userInfo?.userId;

    // Create Stripe checkout session
    const sessionData: any = {
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${plan.name} Plan`,
              description: plan.description,
            },
            unit_amount: price * 100, // Stripe expects cents
            recurring: {
              interval: interval,
            },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: isSignup
        ? `${process.env.NEXT_PUBLIC_APP_URL}/signup/payment-status?session_id={CHECKOUT_SESSION_ID}`
        : `${process.env.NEXT_PUBLIC_APP_URL}/api/stripe/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: isSignup
        ? `${process.env.NEXT_PUBLIC_APP_URL}/signup`
        : `${process.env.NEXT_PUBLIC_APP_URL}/app/settings?canceled=true`,
      metadata: {
        planId: planId,
        billingCycle: billingCycle,
        isSignup: isSignup.toString(),
      },
      subscription_data: {
        metadata: {
          planId: planId,
          billingCycle: billingCycle,
          isSignup: isSignup.toString(),
        },
      },
    };

    // Add customer email if available
    if (email) {
      sessionData.customer_email = email;
    }

    // Add userId to metadata for existing users
    if (userId) {
      sessionData.metadata.userId = userId;
      sessionData.subscription_data.metadata.userId = userId;
    }

    const session = await stripe.checkout.sessions.create(sessionData);

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
