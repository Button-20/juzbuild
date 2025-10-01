#!/usr/bin/env node
/**
 * Generate a new email template file
 * Usage: npm run create-template <template-name> [title]
 */

const fs = require("fs");
const path = require("path");

function createTemplate(templateName, title) {
  const fileName = `${templateName}.ts`;
  const filePath = path.join(
    __dirname,
    "..",
    "src",
    "lib",
    "templates",
    fileName
  );

  if (fs.existsSync(filePath)) {
    console.error(`❌ Template file already exists: ${fileName}`);
    process.exit(1);
  }

  const camelCaseName =
    templateName.replace(/-([a-z])/g, (g) => g[1].toUpperCase()) + "Template";
  const displayTitle =
    title ||
    templateName.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

  const templateContent = `export const ${camelCaseName} = \`<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>${displayTitle}</title>
    <style>
      /* Reset and base styles */
      body, table, td, p, a, li, blockquote {
        -webkit-text-size-adjust: 100%;
        -ms-text-size-adjust: 100%;
      }
      
      /* Base styles */
      body {
        margin: 0 !important;
        padding: 0 !important;
        background-color: #0f0f0f;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      
      /* Container */
      .email-container {
        max-width: 600px;
        margin: 0 auto;
        background-color: #1a1a1a;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
      }
      
      /* Header */
      .email-header {
        background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
        padding: 40px 30px;
        text-align: center;
      }
      
      .logo {
        font-size: 22px;
        font-weight: 700;
        color: #ffffff;
        margin: 0;
      }
      
      /* Content */
      .email-content {
        padding: 40px 30px;
        color: #ffffff;
      }
      
      .content-title {
        font-size: 24px;
        font-weight: 700;
        color: #ffffff;
        margin: 0 0 16px 0;
      }
      
      .content-message {
        font-size: 15px;
        line-height: 1.6;
        color: #e5e7eb;
        margin: 0 0 30px 0;
      }
      
      /* CTA Button */
      .cta-button {
        display: inline-block;
        background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
        color: #ffffff;
        text-decoration: none;
        padding: 14px 28px;
        border-radius: 8px;
        font-weight: 600;
        font-size: 14px;
        text-align: center;
        margin: 30px 0;
      }
      
      /* Footer */
      .email-footer {
        background-color: #0f0f0f;
        padding: 30px;
        text-align: center;
        color: #9ca3af;
        font-size: 12px;
      }
      
      /* Responsive */
      @media only screen and (max-width: 600px) {
        .email-container {
          margin: 10px;
          border-radius: 8px;
        }
        
        .email-header,
        .email-content,
        .email-footer {
          padding: 20px;
        }
        
        .content-title {
          font-size: 22px;
        }
        
        .content-message {
          font-size: 14px;
        }
      }
    </style>
  </head>
  <body>
    <div style="background-color: #0f0f0f; padding: 40px 20px;">
      <div class="email-container">
        <!-- Header -->
        <div class="email-header">
          <h1 class="logo">Juzbuild</h1>
        </div>

        <!-- Content -->
        <div class="email-content">
          <h2 class="content-title">${displayTitle}</h2>

          <p class="content-message">
            Hi {{email}},<br><br>
            <!-- Add your email content here -->
            <!-- Use {{variableName}} for dynamic content -->
          </p>

          <!-- Optional CTA Button -->
          <div style="text-align: center;">
            <a href="{{actionUrl}}" class="cta-button">
              Take Action
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div class="email-footer">
          <p>© {{currentYear}} Juzbuild. All rights reserved.</p>
          
          <!-- Optional unsubscribe -->
          <p style="margin-top: 20px;">
            <a href="{{unsubscribeUrl}}" style="color: #9ca3af;">Unsubscribe</a>
          </p>
        </div>
      </div>
    </div>
  </body>
</html>\`;`;

  fs.writeFileSync(filePath, templateContent, "utf8");

  console.log(`✅ Created template file: ${fileName}`);
  console.log(`📝 Template variable name: ${camelCaseName}`);
  console.log(`🔧 Next steps:`);
  console.log(`   1. Edit ${fileName} to customize your template`);
  console.log(
    `   2. Add '${templateName}': ${camelCaseName} to src/lib/templates/index.ts`
  );
  console.log(`   3. Import ${camelCaseName} in the index file`);
  console.log(
    `   4. Use the template with sendTemplateEmail('${templateName}', ...)`
  );
}

// Main execution
const templateName = process.argv[2];
const title = process.argv[3];

if (!templateName) {
  console.error("Usage: npm run create-template <template-name> [title]");
  console.error(
    'Example: npm run create-template user-verification "Verify Your Email"'
  );
  process.exit(1);
}

// Validate template name
if (!/^[a-z]([a-z0-9-]*[a-z0-9])?$/.test(templateName)) {
  console.error(
    "❌ Template name must be lowercase, use hyphens for spaces, and contain only letters, numbers, and hyphens"
  );
  console.error(
    "✅ Valid examples: user-verification, order-confirmation, welcome-email"
  );
  process.exit(1);
}

createTemplate(templateName, title);
