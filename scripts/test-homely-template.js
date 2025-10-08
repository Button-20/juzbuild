// Test script for homely template processing via API
// This tests the complete workflow including homely template customization

async function testHomelyTemplate() {
  console.log("🧪 Testing Homely Template Processing...\n");

  const testOptions = {
    userId: `test_user_${Date.now()}`,
    websiteName: `homelytest${Date.now()}`,
    userEmail: "test@homelytest.com",
    fullName: "Test User",
    companyName: "Homely Test Realty",
    domainName: `homelytest${Date.now()}`,
    brandColors: ["#2563eb", "#1e40af", "#3b82f6"],
    tagline: "Your Trusted Real Estate Partner - Testing Homely",
    aboutSection:
      "We are testing the homely template customization with dynamic database integration and admin removal.",
    selectedTheme: "homely",
    layoutStyle: "modern",
    propertyTypes: ["house", "condo", "townhouse"],
    includedPages: ["Home", "Properties", "About", "Contact", "Services"],
    preferredContactMethod: ["email", "phone"],
  };

  try {
    console.log("📋 Template Test Configuration:");
    console.log("- Website Name:", testOptions.websiteName);
    console.log("- Company Name:", testOptions.companyName);
    console.log("- Selected Theme:", testOptions.selectedTheme);
    console.log("- Pages:", testOptions.includedPages.join(", "));
    console.log("- Property Types:", testOptions.propertyTypes.join(", "));
    console.log();

    // Test the full workflow via API
    console.log("🎨 Testing homely template via API...");
    console.log(
      "📡 Making request to: http://localhost:3000/api/workflow/create-site"
    );

    let response;
    let result;

    try {
      response = await fetch("http://localhost:3000/api/workflow/create-site", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testOptions),
      });

      console.log("📊 Response status:", response.status);
      console.log("📊 Response OK:", response.ok);

      const responseText = await response.text();
      console.log("📊 Response length:", responseText.length);

      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.log(
          "📊 Response text preview:",
          responseText.substring(0, 500)
        );
        throw new Error(`Failed to parse JSON response: ${parseError.message}`);
      }
    } catch (fetchError) {
      console.log("📊 Fetch error details:", fetchError.message);
      throw fetchError;
    }

    if (response.ok && result.success) {
      console.log("✅ HOMELY TEMPLATE TEST PASSED!\n");
      console.log("📊 Results:");
      console.log(
        "- Database:",
        result.data?.databaseCreation?.databaseName || "Created"
      );
      console.log(
        "- Template:",
        result.data?.templateGeneration ? "Generated with Homely" : "Failed"
      );
      console.log(
        "- Admin Removed:",
        result.data?.templateGeneration?.removedAdmin ? "Yes" : "No"
      );
      console.log(
        "- Dynamic DB:",
        result.data?.templateGeneration?.dynamicDatabase ? "Yes" : "No"
      );
      console.log(
        "- Custom Pages:",
        result.data?.templateGeneration?.customPages || 0
      );
      console.log(
        "- GitHub Repo:",
        result.data?.githubRepo?.clone_url || "Created"
      );
      console.log(
        "- Vercel Project:",
        result.data?.vercelDeployment?.project?.name || "Created"
      );
      console.log(
        "- Deployment URL:",
        result.data?.vercelDeployment?.deploymentUrl || "Unknown"
      );
      console.log(
        "- Subdomain:",
        result.data?.subdomainCreation?.subdomain || "Created"
      );
      console.log();
      console.log("🎉 Homely template successfully processed and deployed!");

      // Show live URLs
      if (result.data?.vercelDeployment?.deploymentUrl) {
        console.log(
          `\n🌐 Test your homely site: ${result.data.vercelDeployment.deploymentUrl}`
        );
      }
      if (result.data?.subdomainCreation?.subdomain) {
        console.log(
          `🌐 Custom domain: https://${result.data.subdomainCreation.subdomain}`
        );
      }
    } else {
      console.log("❌ HOMELY TEMPLATE TEST FAILED");
      console.log("HTTP Status:", response.status);
      console.log("Error:", result.error || result.message);
      console.log("Failed at step:", result.step);
    }
  } catch (error) {
    console.log("❌ TEST CRASHED");
    console.error("Error:", error.message);
    console.log(
      "\n💡 Make sure the development server is running on http://localhost:3000"
    );
  }
}

// Run the test
testHomelyTemplate().catch(console.error);
