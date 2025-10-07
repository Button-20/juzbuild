require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");

// MongoDB connection
const connectDB = async () => {
  try {
    const MONGODB_URI =
      process.env.MONGODB_URI || "mongodb://localhost:27017/real-estate";
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

// PropertyType Schema
const PropertyTypeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: { type: String, required: true, trim: true },
    image: { type: String, required: true },
    icon: { type: String },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

const PropertyType = mongoose.model("PropertyType", PropertyTypeSchema);

// Sample property types data
const propertyTypesData = [
  {
    name: "Apartments",
    slug: "apartment",
    description:
      "Modern apartments and residential units perfect for urban living",
    image: "/images/categories/appartment.jpg",
    icon: "mdi:home-city",
    isActive: true,
  },
  {
    name: "Villas",
    slug: "villa",
    description: "Luxury villas and standalone houses with premium amenities",
    image: "/images/categories/villas.jpg",
    icon: "mdi:home-variant",
    isActive: true,
  },
  {
    name: "Offices",
    slug: "office",
    description: "Commercial office spaces for businesses and professionals",
    image: "/images/categories/office.jpg",
    icon: "mdi:office-building",
    isActive: true,
  },
  {
    name: "Commercial",
    slug: "commercial",
    description: "Commercial properties including retail spaces and warehouses",
    image: "/images/categories/luxury-villa.jpg",
    icon: "mdi:store",
    isActive: true,
  },
];

const seedPropertyTypes = async () => {
  try {
    await connectDB();

    // Clear existing property types
    await PropertyType.deleteMany({});
    console.log("Cleared existing property types");

    // Insert new property types
    await PropertyType.insertMany(propertyTypesData);
    console.log(`Inserted ${propertyTypesData.length} property types`);

    console.log("Property types seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding property types:", error);
    process.exit(1);
  }
};

seedPropertyTypes();
