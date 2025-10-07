const { getVercelInstance } = require("../src/lib/vercel.ts");

async function testVercelDeployment() {
  try {
    console.log("🚀 Testing Vercel Deployment...");

    const vercel = getVercelInstance();
    const testProjectName = "testsite1759844806426";
    const testProjectId = "prj_JAGVGjQoE6st0IaA7WhTevK21gwy";

    // Check existing deployments
    console.log("\n📊 Checking existing deployments...");
    const deployments = await vercel.getProjectDeployments(testProjectId);
    console.log(`Found ${deployments.length} deployments:`);
    deployments.forEach((dep, index) => {
      console.log(`  ${index + 1}. ${dep.id} - ${dep.state} - ${dep.url}`);
    });

    // Try to create a deploy hook
    console.log("\n🔗 Creating deploy hook...");
    try {
      const deployHook = await vercel.createDeployHook(
        testProjectId,
        "test-deploy"
      );
      console.log(`Deploy hook created: ${deployHook.url}`);

      // Trigger the deploy hook
      console.log("\n🚀 Triggering deploy hook...");
      const hookResult = await vercel.triggerDeployHook(deployHook.url);
      console.log("Deploy hook result:", hookResult);
    } catch (hookError) {
      console.log("Deploy hook failed:", hookError.message);

      // Try direct deployment
      console.log("\n🔄 Trying direct deployment...");
      try {
        const deployment = await vercel.createDeploymentFromGit(
          testProjectName,
          `https://github.com/Button-20/${testProjectName}`
        );
        console.log("Direct deployment result:", deployment);
      } catch (directError) {
        console.log("Direct deployment failed:", directError.message);
      }
    }
  } catch (error) {
    console.error("Test failed:", error);
  }
}

testVercelDeployment();
