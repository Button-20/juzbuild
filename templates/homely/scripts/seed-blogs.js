const { MongoClient } = require("mongodb");
require("dotenv").config({ path: ".env.local" });

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI not found in environment variables");
  process.exit(1);
}

// Sample blog data
const sampleBlogs = [
  {
    title: "10 Tips for First-Time Home Buyers",
    slug: "10-tips-first-time-home-buyers",
    excerpt:
      "Navigate the home buying process with confidence using these essential tips for first-time buyers.",
    content: `<p>Buying your first home is an exciting milestone, but it can also feel overwhelming. Here are 10 essential tips to help you navigate the process with confidence.</p>

<h2>1. Check Your Credit Score</h2>
<p>Your credit score plays a crucial role in determining your mortgage interest rate. Before you start house hunting, check your credit report and take steps to improve your score if needed.</p>

<h2>2. Save for a Down Payment</h2>
<p>While some loans require as little as 3% down, having a larger down payment can help you avoid private mortgage insurance (PMI) and reduce your monthly payments.</p>

<h2>3. Get Pre-approved for a Mortgage</h2>
<p>Getting pre-approved shows sellers that you're a serious buyer and helps you understand how much you can afford.</p>

<h2>4. Consider All Costs</h2>
<p>Don't forget about closing costs, moving expenses, home inspection fees, and ongoing maintenance costs.</p>

<h2>5. Research Neighborhoods</h2>
<p>Visit potential neighborhoods at different times of day and week to get a feel for the area.</p>

<p>Remember, buying a home is a major decision. Take your time and don't rush the process.</p>`,
    coverImage: "/images/blog/blog-1.jpg",
    author: "Sarah Johnson",
    authorImage: "/images/users/arlene.jpg",
    tags: ["Home Buying", "First Time", "Tips", "Real Estate"],
    isPublished: true,
    views: 245,
    readTime: 5,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    updatedAt: new Date().toISOString(),
  },
  {
    title: "Investment Properties: A Complete Guide",
    slug: "investment-properties-complete-guide",
    excerpt:
      "Learn everything you need to know about investing in rental properties and building wealth through real estate.",
    content: `<p>Real estate investment can be a powerful way to build wealth, but it requires careful planning and strategy. This guide covers everything you need to know.</p>

<h2>Types of Investment Properties</h2>
<p>There are several types of investment properties to consider:</p>

<ul>
<li>Single-family rental homes</li>
<li>Multi-family properties</li>
<li>Commercial real estate</li>
<li>Vacation rentals</li>
</ul>

<h2>Financing Your Investment</h2>
<p>Investment properties typically require higher down payments and have stricter lending requirements than primary residences.</p>

<h2>Key Metrics to Consider</h2>
<ul>
<li>Cash flow</li>
<li>Cap rate</li>
<li>Cash-on-cash return</li>
<li>Gross rent multiplier</li>
</ul>

<p>Remember to factor in vacancy rates, maintenance costs, and property management expenses when calculating your potential returns.</p>`,
    coverImage: "/images/blog/blog-2.jpg",
    author: "Michael Chen",
    authorImage: "/images/users/jack.jpg",
    tags: ["Investment", "Rental Properties", "Real Estate", "Wealth Building"],
    isPublished: true,
    views: 189,
    readTime: 8,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    updatedAt: new Date().toISOString(),
  },
  {
    title: "Current Market Trends in 2024",
    slug: "current-market-trends-2024",
    excerpt:
      "Stay informed about the latest real estate market trends and what they mean for buyers and sellers.",
    content: `<p>The real estate market is constantly evolving. Here's what we're seeing in 2024 and what it means for you.</p>

<h2>Interest Rate Impact</h2>
<p>Interest rates continue to influence buyer behavior and market dynamics. Higher rates have cooled some markets while creating opportunities in others.</p>

<h2>Inventory Levels</h2>
<p>Many markets are still experiencing inventory shortages, though this varies significantly by region and price point.</p>

<h2>Remote Work Effects</h2>
<p>The shift to remote work continues to influence where people choose to live, with many seeking:</p>
<ul>
<li>More space for home offices</li>
<li>Lower cost of living areas</li>
<li>Better quality of life</li>
</ul>

<h2>Technology Integration</h2>
<p>Virtual tours, digital transactions, and AI-powered property searches are becoming standard in the industry.</p>

<p>Whether you're buying or selling, understanding these trends can help you make informed decisions.</p>`,
    coverImage: "/images/blog/blog-3.jpg",
    author: "Emily Rodriguez",
    authorImage: "/images/users/mark.jpg",
    tags: ["Market Trends", "2024", "Real Estate Market", "Analysis"],
    isPublished: true,
    views: 312,
    readTime: 6,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    updatedAt: new Date().toISOString(),
  },
  {
    title: "The Ultimate Home Staging Guide",
    slug: "ultimate-home-staging-guide",
    excerpt:
      "Learn professional staging techniques to make your home irresistible to buyers and sell faster.",
    content: `<p>Home staging can significantly impact your home's selling price and time on market. Here's how to stage your home like a professional.</p>

<h2>Declutter and Depersonalize</h2>
<p>Remove personal items and excess furniture to help buyers envision themselves in the space. This creates a clean, neutral canvas that appeals to the broadest audience.</p>

<h2>Focus on Lighting</h2>
<p>Maximize natural light by opening curtains and blinds. Add lamps and replace dim bulbs with brighter ones to create a warm, welcoming atmosphere.</p>

<h2>Neutralize Color Schemes</h2>
<p>Paint walls in neutral colors like beige, gray, or white. Bold colors can be distracting and may not appeal to all buyers.</p>

<h2>Arrange Furniture Strategically</h2>
<p>Create conversation areas and highlight the room's best features. Remove bulky furniture that makes spaces feel cramped.</p>

<h2>Add Fresh Touches</h2>
<p>Fresh flowers, plants, and pleasant scents can create an inviting atmosphere that makes buyers want to stay longer.</p>

<p>Professional staging typically costs 1-3% of the home's value but can result in a 6-10% higher selling price.</p>`,
    coverImage: "/images/blog/blog-4.jpg",
    author: "David Kim",
    authorImage: "/images/users/george.jpg",
    tags: ["Home Staging", "Selling Tips", "Interior Design", "Real Estate"],
    isPublished: true,
    views: 187,
    readTime: 7,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    updatedAt: new Date().toISOString(),
  },
  {
    title: "Understanding Property Taxes",
    slug: "understanding-property-taxes",
    excerpt:
      "A comprehensive guide to property taxes, how they're calculated, and ways to potentially reduce them.",
    content: `<p>Property taxes can be one of your largest housing expenses after your mortgage payment. Understanding how they work can help you budget better and potentially save money.</p>

<h2>How Property Taxes Are Calculated</h2>
<p>Property taxes are typically calculated by multiplying your home's assessed value by the local tax rate (also called mill rate).</p>

<h2>Assessment Process</h2>
<p>Local assessors determine your property's value based on:</p>
<ul>
<li>Recent sales of comparable properties</li>
<li>Current market conditions</li>
<li>Property improvements</li>
<li>Overall condition of the home</li>
</ul>

<h2>Common Exemptions</h2>
<p>Many jurisdictions offer exemptions for:</p>
<ul>
<li>Primary residences (homestead exemption)</li>
<li>Senior citizens</li>
<li>Veterans</li>
<li>Disabled individuals</li>
</ul>

<h2>Appealing Your Assessment</h2>
<p>If you believe your assessment is too high, you can typically appeal the decision. Research comparable properties and gather evidence to support your case.</p>

<p>Understanding property taxes helps you make informed decisions about homeownership and budgeting.</p>`,
    coverImage: "/images/blog/blog-5.jpg",
    author: "Lisa Martinez",
    authorImage: "/images/users/alkesh.jpg",
    tags: ["Property Taxes", "Homeownership", "Finance", "Real Estate"],
    isPublished: true,
    views: 156,
    readTime: 6,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
    updatedAt: new Date().toISOString(),
  },
  {
    title: "Smart Home Technologies for Modern Living",
    slug: "smart-home-technologies-modern-living",
    excerpt:
      "Discover the latest smart home technologies that can increase your property value and improve your lifestyle.",
    content: `<p>Smart home technology is no longer a luxury—it's becoming an expected feature in modern homes. Here's what you need to know about the latest innovations.</p>

<h2>Security Systems</h2>
<p>Modern security systems include:</p>
<ul>
<li>Smart doorbell cameras</li>
<li>Motion-activated lights</li>
<li>Window and door sensors</li>
<li>Smart locks with remote access</li>
</ul>

<h2>Energy Management</h2>
<p>Smart thermostats and energy monitoring systems can reduce utility bills by 10-15% while providing remote control and scheduling capabilities.</p>

<h2>Lighting and Entertainment</h2>
<p>Smart lighting systems allow you to control ambiance and energy usage, while whole-home audio systems provide seamless entertainment throughout your property.</p>

<h2>Home Automation Hubs</h2>
<p>Platforms like Amazon Alexa, Google Home, and Apple HomeKit can integrate all your smart devices into a single, easy-to-use system.</p>

<h2>ROI on Smart Home Investments</h2>
<p>While not all smart home features add dollar-for-dollar value, they can make your home more attractive to buyers and differentiate it in a competitive market.</p>

<p>Start with basic security and energy management features, then expand based on your lifestyle needs.</p>`,
    coverImage: "/images/blog/blog-6.jpg",
    author: "Alex Thompson",
    authorImage: "/images/users/irfan.jpg",
    tags: ["Smart Home", "Technology", "Modern Living", "Home Improvement"],
    isPublished: true,
    views: 298,
    readTime: 8,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    updatedAt: new Date().toISOString(),
  },
];

async function seedBlogs() {
  let client;

  try {
    console.log("Connecting to MongoDB...");
    client = new MongoClient(MONGODB_URI);
    await client.connect();

    const db = client.db();
    const blogsCollection = db.collection("blogs");

    // Clear existing blogs (optional)
    console.log("Clearing existing blogs...");
    await blogsCollection.deleteMany({});

    // Insert sample blogs
    console.log("Inserting sample blogs...");
    const result = await blogsCollection.insertMany(sampleBlogs);

    console.log(`✅ Successfully inserted ${result.insertedCount} blogs`);
    console.log("Sample blog slugs:");
    sampleBlogs.forEach((blog) => {
      console.log(`  - ${blog.slug}`);
    });
  } catch (error) {
    console.error("❌ Error seeding blogs:", error);
  } finally {
    if (client) {
      await client.close();
      console.log("MongoDB connection closed");
    }
  }
}

// Run the seed function
if (require.main === module) {
  seedBlogs();
}

module.exports = seedBlogs;
