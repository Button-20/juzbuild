import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { connectDB } from "@/lib/mongodb";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature")!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Connect to database
    const { db } = await connectDB();
    const usersCollection = db.collection("users");

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.mode === "subscription") {
          const { userId, planId, billingCycle } = session.metadata || {};

          if (userId && planId) {
            // Update user's plan in database
            await usersCollection.updateOne(
              { _id: userId },
              {
                $set: {
                  selectedPlan: planId,
                  billingCycle: billingCycle,
                  stripeCustomerId: session.customer,
                  stripeSubscriptionId: session.subscription,
                  subscriptionStatus: "active",
                  updatedAt: new Date(),
                },
              }
            );

            console.log(
              `Successfully updated user ${userId} plan to ${planId}`
            );
          }
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        if (subscriptionId) {
          // Update subscription status
          await usersCollection.updateOne(
            { stripeSubscriptionId: subscriptionId },
            {
              $set: {
                subscriptionStatus: "active",
                lastPaymentAt: new Date(),
                updatedAt: new Date(),
              },
            }
          );

          console.log(`Payment succeeded for subscription ${subscriptionId}`);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        if (subscriptionId) {
          // Update subscription status
          await usersCollection.updateOne(
            { stripeSubscriptionId: subscriptionId },
            {
              $set: {
                subscriptionStatus: "past_due",
                updatedAt: new Date(),
              },
            }
          );

          console.log(`Payment failed for subscription ${subscriptionId}`);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        // Update user's subscription status
        await usersCollection.updateOne(
          { stripeSubscriptionId: subscription.id },
          {
            $set: {
              subscriptionStatus: "cancelled",
              updatedAt: new Date(),
            },
          }
        );

        console.log(`Subscription cancelled: ${subscription.id}`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
