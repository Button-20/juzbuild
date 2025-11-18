import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { hash } from "bcryptjs";
import { nanoid } from "nanoid";
import { sign } from "jsonwebtoken";

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
    const { db } = await connectDB();

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
    const userId = nanoid();
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

    // Save user to database
    const usersCollection = db.collection("users");
    await usersCollection.insertOne(userDoc);

    // Create JWT token
    const token = sign(
      {
        userId: userId,
        email: signupData.email,
        fullName: signupData.fullName,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    // Create website creation payload
    const websiteData = {
      companyName: signupData.companyName,
      domainName: signupData.domainName,
      selectedTheme: signupData.selectedTheme || "homely",
      brandColors: signupData.brandColors || [],
      propertyTypes: signupData.propertyTypes || [],
      includedPages: signupData.includedPages || [],
      tagline: signupData.tagline,
      aboutSection: signupData.aboutSection,
      leadCaptureMethods: signupData.leadCaptureMethods || [],
      preferredContactMethod: signupData.preferredContactMethod || [],
      geminiApiKey: signupData.geminiApiKey,
    };

    // Create the website (similar to existing website creation logic)
    const websiteResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/websites`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(websiteData),
      }
    );

    if (!websiteResponse.ok) {
      console.error("Website creation failed:", await websiteResponse.text());
      // User is created but website failed - they can retry from dashboard
      return NextResponse.json({
        success: true,
        user: { id: userId, email: signupData.email },
        token: token,
        websiteCreated: false,
        message:
          "Account created successfully. Website creation can be retried from dashboard.",
      });
    }

    const websiteResult = await websiteResponse.json();

    // Set HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: userId,
        email: signupData.email,
        fullName: signupData.fullName,
        selectedPlan: planId || signupData.selectedPlan,
      },
      website: websiteResult,
      websiteCreated: true,
    });

    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
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
