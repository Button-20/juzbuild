import { verifyToken } from "@/lib/auth";
import { getCollection } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get("auth-token")?.value;
    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = decoded.userId;

    // Get website ID from query params
    const websiteId = searchParams.get("websiteId");
    let userDomain = searchParams.get("domain");
    let websiteDatabaseName = null;

    if (websiteId) {
      // Get the specific website's database name
      const webwebsitesCollection = await getCollection("websites");
      const { ObjectId } = require("mongodb");
      const website = await webwebsitesCollection.findOne({
        _id: new ObjectId(websiteId),
        userId: userId,
      });

      if (website) {
        userDomain = website.domainName;
        websiteDatabaseName =
          website.dbName ||
          `juzbuild_${website.domainName
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "")}`;
      }
    }

    // Fallback to user's profile domain if no specific website selected
    if (!userDomain) {
      const usersCollection = await getCollection("users");
      const user = await usersCollection.findOne({ _id: userId });
      if (user && user.domainName) {
        userDomain = user.domainName + ".onjuzbuild.com";
        // Generate database name from user's domain
        const websiteName = user.domainName
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "");
        websiteDatabaseName = `juzbuild_${websiteName}`;
      } else {
        // Fallback to email-based domain
        userDomain = decoded.email?.split("@")[0] + ".onjuzbuild.com";
        const emailPrefix = decoded.email
          ?.split("@")[0]
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "");
        websiteDatabaseName = `juzbuild_${emailPrefix}`;
      }
    }

    if (!websiteDatabaseName) {
      return NextResponse.json(
        { error: "Website database not found" },
        { status: 404 }
      );
    }

    // Get pagination and sorting parameters
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const sortBy = searchParams.get("sortBy") || "order";
    const sortDirection = (searchParams.get("sortDirection") || "asc") as
      | "asc"
      | "desc";
    const search = searchParams.get("search") || "";
    const isActive = searchParams.get("isActive");

    // Get FAQs from the website's database
    const { MongoClient } = require("mongodb");
    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();

    try {
      const db = client.db(websiteDatabaseName);
      const faqsCollection = db.collection("faqs");

      // Build query
      const query: any = {};
      if (isActive) {
        query.isActive = isActive === "true";
      }
      if (search) {
        query.$or = [
          { question: { $regex: search, $options: "i" } },
          { answer: { $regex: search, $options: "i" } },
        ];
      }

      // Get total count
      const total = await faqsCollection.countDocuments(query);

      // Get paginated FAQs
      const skip = (page - 1) * limit;
      const sortOrder = sortDirection === "asc" ? 1 : -1;
      const faqs = await faqsCollection
        .find(query)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .toArray();

      // Format FAQs
      const formattedFaqs = faqs.map((faq: any) => ({
        ...faq,
        _id: faq._id.toString(),
        userId: faq.userId || userId,
        domain: faq.domain || userDomain,
      }));

      return NextResponse.json({
        faqs: formattedFaqs,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      });
    } finally {
      await client.close();
    }
  } catch (error: any) {
    console.error("FAQs GET error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get("auth-token")?.value;
    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = decoded.userId;
    const websiteId = searchParams.get("websiteId");

    if (!websiteId) {
      return NextResponse.json(
        { error: "Website ID is required" },
        { status: 400 }
      );
    }

    // Get website database name
    const websitesCollection = await getCollection("websites");
    const { ObjectId } = require("mongodb");
    const website = await websitesCollection.findOne({
      _id: new ObjectId(websiteId),
      userId: userId,
    });

    if (!website) {
      return NextResponse.json({ error: "Website not found" }, { status: 404 });
    }

    const body = await request.json();
    const { question, answer, category, isActive, order } = body;

    if (!question || !answer) {
      return NextResponse.json(
        { error: "Question and answer are required" },
        { status: 400 }
      );
    }

    // Create FAQ in the website's database
    const { MongoClient } = require("mongodb");
    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();

    try {
      const db = client.db(website.dbName);
      const faqsCollection = db.collection("faqs");

      const faqData = {
        question,
        answer,
        category: category || "",
        isActive: isActive !== undefined ? isActive : true,
        order: order || 0,
        userId: userId,
        domain: website.domain,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await faqsCollection.insertOne(faqData);

      return NextResponse.json(
        {
          ...faqData,
          _id: result.insertedId.toString(),
        },
        { status: 201 }
      );
    } finally {
      await client.close();
    }
  } catch (error: any) {
    console.error("FAQ POST error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
