#!/usr/bin/env node

/**
 * Quick Test Email Script
 *
 * Sends a test email to verify Resend configuration
 */

const { Resend } = require("resend");
const handlebars = require("handlebars");
const fs = require("fs");
const path = require("path");

const RESEND_API_KEY = "re_Eeh4yPHJ_PjYZ3bg2kYTmYDuTwDwJLJd4";
const FROM_EMAIL = "noreply@juzbuild.com";
const TO_EMAIL = "jasonaddy51@gmail.com";
const STAGING_URL = "https://dev.juzbuild.com";
const REPLY_TO_EMAIL = "icanvassolutions@gmail.com";
const CHECKLIST_PATH =
  "c:\\Users\\SoundIt\\Downloads\\JuzBuild_Testing_Checklist_Complete.docx";

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
        .highlight {
            color: #764ba2;
            font-weight: 600;
        }
        ul {
            margin-left: 20px;
            margin-bottom: 12px;
        }
        ul li {
            margin-bottom: 8px;
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

            <!-- Access Information -->
            <div class="section">
                <div class="section-title">🔐 Getting Started</div>
                <div class="section-content">
                    <p><strong>📍 Staging Environment URL:</strong></p>
                    <p style="color: #667eea; font-weight: 600;">{{stagingUrl}}</p>
                    <p style="margin-top: 16px;"><strong>📝 Create a Test Account:</strong></p>
                    <p>Simply sign up with any email address during the signup flow. You'll go through the complete onboarding process which will help you understand the app better.</p>
                </div>
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
                This is a testing invitation for JuzBuild beta program.
            </p>
        </div>
    </div>
</body>
</html>`;

async function sendTestEmail() {
  console.log("🚀 Sending Test Email...\n");

  try {
    const resend = new Resend(RESEND_API_KEY);

    // Check if checklist file exists
    if (!fs.existsSync(CHECKLIST_PATH)) {
      console.error(`❌ Error: Checklist file not found at ${CHECKLIST_PATH}`);
      process.exit(1);
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

    // Prepare template data
    const templateData = {
      firstName: "Jason",
      stagingUrl: STAGING_URL,
      replyToEmail: REPLY_TO_EMAIL,
      currentYear: new Date().getFullYear().toString(),
    };

    // Compile HTML
    const html = template(templateData);

    console.log(`📧 Sending email...`);
    console.log(`   From: ${FROM_EMAIL}`);
    console.log(`   To: ${TO_EMAIL}`);
    console.log(`   Subject: 🚀 Join Our Beta Testing Program - JuzBuild\n`);

    const response = await resend.emails.send({
      from: FROM_EMAIL,
      to: TO_EMAIL,
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

    console.log("✅ Email sent successfully!");
    console.log(`   Email ID: ${response.data?.id}`);
    console.log(`   Attachment: ${checklistFileName}`);
    console.log(`\n📨 Status: Delivered`);
    console.log(`   Check your inbox at ${TO_EMAIL} for the email.`);
  } catch (error) {
    console.error("❌ Error sending email:", error.message);
    process.exit(1);
  }
}

sendTestEmail();
