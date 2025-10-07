require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");

// MongoDB connection
const connectDB = async () => {
  try {
    const MONGODB_URI =
      process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/real-estate";
    console.log("Attempting to connect to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    console.log("\n🔧 Setup Instructions:");
    console.log(
      "1. Install MongoDB locally: https://www.mongodb.com/try/download/community"
    );
    console.log("2. Start MongoDB service");
    console.log("3. Or use MongoDB Atlas: https://www.mongodb.com/cloud/atlas");
    console.log(
      "4. Update MONGODB_URI in .env.local with your connection string"
    );
    process.exit(1);
  }
};

// User Schema
const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ["admin", "user"], default: "user" },
    avatar: { type: String, default: "" },
    provider: {
      type: String,
      enum: ["credentials", "google", "github"],
      default: "credentials",
    },
    providerId: { type: String },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcryptjs.hash(this.password, 12);
  next();
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);

async function createAdminUser() {
  try {
    await connectDB();

    const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log("⚠️  Admin user already exists with email:", adminEmail);
      console.log("You can use this account to login to the admin dashboard");
      return;
    }

    // Create admin user
    const adminUser = new User({
      name: "Admin User",
      email: adminEmail,
      password: "admin123", // This will be hashed automatically
      role: "admin",
      provider: "credentials",
    });

    await adminUser.save();
    console.log(`✅ Admin user created successfully!`);
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🔑 Password: admin123`);
    console.log(`\n🚨 IMPORTANT: Change this password after first login!`);
    console.log(`🌐 Admin dashboard: http://localhost:3000/admin`);
  } catch (error) {
    console.error("❌ Error creating admin user:", error.message);
  } finally {
    process.exit(0);
  }
}

createAdminUser();
