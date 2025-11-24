import { getDatabase } from "@/lib/mongodb";
import { createNotification, NotificationTemplates } from "@/lib/notifications";
import { ObjectId } from "mongodb";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-10-29.clover",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");

    if (!signature) {
      console.error("Webhook error: Missing stripe-signature header");
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    if (!webhookSecret) {
      console.error("Webhook error: Missing STRIPE_WEBHOOK_SECRET environment variable");
      return NextResponse.json(
        { error: "Missing webhook secret" },
        { status: 500 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook error: Signature verification failed:", err);
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
          const { userId, planId, billingCycle, isSignup } = session.metadata || {};

          // For signup flow (new users)
          if (isSignup === "true" && !userId && session.customer_email) {
            try {
              // Update user by email to add Stripe subscription details
              const result = await usersCollection.updateOne(
                { email: session.customer_email.toLowerCase() },
                {
                  $set: {
                    stripeCustomerId: session.customer,
                    stripeSubscriptionId: session.subscription,
                    subscriptionStatus: "active",
                    selectedPlan: planId || "starter",
                    billingCycle: billingCycle || "monthly",
                    updatedAt: new Date(),
                  },
                }
              );

              if (result.modifiedCount === 0) {
                console.error(
                  `Webhook error: No user found with email ${session.customer_email}`
                );
              } else {
                // Create notification for successful signup
                try {
                  const user = await usersCollection.findOne({
                    email: session.customer_email.toLowerCase(),
                  });
                  if (user) {
                    await createNotification({
                      ...NotificationTemplates.WELCOME,
                      userId: user._id.toString(),
                      message: `Welcome to Juzbuild! Your ${planId || "starter"} plan subscription has been activated. Start building your website now!`,
                      preventDuplicates: true,
                    });
                  }
                } catch (notifError) {
                  console.error(
                    "Webhook error: Failed to create welcome notification:",
                    notifError
                  );
                }
              }
            } catch (dbError) {
              console.error(
                `❌ [WEBHOOK] Database update error for email ${session.customer_email}:`,
                dbError
              );
            }
          }
          // For existing user upgrades
          else if (userId && planId) {
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
                  `Webhook error: Failed to update user ${userId}`
                );
              } else {
                // Create notification for successful plan upgrade
                try {
                  await createNotification({
                    ...NotificationTemplates.PLAN_UPGRADED,
                    userId: userId,
                    message: `Your subscription has been upgraded to ${planId} plan. You now have access to new features and increased limits.`,
                  });
                } catch (notifError) {
                  console.error(
                    "Webhook error: Failed to create upgrade notification:",
                    notifError
                  );
                }
              }
            } catch (dbError) {
              console.error(
                `Webhook error: Database update for user ${userId}:`,
                dbError
              );
            }
          }
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.id as string;
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
            const subscriptionId = invoice.id as string;
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
        const subscriptionId = invoice.id as string;

        if (subscriptionId) {
          // Update subscription status to past_due
          const result = await usersCollection.updateOne(
            { stripeSubscriptionId: subscriptionId },
            {
              $set: {
                subscriptionStatus: "past_due",
                updatedAt: new Date(),
              },
            }
          );

          // Create notification for payment failure
          if (result.modifiedCount > 0) {
            try {
              const user = await usersCollection.findOne({
                stripeSubscriptionId: subscriptionId,
              });
              if (user) {
                await createNotification({
                  ...NotificationTemplates.PAYMENT_FAILED,
                  userId: user._id.toString(),
                });
              }
            } catch (notifError) {
              console.error(
                "Failed to create payment failed notification:",
                notifError
              );
            }
          }
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

        const result = await usersCollection.updateOne(
          { stripeCustomerId: customerId },
          { $set: updateData }
        );

        // Get the user to create personalized notification
        const user = await usersCollection.findOne({
          stripeCustomerId: customerId,
        });

        if (user && result.matchedCount > 0) {
          // Create notification for subscription update
          if (subscription.status === "active") {
            // Determine the plan based on subscription items
            let planName = "Pro";
            if (subscription.items.data.length > 0) {
              const priceId = subscription.items.data[0].price.id;
              // Map price ID to plan name (adjust based on your pricing)
              if (priceId.includes("starter")) planName = "Starter";
              else if (priceId.includes("pro")) planName = "Pro";
              else if (priceId.includes("premium")) planName = "Premium";
            }

            await createNotification({
              ...NotificationTemplates.PLAN_UPGRADED,
              userId: user._id.toString(),
              message: `Great news, ${user.fullName}! Your subscription to the ${planName} plan is now active. Enjoy your enhanced features!`,
              actionUrl: "/app/dashboard",
              actionText: "View Dashboard",
              metadata: {
                planName,
                subscriptionId: subscription.id,
                customerId: customerId,
              },
            });
          } else if (subscription.status === "canceled") {
            await createNotification({
              ...NotificationTemplates.PAYMENT_FAILED,
              userId: user._id.toString(),
              title: "Subscription Canceled",
              message: `Hi ${user.fullName}, your subscription has been canceled. You can reactivate it anytime from your settings.`,
              type: "warning" as const,
              category: "billing" as const,
              actionUrl: "/app/settings",
              actionText: "Manage Subscription",
            });
          }
        }

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
        const subscriptionId = invoice.id as string;

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
        const result = await usersCollection.updateOne(
          { stripeSubscriptionId: subscription.id },
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

        // Create notification for subscription cancellation
        if (result.modifiedCount > 0) {
          try {
            const user = await usersCollection.findOne({
              $or: [
                { stripeSubscriptionId: subscription.id },
                { stripeCustomerId: subscription.customer },
              ],
            });
            if (user) {
              await createNotification({
                ...NotificationTemplates.SUBSCRIPTION_CANCELED,
                userId: user._id.toString(),
              });
            }
          } catch (notifError) {
            console.error(
              "Failed to create cancellation notification:",
              notifError
            );
          }
        }
        break;
      }

      default:
        // Silently ignore unhandled events
        break;
    }

    console.log(`✅ [WEBHOOK] Event ${event.type} processed successfully`);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("❌ [WEBHOOK] Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
