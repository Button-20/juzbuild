const { MongoClient } = require("mongodb");

async function cleanupTestDatabases() {
  try {
    console.log("🧹 Starting cleanup of test databases...\n");

    const client = new MongoClient(
      process.env.MONGODB_URI || "mongodb://127.0.0.1:27017"
    );
    await client.connect();

    // Get admin database to list all databases
    const adminDb = client.db().admin();
    const databasesList = await adminDb.listDatabases();

    // Find all databases that start with "juzbuild_"
    const testDatabases = databasesList.databases.filter((db) =>
      db.name.startsWith("juzbuild_")
    );

    console.log(`📊 Found ${testDatabases.length} test databases to cleanup:`);

    if (testDatabases.length === 0) {
      console.log("✅ No test databases found to cleanup");
      await client.close();
      return;
    }

    // List databases to be deleted
    testDatabases.forEach((db, index) => {
      console.log(
        `   ${index + 1}. ${db.name} (${(db.sizeOnDisk / 1024 / 1024).toFixed(
          2
        )} MB)`
      );
    });

    console.log("\n🗑️  Deleting test databases...");

    // Delete each test database
    let deletedCount = 0;
    for (const database of testDatabases) {
      try {
        await client.db(database.name).dropDatabase();
        console.log(`   ✅ Deleted: ${database.name}`);
        deletedCount++;
      } catch (error) {
        console.log(
          `   ❌ Failed to delete ${database.name}: ${error.message}`
        );
      }
    }

    console.log(`\n🎉 Cleanup completed!`);
    console.log(
      `   📊 Total databases deleted: ${deletedCount}/${testDatabases.length}`
    );

    // Also cleanup the main sites collection for test data
    try {
      console.log("\n🧹 Cleaning up test sites from main database...");
      const mainDb = client.db("Juzbuild");
      const sitesCollection = mainDb.collection("sites");

      // Delete all sites that start with "testsite"
      const deleteResult = await sitesCollection.deleteMany({
        websiteName: { $regex: /^testsite/ },
      });

      console.log(
        `   ✅ Deleted ${deleteResult.deletedCount} test sites from main database`
      );
    } catch (error) {
      console.log(`   ⚠️  Could not cleanup main database: ${error.message}`);
    }

    await client.close();
    console.log("\n✨ All cleanup operations completed!");
  } catch (error) {
    console.error("❌ Cleanup failed:", error);
    process.exit(1);
  }
}

// Run cleanup if called directly
if (require.main === module) {
  cleanupTestDatabases();
}

module.exports = cleanupTestDatabases;
