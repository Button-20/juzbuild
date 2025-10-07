require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");

async function resetDatabase() {
  try {
    const MONGODB_URI =
      process.env.MONGODB_URI || "mongodb://localhost:27017/real-estate";

    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // List all collections
    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();
    console.log(`📊 Found ${collections.length} collections`);

    if (collections.length === 0) {
      console.log("🎯 Database is already empty");
      return;
    }

    // Confirm before proceeding
    console.log("⚠️  WARNING: This will delete ALL data in your database!");
    console.log("📋 Collections to be deleted:");
    collections.forEach((col) => console.log(`   - ${col.name}`));

    // In a real scenario, you'd want user confirmation here
    // For now, we'll proceed (this is a development script)

    // Drop all collections
    for (const collection of collections) {
      await mongoose.connection.db.collection(collection.name).drop();
      console.log(`🗑️  Dropped collection: ${collection.name}`);
    }

    console.log("✅ Database reset completed!");
    console.log("💡 Run the following to set up fresh data:");
    console.log("   npm run create-admin");
    console.log("   npm run seed-properties");
  } catch (error) {
    console.error("❌ Error resetting database:", error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
    process.exit(0);
  }
}

resetDatabase();
