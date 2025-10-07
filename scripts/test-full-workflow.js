// Use built-in fetch for Node.js 18+

async function testFullWorkflow() {
  console.log(
    "🚀 Testing Full Website Creation Workflow with Integrations...\n"
  );

  const testData = {
    userId: "test-user-" + Date.now(),
    websiteName: "testsite" + Date.now(),
    userEmail: "testuser@example.com", // This will be overridden to jasonaddy51@gmail.com in the service
    fullName: "Test User",
    companyName: "Test Real Estate Company",
    domainName: "test-domain", // This will be replaced with websiteName for .onjuzbuild.com
    brandColors: ["#667eea", "#764ba2"],
    tagline: "Your trusted real estate partner",
    aboutSection:
      "We are a leading real estate company specializing in residential and commercial properties.",
    selectedTheme: "modern",
    layoutStyle: "grid",
    propertyTypes: ["residential", "commercial"],
    includedPages: ["home", "properties", "about", "contact"],
    preferredContactMethod: ["email", "phone"],
  };

  console.log("📝 Test Data:");
  console.log(`   Website Name: ${testData.websiteName}`);
  console.log(`   Company: ${testData.companyName}`);
  console.log(`   Expected Domain: ${testData.websiteName}.onjuzbuild.com`);
  console.log(`   Test Email: jasonaddy51@gmail.com (hardcoded in service)`);
  console.log("");

  try {
    console.log("📡 Sending request to workflow API...");
    const response = await fetch(
      "http://localhost:3000/api/workflow/create-site",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testData),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();

    console.log("✅ Workflow completed successfully!\n");
    console.log("📊 Detailed Results:");
    console.log("=====================================");

    if (result.data && result.data.results) {
      const results = result.data.results;

      Object.entries(results).forEach(([stepName, stepData], index) => {
        const stepNum = index + 1;
        console.log(`✅ Step ${stepNum}: ${stepName}`);

        switch (stepName) {
          case "Database Creation":
            console.log(`   📊 Database: ${stepData.databaseName}`);
            console.log(
              `   📁 Collections: ${stepData.collections.join(", ")}`
            );
            console.log(`   🔗 Connection: ${stepData.connectionString}`);
            break;

          case "Template Generation":
            console.log(`   📁 Template: ${stepData.templatePath}`);
            console.log(`   🏗️  Structure: ${stepData.structure}`);
            break;

          case "GitHub Repository":
            console.log(`   🔗 Repository: ${stepData.repoUrl}`);
            console.log(`   👤 Owner: ${stepData.owner}`);
            if (stepData.note) console.log(`   📝 Note: ${stepData.note}`);
            break;

          case "Subdomain Setup":
            console.log(`   🌐 Subdomain: ${stepData.subdomain}`);
            console.log(`   🎯 Target: ${stepData.cname}`);
            console.log(`   📊 Status: ${stepData.status}`);
            if (stepData.note) console.log(`   📝 Note: ${stepData.note}`);
            break;

          case "Email Notification":
            console.log(
              `   📧 Email sent: ${stepData.emailSent ? "Yes" : "No"}`
            );
            console.log(`   📬 Recipient: ${stepData.recipient}`);
            if (
              stepData.originalRecipient &&
              stepData.originalRecipient !== stepData.recipient
            ) {
              console.log(
                `   📋 Original recipient: ${stepData.originalRecipient}`
              );
            }
            console.log(`   🌐 Website URL: ${stepData.websiteUrl}`);
            console.log(`   🏠 Domain: ${stepData.domain}`);
            break;

          case "Database Logging":
            console.log(`   🆔 Site ID: ${stepData.siteId}`);
            console.log(`   ✅ Logged: ${stepData.logged ? "Yes" : "No"}`);
            break;

          default:
            console.log(`   📊 Data: ${JSON.stringify(stepData, null, 2)}`);
        }
        console.log("");
      });
    }

    console.log("🎉 Final Summary:");
    console.log("=====================================");
    console.log(`📁 Template: ./templates/${testData.websiteName}`);
    console.log(`🗄️  Database: juzbuild_${testData.websiteName}`);
    console.log(`🌐 Domain: ${testData.websiteName}.onjuzbuild.com`);
    console.log(`📧 Email: Sent to jasonaddy51@gmail.com`);
    console.log(
      `🆔 Site ID: ${
        result.data?.results?.["Database Logging"]?.siteId || "N/A"
      }`
    );

    if (result.website) {
      console.log(
        `⏰ Created: ${new Date(result.website.createdAt).toLocaleString()}`
      );
      console.log(`📊 Status: ${result.website.status}`);
    }
  } catch (error) {
    console.error("❌ Workflow failed:", error.message);
    console.log("💡 Make sure the dev server is running: npm run dev");
  }
}

testFullWorkflow();
