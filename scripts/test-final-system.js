// Final system test script - creates a test website to verify everything works
// This will test via the Next.js API endpoint instead of direct import

async function testSystem() {
  console.log("🧪 Running final system test via API...\n");

  const testOptions = {
    userId: `user_${Date.now()}`,
    websiteName: `finaltest${Date.now()}`,
    userEmail: "test@finaltestsite.com",
    fullName: "Test User",
    companyName: "Final Test Realty",
    domainName: `finaltest${Date.now()}`,
    brandColors: ["#2563eb", "#1e40af", "#3b82f6"],
    tagline: "Your Trusted Real Estate Partner",
    aboutSection:
      "We are a leading real estate company helping you find your dream home with personalized service and expertise.",
    selectedTheme: "modern",
    layoutStyle: "grid",
    propertyTypes: ["house", "condo", "townhouse"],
    includedPages: ["Home", "Properties", "About", "Contact"],
    preferredContactMethod: ["email", "phone"],
  };

  try {
    console.log("📋 Test Configuration:");
    console.log("- Website Name:", testOptions.websiteName);
    console.log("- Company Name:", testOptions.companyName);
    console.log("- Domain Name:", testOptions.domainName);
    console.log("- Theme:", testOptions.selectedTheme);
    console.log("- Brand Colors:", testOptions.brandColors.join(", "));
    console.log("- Pages:", testOptions.includedPages.join(", "));
    console.log();
    console.log(
      "💡 Making API request to http://localhost:3000/api/workflow/create-site...\n"
    );

    const startTime = Date.now();
    const response = await fetch(
      "http://localhost:3000/api/workflow/create-site",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testOptions),
      }
    );

    const result = await response.json();
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    if (response.ok && result.success) {
      console.log("✅ FINAL TEST PASSED!\n");
      console.log("📊 Results:");
      console.log("- Total Time:", `${duration}s`);
      console.log(
        "- Database:",
        result.data?.databaseCreation?.databaseName || "Created"
      );
      console.log(
        "- Template:",
        result.data?.templateGeneration ? "Generated" : "Failed"
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
      console.log(
        "- Email Sent:",
        result.data?.emailNotification ? "Yes" : "No"
      );
      console.log();
      console.log("🎉 System is working perfectly after cleanup!");

      // Test the live sites
      if (result.data?.vercelDeployment?.deploymentUrl) {
        console.log(
          `\n🌐 Test your site: ${result.data.vercelDeployment.deploymentUrl}`
        );
      }
      if (result.data?.subdomainCreation?.subdomain) {
        console.log(
          `🌐 Custom domain: https://${result.data.subdomainCreation.subdomain}`
        );
      }
    } else {
      console.log("❌ TEST FAILED");
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
testSystem().catch(console.error);
