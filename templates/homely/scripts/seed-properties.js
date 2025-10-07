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

// Property Schema
const PropertySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: { type: String, required: true },
    location: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    currency: {
      type: String,
      default: "GHS", // Default to Ghana Cedis
      enum: ["GHS", "USD", "EUR", "GBP", "CAD", "AUD"],
    },
    propertyType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PropertyType",
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["for-sale", "for-rent", "sold", "rented"],
      default: "for-sale",
    },
    beds: { type: Number, required: true, min: 0 },
    baths: { type: Number, required: true, min: 0 },
    area: { type: Number, required: true, min: 0 },
    images: [
      {
        src: { type: String, required: true },
        alt: { type: String, default: "" },
        isMain: { type: Boolean, default: false },
      },
    ],
    amenities: [{ type: String, trim: true }],
    features: [{ type: String, trim: true }],
    coordinates: {
      lat: { type: Number, min: -90, max: 90 },
      lng: { type: Number, min: -180, max: 180 },
    },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Property =
  mongoose.models.Property || mongoose.model("Property", PropertySchema);

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
  { timestamps: true }
);

const PropertyType =
  mongoose.models.PropertyType ||
  mongoose.model("PropertyType", PropertyTypeSchema);

const sampleProperties = [
  {
    name: "Luxury Downtown Apartment",
    slug: "luxury-downtown-apartment",
    description:
      "A stunning modern apartment in the heart of downtown with panoramic city views. Features high-end finishes, stainless steel appliances, and access to premium building amenities including a rooftop terrace, fitness center, and concierge service.",
    location: "East Legon, Accra",
    price: 2000000,
    currency: "GHS",
    propertyType: "apartment",
    status: "for-sale",
    beds: 2,
    baths: 2,
    area: 1200,
    images: [
      {
        src: "/images/properties/property1/property1.jpg",
        alt: "Luxury apartment living room with city view",
        isMain: true,
      },
      {
        src: "/images/properties/property1/image-2.jpg",
        alt: "Modern kitchen with premium appliances",
        isMain: false,
      },
      {
        src: "/images/properties/property1/image-3.jpg",
        alt: "Master bedroom with panoramic windows",
        isMain: false,
      },
      {
        src: "/images/properties/property1/image-4.jpg",
        alt: "Elegant bathroom with marble finishes",
        isMain: false,
      },
    ],
    amenities: [
      "Swimming Pool",
      "Fitness Center",
      "Concierge Service",
      "Rooftop Terrace",
      "Valet Parking",
    ],
    features: [
      "Smart Home Technology",
      "Energy Efficient Windows",
      "High Ceilings",
      "Premium Finishes",
    ],
    isFeatured: true,
    isActive: true,
  },
  {
    name: "Elegant Suburban Villa",
    slug: "elegant-suburban-villa",
    description:
      "Beautiful family villa in a quiet suburban neighborhood. This spacious home features an open floor plan, gourmet kitchen, master suite with walk-in closet, and a large backyard perfect for entertaining.",
    location: "Tema, Greater Accra",
    price: 3500000,
    currency: "GHS",
    propertyType: "villa",
    status: "for-sale",
    beds: 4,
    baths: 3.5,
    area: 3200,
    images: [
      {
        src: "/images/properties/property2/property2.jpg",
        alt: "Villa exterior with manicured garden",
        isMain: true,
      },
      {
        src: "/images/properties/property2/image-2.jpg",
        alt: "Spacious living room with fireplace",
        isMain: false,
      },
      {
        src: "/images/properties/property2/image-3.jpg",
        alt: "Gourmet kitchen with granite countertops",
        isMain: false,
      },
      {
        src: "/images/properties/property2/image-4.jpg",
        alt: "Master bedroom suite",
        isMain: false,
      },
    ],
    amenities: [
      "Swimming Pool",
      "Private Garden",
      "Two-Car Garage",
      "Home Office",
      "Walk-in Closets",
    ],
    features: [
      "Hardwood Floors",
      "Granite Countertops",
      "Stone Fireplace",
      "Crown Molding",
    ],
    isFeatured: true,
    isActive: true,
  },
  {
    name: "Modern Office Space",
    slug: "modern-office-space",
    description:
      "Prime commercial office space in a prestigious business district. Features floor-to-ceiling windows, modern HVAC system, and flexible layout options. Perfect for growing businesses.",
    location: "Airport City, Accra",
    price: 12000,
    currency: "GHS",
    propertyType: "office",
    status: "for-rent",
    beds: 0,
    baths: 2,
    area: 2500,
    images: [
      {
        src: "/images/properties/property3/property3.jpg",
        alt: "Modern office space with city views",
        isMain: true,
      },
      {
        src: "/images/properties/property3/image-2.jpg",
        alt: "Conference room with modern furniture",
        isMain: false,
      },
      {
        src: "/images/properties/property3/image-3.jpg",
        alt: "Open workspace area",
        isMain: false,
      },
      {
        src: "/images/properties/property3/image-4.jpg",
        alt: "Reception area",
        isMain: false,
      },
    ],
    amenities: [
      "Conference Rooms",
      "Reception Area",
      "Break Room",
      "Reserved Parking",
    ],
    features: [
      "High-Speed Internet",
      "Security System",
      "Climate Control",
      "Floor-to-Ceiling Windows",
    ],
    isFeatured: false,
    isActive: true,
  },
  {
    name: "Cozy Studio Apartment",
    slug: "cozy-studio-apartment",
    description:
      "Charming studio apartment perfect for young professionals or students. Located in a vibrant neighborhood with easy access to public transportation, restaurants, and entertainment.",
    location: "Adabraka, Accra",
    price: 4500,
    currency: "GHS",
    propertyType: "apartment",
    status: "for-rent",
    beds: 0,
    baths: 1,
    area: 550,
    images: [
      {
        src: "/images/properties/property4/property4.jpg",
        alt: "Cozy studio living space",
        isMain: true,
      },
      {
        src: "/images/properties/property4/image-2.jpg",
        alt: "Compact kitchen area",
        isMain: false,
      },
      {
        src: "/images/properties/property4/image-3.jpg",
        alt: "Sleeping area with storage",
        isMain: false,
      },
      {
        src: "/images/properties/property4/image-4.jpg",
        alt: "Bathroom with modern fixtures",
        isMain: false,
      },
    ],
    amenities: [
      "Laundry Facilities",
      "Bike Storage",
      "Roof Deck",
      "Package Room",
    ],
    features: [
      "Abundant Natural Light",
      "Built-in Storage",
      "Modern Appliances",
      "Exposed Brick",
    ],
    isFeatured: false,
    isActive: true,
  },
  {
    name: "Commercial Retail Space",
    slug: "commercial-retail-space",
    description:
      "High-traffic retail space on busy commercial street. Ideal for restaurants, boutiques, or service businesses. Features large storefront windows and excellent visibility.",
    location: "Oxford Street, Osu",
    price: 18000,
    currency: "GHS",
    propertyType: "commercial",
    status: "for-rent",
    beds: 0,
    baths: 1,
    area: 1800,
    images: [
      {
        src: "/images/properties/property5/property5.jpg",
        alt: "Commercial retail storefront",
        isMain: true,
      },
      {
        src: "/images/properties/property5/image-2.jpg",
        alt: "Interior retail space",
        isMain: false,
      },
      {
        src: "/images/properties/property5/image-3.jpg",
        alt: "Back office area",
        isMain: false,
      },
      {
        src: "/images/properties/property5/image-4.jpg",
        alt: "Storage room",
        isMain: false,
      },
    ],
    amenities: [
      "Street Parking",
      "Storage Room",
      "Loading Zone",
      "Security System",
    ],
    features: [
      "High Foot Traffic",
      "Corner Location",
      "Large Display Windows",
      "HVAC System",
    ],
    isFeatured: false,
    isActive: true,
  },
  {
    name: "Executive Villa with Pool",
    slug: "executive-villa-with-pool",
    description:
      "Spectacular executive villa featuring luxury amenities and stunning architecture. This property offers premium living with a private pool, landscaped gardens, and sophisticated interior design perfect for discerning buyers.",
    location: "Trasacco, East Legon",
    price: 6200000,
    currency: "GHS",
    propertyType: "villa",
    status: "for-sale",
    beds: 5,
    baths: 4.5,
    area: 4200,
    images: [
      {
        src: "/images/properties/property6/property6.jpg",
        alt: "Executive villa with swimming pool",
        isMain: true,
      },
      {
        src: "/images/properties/property6/image-2.jpg",
        alt: "Grand living room",
        isMain: false,
      },
      {
        src: "/images/properties/property6/image-3.jpg",
        alt: "Master suite with balcony",
        isMain: false,
      },
      {
        src: "/images/properties/property6/image-4.jpg",
        alt: "Outdoor entertainment area",
        isMain: false,
      },
    ],
    amenities: [
      "Private Swimming Pool",
      "Landscaped Gardens",
      "Three-Car Garage",
      "Wine Cellar",
      "Home Theater",
    ],
    features: [
      "Marble Flooring",
      "Custom Cabinetry",
      "Smart Home Automation",
      "Outdoor Kitchen",
    ],
    isFeatured: true,
    isActive: true,
  },
  {
    name: "Urban Loft Apartment",
    slug: "urban-loft-apartment",
    description:
      "Trendy loft apartment in a converted warehouse building. Features exposed brick walls, high ceilings, and industrial-chic design elements. Perfect for creative professionals seeking unique living space.",
    location: "Ridge, Accra",
    price: 6800,
    currency: "GHS",
    propertyType: "apartment",
    status: "for-rent",
    beds: 1,
    baths: 1,
    area: 850,
    images: [
      {
        src: "/images/properties/property7.jpg",
        alt: "Industrial loft apartment",
        isMain: true,
      },
    ],
    amenities: ["Elevator", "Exposed Brick", "High Ceilings", "Bike Storage"],
    features: [
      "Industrial Design",
      "Large Windows",
      "Polished Concrete Floors",
      "Open Layout",
    ],
    isFeatured: false,
    isActive: true,
  },
  {
    name: "Waterfront Penthouse",
    slug: "waterfront-penthouse",
    description:
      "Exclusive penthouse with breathtaking waterfront views. This luxury residence features premium finishes, private terrace, and access to world-class building amenities. The epitome of sophisticated urban living.",
    location: "Labadi Beach, Accra",
    price: 8400000,
    currency: "GHS",
    propertyType: "apartment",
    status: "for-sale",
    beds: 3,
    baths: 3.5,
    area: 2800,
    images: [
      {
        src: "/images/properties/property8.jpg",
        alt: "Waterfront penthouse with terrace",
        isMain: true,
      },
    ],
    amenities: [
      "Private Terrace",
      "Concierge Service",
      "Spa & Wellness Center",
      "Marina Access",
      "Private Elevator",
    ],
    features: [
      "Waterfront Views",
      "Floor-to-Ceiling Windows",
      "Premium Appliances",
      "Smart Technology",
    ],
    isFeatured: true,
    isActive: true,
  },
  {
    name: "Corporate Headquarters",
    slug: "corporate-headquarters",
    description:
      "Premium corporate office building suitable for headquarters or large enterprise operations. Features modern infrastructure, flexible floor plans, and prestigious business address in prime commercial district.",
    location: "Cantonments, Accra",
    price: 40000,
    currency: "GHS",
    propertyType: "office",
    status: "for-rent",
    beds: 0,
    baths: 8,
    area: 12000,
    images: [
      {
        src: "/images/properties/property9.jpg",
        alt: "Modern corporate office building",
        isMain: true,
      },
    ],
    amenities: [
      "Multiple Conference Rooms",
      "Executive Suites",
      "Cafeteria",
      "Parking Garage",
      "Security Desk",
    ],
    features: [
      "Flexible Floor Plans",
      "High-Speed Connectivity",
      "LEED Certified",
      "City Views",
    ],
    isFeatured: false,
    isActive: true,
  },
];

async function seedDatabase() {
  try {
    await connectDB();

    // Clear existing properties
    await Property.deleteMany({});
    console.log("Cleared existing properties");

    // Get all property types to map slugs to ObjectIds
    const propertyTypes = await PropertyType.find({});
    const propertyTypeMap = {};
    propertyTypes.forEach((type) => {
      propertyTypeMap[type.slug] = type._id;
    });

    // Convert property type slugs to ObjectIds
    const propertiesWithIds = sampleProperties.map((property) => ({
      ...property,
      propertyType: propertyTypeMap[property.propertyType],
    }));

    // Insert sample properties
    const insertedProperties = await Property.insertMany(propertiesWithIds);
    console.log(`Inserted ${insertedProperties.length} sample properties`);

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    process.exit(0);
  }
}

seedDatabase();
