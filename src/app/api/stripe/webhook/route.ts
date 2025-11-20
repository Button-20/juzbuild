import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");

    if (!signature) {
      console.error("Missing stripe-signature header");
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    if (!webhookSecret) {
      console.error("Missing STRIPE_WEBHOOK_SECRET environment variable");
      return NextResponse.json(
        { error: "Missing webhook secret" },
        { status: 500 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Connect to database
    const db = await getDatabase();
    const usersCollection = db.collection("users");

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.mode === "subscription") {
          const { userId, planId, billingCycle } = session.metadata || {};

          if (userId && planId) {
            try {
              // Update user's plan in database - convert string ID to ObjectId
              const result = await usersCollection.updateOne(
                { _id: new ObjectId(userId) },
                {
                  $set: {
                    selectedPlan: planId,
                    billingCycle: billingCycle || "monthly",
                    stripeCustomerId: session.customer,
                    stripeSubscriptionId: session.subscription,
                    subscriptionStatus: "active",
                    updatedAt: new Date(),
                  },
                }
              );

              if (result.modifiedCount === 0) {
                console.error(
                  `Failed to update user ${userId} - user not found`
                );
              }
            } catch (dbError) {
              console.error(
                `Database update error for user ${userId}:`,
                dbError
              );
            }
          }
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;
        const customerId = invoice.customer as string;

        if (subscriptionId) {
          try {
            // Update subscription status using subscription ID
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
          } catch (dbError) {
            console.error(
              `Database update error for subscription ${subscriptionId}:`,
              dbError
            );
          }
        } else if (customerId) {
          try {
            // If no subscription ID, try updating by customer ID
            await usersCollection.updateOne(
              { stripeCustomerId: customerId },
              {
                $set: {
                  subscriptionStatus: "active",
                  lastPaymentAt: new Date(),
                  updatedAt: new Date(),
                },
              }
            );
          } catch (dbError) {
            console.error(
              `Database update error for customer ${customerId}:`,
              dbError
            );
          }
        }
        break;
      }

      case "invoice_payment.paid": {
        const invoicePayment = event.data.object as any;

        // For invoice_payment.paid events, we need to get the invoice first to find the subscription
        if (invoicePayment.invoice) {
          try {
            const invoice = await stripe.invoices.retrieve(
              invoicePayment.invoice as string
            );
            const subscriptionId = invoice.subscription as string;
            const customerId = invoice.customer as string;

            if (subscriptionId) {
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
            } else if (customerId) {
              await usersCollection.updateOne(
                { stripeCustomerId: customerId },
                {
                  $set: {
                    subscriptionStatus: "active",
                    lastPaymentAt: new Date(),
                    updatedAt: new Date(),
                  },
                }
              );
            }
          } catch (stripeError) {
            console.error(`Error retrieving invoice for payment:`, stripeError);
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        if (subscriptionId) {
          // Update subscription status to past_due
          await usersCollection.updateOne(
            { stripeSubscriptionId: subscriptionId },
            {
              $set: {
                subscriptionStatus: "past_due",
                updatedAt: new Date(),
              },
            }
          );
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Update subscription details
        const updateData: any = {
          subscriptionStatus: subscription.status,
          updatedAt: new Date(),
        };

        // If subscription was canceled
        if (subscription.status === "canceled") {
          updateData.subscriptionCanceledAt = new Date();
        }

        await usersCollection.updateOne(
          { stripeCustomerId: customerId },
          { $set: updateData }
        );

        console.log(
          `Subscription updated for customer ${customerId}: ${subscription.status}`
        );
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Mark subscription as canceled and revert to starter plan
        await usersCollection.updateOne(
          { stripeCustomerId: customerId },
          {
            $set: {
              selectedPlan: "starter",
              subscriptionStatus: "canceled",
              subscriptionCanceledAt: new Date(),
              updatedAt: new Date(),
            },
            $unset: {
              stripeSubscriptionId: "",
            },
          }
        );

        console.log(`Subscription deleted for customer ${customerId}`);
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

        break;
      }

      default:
        // Silently ignore unhandled events
        break;
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
