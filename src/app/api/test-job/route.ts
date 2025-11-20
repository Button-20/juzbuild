import { NextResponse } from "next/server";

// Test endpoint to create a demo job for testing the deployment tracking
export async function POST() {
  try {
    // Create a test job directly with the background processor
    const backgroundProcessorUrl =
      process.env.BACKGROUND_PROCESSOR_URL || "http://localhost:3001";

    const testJobId = `test_job_${Date.now()}`;
    const testWebsiteData = {
      websiteName: "Test Website",
      companyName: "Test Company",
      domainName: `test-${Date.now()}`,
      userEmail: "test@example.com",
      selectedTheme: "homely",
      tagline: "Test tagline",
      aboutSection: "Test about section",
      includedPages: ["home", "about", "contact"],
      propertyTypes: ["house", "apartment"],
      brandColors: ["#000000", "#FFFFFF"],
      preferredContactMethod: ["email"],
      leadCaptureMethods: ["contact-form"],
    };

    console.log(`Creating test job: ${testJobId}`);

    const response = await fetch(
      `${backgroundProcessorUrl}/process-website-creation`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-processor-secret": process.env.BACKGROUND_PROCESSOR_SECRET || "",
        },
        body: JSON.stringify({
          ...testWebsiteData,
          jobId: testJobId,
        }),
      }
    );

    if (response.ok) {
      const result = await response.json();
      console.log(`Test job created successfully:`, result);

      return NextResponse.json({
        success: true,
        message: "Test job created",
        jobId: testJobId,
        redirectUrl: `/signup/deployment?jobId=${testJobId}&websiteName=${testWebsiteData.websiteName}&domainName=${testWebsiteData.domainName}`,
      });
    } else {
      const error = await response.text();
      console.error("Failed to create test job:", error);
      return NextResponse.json(
        { success: false, message: "Failed to create test job", error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Test job creation error:", error);
    return NextResponse.json(
      { success: false, message: "Test job creation failed" },
      { status: 500 }
    );
  }
}
