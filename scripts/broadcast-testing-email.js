#!/usr/bin/env node

/**
 * Broadcast Testing Invitation Email Script
 *
 * This script sends the JuzBuild testing invitation email to all users in the waitlist collection
 * with the testing checklist attached.
 *
 * Usage: node scripts/broadcast-testing-email.js
 */

const { MongoClient } = require("mongodb");
const { Resend } = require("resend");
const fs = require("fs");
const path = require("path");
const handlebars = require("handlebars");

// Configuration
const MONGODB_URI =
  "mongodb+srv://jason:admin@covcast.3ds5z.mongodb.net/ICanvas_Solutions?retryWrites=true&w=majority&appName=Covcast";
const RESEND_API_KEY =
  process.env.RESEND_API_KEY || "re_Eeh4yPHJ_PjYZ3bg2kYTmYDuTwDwJLJd4";
const RESEND_FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "noreply@juzbuild.com";
const CHECKLIST_PATH =
  "c:\\Users\\SoundIt\\Downloads\\JuzBuild_Testing_Checklist_Complete.docx";
const STAGING_URL = "https://dev.juzbuild.com";
const REPLY_TO_EMAIL = "icanvassolutions@gmail.com";

// Email template HTML
const emailTemplateHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JuzBuild App Testing - Volunteer Tester Invitation</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 20px;
            text-align: center;
        }
        .header h1 {
            font-size: 28px;
            margin-bottom: 10px;
            font-weight: 700;
        }
        .header p {
            font-size: 14px;
            opacity: 0.9;
        }
        .content {
            padding: 40px 30px;
        }
        .greeting {
            font-size: 16px;
            margin-bottom: 20px;
            color: #333;
        }
        .section {
            margin-bottom: 30px;
        }
        .section-title {
            font-size: 18px;
            font-weight: 700;
            color: #667eea;
            margin-bottom: 12px;
            border-bottom: 2px solid #667eea;
            padding-bottom: 8px;
        }
        .section-content {
            font-size: 14px;
            line-height: 1.8;
            color: #555;
        }
        .section-content p {
            margin-bottom: 12px;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 14px 32px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            font-size: 14px;
            margin: 20px 0;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }
        .checklist-info {
            background-color: #f0f4ff;
            border-left: 4px solid #667eea;
            padding: 16px;
            margin: 20px 0;
            border-radius: 4px;
            font-size: 14px;
        }
        .checklist-info strong {
            color: #667eea;
        }
        .testing-options {
            background-color: #f9f9f9;
            border: 1px solid #e0e0e0;
            padding: 20px;
            border-radius: 6px;
            margin: 20px 0;
        }
        .testing-options h3 {
            font-size: 16px;
            font-weight: 600;
            color: #333;
            margin-bottom: 15px;
        }
        .option {
            margin-bottom: 15px;
            padding: 12px;
            background-color: #ffffff;
            border-radius: 4px;
            border-left: 3px solid #764ba2;
        }
        .option-title {
            font-weight: 600;
            color: #764ba2;
            margin-bottom: 6px;
        }
        .option-desc {
            font-size: 13px;
            color: #666;
            line-height: 1.6;
        }
        .credentials {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 16px;
            margin: 20px 0;
            border-radius: 4px;
            font-size: 13px;
        }
        .credentials strong {
            color: #d39e00;
        }
        .credentials code {
            background-color: #fffbf0;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
            color: #d39e00;
        }
        .contact-section {
            background-color: #e8f4f8;
            border-left: 4px solid #17a2b8;
            padding: 16px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .contact-section h3 {
            font-size: 14px;
            font-weight: 600;
            color: #17a2b8;
            margin-bottom: 8px;
        }
        .contact-section p {
            font-size: 13px;
            color: #555;
            margin-bottom: 6px;
        }
        .email-link {
            color: #17a2b8;
            text-decoration: none;
            font-weight: 600;
        }
        .email-link:hover {
            text-decoration: underline;
        }
        .footer {
            background-color: #f5f5f5;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #999;
            border-top: 1px solid #e0e0e0;
        }
        .footer-links {
            margin-top: 10px;
        }
        .footer-links a {
            color: #667eea;
            text-decoration: none;
            margin: 0 10px;
        }
        .footer-links a:hover {
            text-decoration: underline;
        }
        .highlight {
            color: #764ba2;
            font-weight: 600;
        }
        .icon {
            display: inline-block;
            margin-right: 8px;
        }
        ul {
            margin-left: 20px;
            margin-bottom: 12px;
        }
        ul li {
            margin-bottom: 8px;
        }
        .divider {
            border: 0;
            height: 1px;
            background-color: #e0e0e0;
            margin: 30px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>🚀 Welcome to JuzBuild Testing!</h1>
            <p>Help us build something amazing</p>
        </div>

        <!-- Main Content -->
        <div class="content">
            <div class="greeting">
                <p>Hello {{firstName}}! 👋</p>
                <p>Thank you so much for your interest in <span class="highlight">JuzBuild</span> – our next-generation website builder for real estate professionals!</p>
                <p>We'd love for you to be part of our beta testing program!</p>
            </div>

            <!-- Overview Section -->
            <div class="section">
                <div class="section-title">📋 About JuzBuild</div>
                <div class="section-content">
                    <p>JuzBuild is a powerful platform that allows real estate agents and brokers to:</p>
                    <ul>
                        <li>Create professional websites in minutes</li>
                        <li>Manage properties and listings</li>
                        <li>Capture and manage leads</li>
                        <li>Integrate with marketing platforms (Google Ads, Facebook, Instagram)</li>
                        <li>Access advanced analytics and reporting</li>
                    </ul>
                </div>
            </div>

            <hr class="divider">

            <!-- Testing Instructions -->
            <div class="section">
                <div class="section-title">🎯 How to Test</div>
                <div class="testing-options">
                    <h3>Choose Your Testing Approach:</h3>
                    
                    <div class="option">
                        <div class="option-title">✅ Option 1: Use the Comprehensive Checklist (Recommended)</div>
                        <div class="option-desc">
                            We've prepared a detailed testing checklist covering all features, functionality, and edge cases. This ensures comprehensive coverage of all app features.
                            <br><br>
                            <strong>The checklist includes:</strong>
                            <ul style="margin-top: 8px; margin-left: 16px;">
                                <li>Authentication & Onboarding</li>
                                <li>Dashboard & Settings</li>
                                <li>Website Generation & Features</li>
                                <li>Form Functionality & Validation</li>
                                <li>Integrations & External Services</li>
                                <li>Error Handling & Edge Cases</li>
                                <li>Performance & Browser Compatibility</li>
                                <li>And much more...</li>
                            </ul>
                        </div>
                    </div>

                    <div class="option">
                        <div class="option-title">🔍 Option 2: Exploratory Testing</div>
                        <div class="option-desc">
                            Feel free to explore the app freely and test beyond the checklist scope. Test user flows, edge cases, and any areas you find interesting. Your fresh perspective is valuable!
                        </div>
                    </div>

                    <div class="option">
                        <div class="option-title">🎪 Option 3: Both Approaches</div>
                        <div class="option-desc">
                            Start with the checklist to ensure comprehensive coverage, then explore beyond it. This gives us both structured testing and creative exploration.
                        </div>
                    </div>
                </div>
            </div>

            <!-- Access Information -->
            <div class="section">
                <div class="section-title">🔐 Getting Started</div>
                <div class="credentials">
                    <strong>📍 Staging Environment URL:</strong>
                    <br>
                    <code>{{stagingUrl}}</code>
                    <br><br>
                    <strong>📝 Create a Test Account:</strong>
                    <br>
                    Simply sign up with any email address during the signup flow. You'll go through the complete onboarding process which will help you understand the app better.
                    <br><br>
                    <strong>💡 Tip:</strong> Use unique test emails for each account (e.g., test-1@example.com, test-2@example.com) to test multiple scenarios.
                </div>
            </div>

            <!-- What to Look For -->
            <div class="section">
                <div class="section-title">🔍 Key Areas to Focus On</div>
                <div class="section-content">
                    <ul>
                        <li><strong>Functionality:</strong> Do all features work as expected?</li>
                        <li><strong>User Experience:</strong> Is the interface intuitive and user-friendly?</li>
                        <li><strong>Performance:</strong> Is the app fast and responsive?</li>
                        <li><strong>Error Handling:</strong> Do error messages appear when something goes wrong?</li>
                        <li><strong>Data Validation:</strong> Does the app properly validate user input?</li>
                        <li><strong>Responsiveness:</strong> Does the app work well on mobile, tablet, and desktop?</li>
                        <li><strong>Cross-browser:</strong> Test on Chrome, Firefox, Safari, and Edge if possible</li>
                    </ul>
                </div>
            </div>

            <!-- Reporting Bugs -->
            <div class="section">
                <div class="section-title">🐛 How to Report Issues</div>
                <div class="contact-section">
                    <h3>📧 Send Your Feedback & Bug Reports To:</h3>
                    <p><a href="mailto:{{replyToEmail}}" class="email-link">{{replyToEmail}}</a></p>
                    <p style="margin-top: 12px; font-size: 13px;">
                        <strong>Please include:</strong>
                    </p>
                    <ul style="margin-left: 16px; font-size: 13px;">
                        <li>What you were testing (feature/page)</li>
                        <li>What you expected to happen</li>
                        <li>What actually happened</li>
                        <li>Steps to reproduce the issue</li>
                        <li>Your browser and device information</li>
                        <li>Screenshots or screen recordings (if applicable)</li>
                    </ul>
                </div>
            </div>

            <!-- Downloadable Checklist -->
            <div class="checklist-info">
                <strong>📥 Testing Checklist Attached:</strong>
                <p style="margin-top: 8px; font-size: 13px;">
                    A detailed checklist document is attached to this email. You can use it to systematically test all features of the application. Each item can be marked as passed/failed.
                </p>
            </div>

            <!-- Thank You -->
            <div class="section" style="text-align: center;">
                <p style="font-size: 16px; color: #667eea; font-weight: 600;">
                    🙏 Thank You for Your Time & Effort!
                </p>
                <p style="margin-top: 12px; color: #666; font-size: 14px;">
                    Your feedback is invaluable in helping us create the best real estate website builder on the market.
                </p>
            </div>

            <!-- CTA Button -->
            <div style="text-align: center;">
                <a href="{{stagingUrl}}" class="cta-button">Start Testing Now →</a>
            </div>

            <p style="text-align: center; margin-top: 20px; font-size: 13px; color: #999;">
                Questions? Reply to this email or contact us at <a href="mailto:{{replyToEmail}}" style="color: #667eea; text-decoration: none;">{{replyToEmail}}</a>
            </p>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>© {{currentYear}} JuzBuild. All rights reserved.</p>
            <div class="footer-links">
                <a href="{{stagingUrl}}">Staging Environment</a>
                <a href="mailto:{{replyToEmail}}">Support</a>
            </div>
            <p style="margin-top: 15px; font-size: 11px; color: #bbb;">
                This is a testing invitation. Please do not share this link with others.
            </p>
        </div>
    </div>
</body>
</html>`;

// Main function
async function broadcastTestingEmail() {
  console.log("🚀 Starting JuzBuild Testing Email Broadcast...\n");

  // Validate environment
  if (!RESEND_API_KEY) {
    console.error("❌ Error: RESEND_API_KEY environment variable is not set");
    console.error("   Please set: export RESEND_API_KEY=your_api_key_here\n");
    process.exit(1);
  }

  // Check if checklist file exists
  if (!fs.existsSync(CHECKLIST_PATH)) {
    console.error(`❌ Error: Checklist file not found at ${CHECKLIST_PATH}`);
    process.exit(1);
  }

  const resend = new Resend(RESEND_API_KEY);
  let mongoClient;
  let successCount = 0;
  let failureCount = 0;
  const failedEmails = [];

  try {
    // Connect to MongoDB
    console.log("📡 Connecting to MongoDB...");
    mongoClient = new MongoClient(MONGODB_URI);
    await mongoClient.connect();
    console.log("✅ Connected to MongoDB\n");

    // Get waitlist collection
    const db = mongoClient.db("ICanvas_Solutions");
    const waitlistCollection = db.collection("waitlist");

    // Fetch all waitlist users
    console.log("📋 Fetching waitlist users...");
    const waitlistUsers = await waitlistCollection.find({}).toArray();
    console.log(`✅ Found ${waitlistUsers.length} waitlist users\n`);

    if (waitlistUsers.length === 0) {
      console.log("⚠️  No users found in waitlist collection");
      return;
    }

    // Read checklist file and convert to base64
    console.log("📎 Reading checklist attachment...");
    const checklistBuffer = fs.readFileSync(CHECKLIST_PATH);
    const checklistBase64 = checklistBuffer.toString("base64");
    const checklistFileName = path.basename(CHECKLIST_PATH);
    console.log(
      `✅ Checklist loaded (${(checklistBuffer.length / 1024 / 1024).toFixed(
        2
      )} MB)\n`
    );

    // Compile template
    const template = handlebars.compile(emailTemplateHTML);

    // Send emails
    console.log(`📧 Sending emails to ${waitlistUsers.length} users...\n`);
    console.log("=".repeat(70));

    for (let i = 0; i < waitlistUsers.length; i++) {
      const user = waitlistUsers[i];
      const email = user.email;
      const firstName =
        user.firstName || user.fullName?.split(" ")[0] || "Tester";

      // Prepare template data
      const templateData = {
        firstName,
        stagingUrl: STAGING_URL,
        replyToEmail: REPLY_TO_EMAIL,
        currentYear: new Date().getFullYear().toString(),
      };

      // Compile HTML
      const html = template(templateData);

      try {
        // Send email via Resend with attachment
        const response = await resend.emails.send({
          from: RESEND_FROM_EMAIL,
          to: email,
          replyTo: REPLY_TO_EMAIL,
          subject: "🚀 Join Our Beta Testing Program - JuzBuild",
          html: html,
          attachments: [
            {
              filename: checklistFileName,
              content: checklistBase64,
            },
          ],
        });

        if (response.error) {
          throw new Error(response.error.message);
        }

        successCount++;
        console.log(
          `[${i + 1}/${waitlistUsers.length}] ✅ Sent to: ${email} (ID: ${
            response.data?.id
          })`
        );
      } catch (error) {
        failureCount++;
        failedEmails.push({
          email,
          error: error.message,
        });
        console.log(
          `[${i + 1}/${waitlistUsers.length}] ❌ Failed to send to: ${email}`
        );
        console.log(`                Error: ${error.message}\n`);
      }

      // Add delay to avoid rate limiting (100ms between emails)
      if (i < waitlistUsers.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    console.log("\n" + "=".repeat(70));
    console.log("\n📊 Broadcast Summary:");
    console.log(`   Total Users: ${waitlistUsers.length}`);
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ❌ Failed: ${failureCount}`);
    console.log(
      `   Success Rate: ${((successCount / waitlistUsers.length) * 100).toFixed(
        1
      )}%`
    );

    if (failedEmails.length > 0) {
      console.log("\n⚠️  Failed Email Details:");
      failedEmails.forEach((item) => {
        console.log(`   - ${item.email}: ${item.error}`);
      });
    }

    console.log("\n✨ Broadcast complete!");
  } catch (error) {
    console.error("❌ Fatal Error:", error.message);
    process.exit(1);
  } finally {
    // Cleanup
    if (mongoClient) {
      await mongoClient.close();
      console.log("\n🔌 Disconnected from MongoDB");
    }
  }
}

// Run the script
broadcastTestingEmail().catch((error) => {
  console.error("❌ Script failed:", error);
  process.exit(1);
});
