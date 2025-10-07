#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("🏠 Setting up Real Estate Admin Dashboard...\n");

// Check if .env.local exists
if (!fs.existsSync(".env.local")) {
  console.log("📄 Creating .env.local file...");
  fs.copyFileSync(".env.example", ".env.local");
  console.log(
    "✅ Created .env.local - Please update with your MongoDB URI and other settings\n"
  );
} else {
  console.log("📄 .env.local already exists\n");
}

// Install dependencies
console.log("📦 Installing dependencies...");
try {
  execSync("npm install", { stdio: "inherit" });
  console.log("✅ Dependencies installed\n");
} catch (error) {
  console.error("❌ Failed to install dependencies");
  process.exit(1);
}

console.log("🔧 Setup complete! Next steps:\n");
console.log("1. Update your .env.local file with your MongoDB URI");
console.log("2. Make sure MongoDB is running");
console.log("3. Run: npm run create-admin (to create admin user)");
console.log("4. Run: npm run seed-properties (optional - add sample data)");
console.log("5. Run: npm run dev (to start development server)\n");

console.log("📚 Check README_ADMIN.md for detailed setup instructions");
console.log(
  "🌐 Admin dashboard will be available at: http://localhost:3000/admin"
);
console.log("🔑 Default admin login: admin@example.com / admin123\n");

console.log("🎉 Happy coding!");
