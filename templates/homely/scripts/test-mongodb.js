require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");

async function testConnection() {
  try {
    const MONGODB_URI =
      process.env.MONGODB_URI || "mongodb://localhost:27017/real-estate";

    console.log("🔍 Testing MongoDB connection...");
    console.log(
      `📍 URI: ${MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, "//***:***@")}`
    );

    await mongoose.connect(MONGODB_URI);
    console.log("✅ Successfully connected to MongoDB!");

    // Test basic operations
    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();
    console.log(`📊 Database contains ${collections.length} collections`);

    if (collections.length > 0) {
      console.log("📋 Collections:");
      collections.forEach((col) => console.log(`   - ${col.name}`));
    }

    console.log("\n🎉 MongoDB is ready for your real estate application!");
  } catch (error) {
    console.error("❌ Connection failed:", error.message);

    if (error.message.includes("ECONNREFUSED")) {
      console.log("\n🔧 Troubleshooting steps:");
      console.log("1. Make sure MongoDB is installed and running");
      console.log(
        "2. For local MongoDB: Start with `mongod` or check service status"
      );
      console.log(
        "3. For MongoDB Atlas: Verify connection string and network access"
      );
      console.log("4. Check MONGODB_URI in .env.local file");
      console.log("\n📖 See MONGODB_SETUP.md for detailed setup instructions");
    }

    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
    process.exit(0);
  }
}

testConnection();
