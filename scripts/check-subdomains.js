const { MongoClient } = require("mongodb");

async function checkAllSubdomains() {
  try {
    console.log("🔍 Checking all created subdomains...\n");

    const client = new MongoClient(
      process.env.MONGODB_URI || "mongodb://127.0.0.1:27017"
    );
    await client.connect();

    const db = client.db("Juzbuild");
    const sitesCollection = db.collection("sites");

    // Get all sites
    const sites = await sitesCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    console.log(`📊 Total websites created: ${sites.length}\n`);

    if (sites.length > 0) {
      console.log("🌐 Subdomains created:");
      console.log("================================");

      sites.forEach((site, index) => {
        const subdomain = `${site.websiteName}.onjuzbuild.com`;
        const createdAt = new Date(site.createdAt).toLocaleString();

        console.log(`${index + 1}. ${subdomain}`);
        console.log(`   Created: ${createdAt}`);
        console.log(`   Target: ${site.websiteName}.vercel.app`);
        console.log(`   Status: ${site.status || "active"}\n`);
      });

      console.log("✅ All subdomains should be configured in Namecheap DNS");
    }

    await client.close();
  } catch (error) {
    console.error("❌ Error checking subdomains:", error);
  }
}

checkAllSubdomains();
