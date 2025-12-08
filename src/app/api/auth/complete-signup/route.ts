import { getDatabase } from "@/lib/mongodb";
import { createNotification, NotificationTemplates } from "@/lib/notifications";
import { hash } from "bcryptjs";
import { sign } from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, signupData } = body;

    if (!sessionId || !signupData) {
      return NextResponse.json(
        { error: "Missing session ID or signup data" },
        { status: 400 }
      );
    }

    // Connect to database
    const db = await getDatabase();

    // Verify the Stripe session and get payment info
    const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Payment not completed" },
        { status: 400 }
      );
    }

    // Extract plan info from session metadata
    const { planId, billingCycle } = session.metadata || {};

    // Hash password
    const hashedPassword = await hash(signupData.password, 12);

    // Create user document
    const userId = new ObjectId();
    const userDoc = {
      _id: userId,
      fullName: signupData.fullName,
      email: signupData.email,
      password: hashedPassword,
      companyName: signupData.companyName,
      domainName: signupData.domainName,
      country: signupData.country,
      city: signupData.city,
      tagline: signupData.tagline,
      aboutSection: signupData.aboutSection,
      selectedTheme: signupData.selectedTheme,
      selectedPlan: planId || signupData.selectedPlan,
      billingCycle: billingCycle || signupData.billingCycle,
      phoneNumber: signupData.phoneNumber,
      adsConnections: signupData.adsConnections || [],
      stripeCustomerId: session.customer,
      stripeSubscriptionId: session.subscription,
      subscriptionStatus: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Save or update user in database using upsert
    const usersCollection = db.collection("users");

    let finalUserId = userId;

    try {
      // Try to find existing user first
      const existingUser = await usersCollection.findOne({
        email: signupData.email,
      });

      if (existingUser) {
        console.log("User already exists, updating with subscription info");
        // Update existing user with subscription info
        await usersCollection.updateOne(
          { email: signupData.email },
          {
            $set: {
              stripeCustomerId: session.customer,
              stripeSubscriptionId: session.subscription,
              subscriptionStatus: "active",
              selectedPlan: planId || signupData.selectedPlan,
              billingCycle: billingCycle || signupData.billingCycle,
              updatedAt: new Date(),
            },
          }
        );
        finalUserId = existingUser._id;
      } else {
        // Create new user
        await usersCollection.insertOne(userDoc);
      }
    } catch (error: any) {
      if (error.code === 11000) {
        // Duplicate key error - user was created between our check and insert
        console.log(
          "Duplicate user detected, attempting to update existing user"
        );

        // Wait a bit and try again to avoid race conditions
        await new Promise((resolve) => setTimeout(resolve, 100));

        const existingUser = await usersCollection.findOne({
          email: signupData.email,
        });
        if (existingUser) {
          console.log("Found existing user, updating subscription info");
          await usersCollection.updateOne(
            { email: signupData.email },
            {
              $set: {
                stripeCustomerId: session.customer,
                stripeSubscriptionId: session.subscription,
                subscriptionStatus: "active",
                selectedPlan: planId || signupData.selectedPlan,
                billingCycle: billingCycle || signupData.billingCycle,
                updatedAt: new Date(),
              },
            }
          );
          finalUserId = existingUser._id;
        } else {
          // This shouldn't happen, but let's handle it gracefully
          console.error(
            "User exists but could not be found after duplicate error"
          );
          throw new Error(
            "User account creation conflict - please try again or contact support"
          );
        }
      } else {
        throw error; // Re-throw other errors
      }
    }

    // Create onboarding record if it doesn't exist (payment flow bypasses signup-onboarding API)
    const onboardingCollection = db.collection("onboarding");
    try {
      const existingOnboarding = await onboardingCollection.findOne({
        userId: finalUserId.toString(),
      });

      if (!existingOnboarding) {
        console.log(
          "No onboarding record found, creating one for user:",
          finalUserId.toString()
        );
        const onboardingRecord = {
          userId: finalUserId.toString(),
          // Only onboarding-specific fields (not plan data which is in user record)
          logoUrl: signupData.logoUrl,
          darkModeLogoUrl: signupData.darkModeLogoUrl,
          faviconUrl: signupData.faviconUrl,
          brandColors: signupData.brandColors || [],
          propertyTypes: signupData.propertyTypes || [],
          includedPages: signupData.includedPages || [],
          leadCaptureMethods: signupData.leadCaptureMethods || [],
          geminiApiKey: signupData.geminiApiKey || null,
          adsConnections: signupData.adsConnections || [],
          preferredContactMethod: signupData.preferredContactMethod || [],
          agreeToTerms: signupData.agreeToTerms || true, // Default to true since payment was completed
          paymentMethod: signupData.paymentMethod || "stripe", // Default to stripe since payment went through Stripe
          // Onboarding metadata
          createdAt: new Date(),
          ipAddress:
            request.headers.get("x-forwarded-for") ||
            request.headers.get("x-real-ip") ||
            "unknown",
          userAgent: request.headers.get("user-agent") || "unknown",
          status: "completed",
        };

        await onboardingCollection.insertOne(onboardingRecord);
        console.log(
          "Onboarding record created successfully for user:",
          finalUserId.toString()
        );
      } else {
        console.log(
          "Onboarding record already exists for user:",
          finalUserId.toString()
        );
      }
    } catch (onboardingError) {
      console.error("Failed to handle onboarding record:", onboardingError);
      // Don't fail the whole process, but log the error
    }

    // Create welcome notification for new user
    try {
      await createNotification({
        ...NotificationTemplates.WELCOME,
        userId: finalUserId.toString(),
        message: `Welcome to Juzbuild, ${signupData.fullName}! 🎉 Your account has been successfully created. Start by completing your onboarding to get your website live.`,
        preventDuplicates: true,
      });
    } catch (notifError) {
      console.error("Failed to create welcome notification:", notifError);
    }

    // Create JWT token
    const token = sign(
      {
        userId: finalUserId.toString(),
        email: signupData.email,
        companyName: signupData.companyName,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    // Set HTTP-only cookie and return success
    // Website creation will be handled by the frontend on the deployment page
    const response = NextResponse.json({
      success: true,
      user: {
        id: finalUserId.toString(),
        email: signupData.email,
        fullName: signupData.fullName,
        selectedPlan: planId || signupData.selectedPlan,
      },
      signupData: signupData, // Pass signup data so frontend can create website
      accountCreated: true,
    });

    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Post-payment signup error:", error);
    return NextResponse.json(
      { error: "Failed to complete signup after payment" },
      { status: 500 }
    );
  }
}
