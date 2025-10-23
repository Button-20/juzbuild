import { verifyToken } from "@/lib/auth";
import { getCollection } from "@/lib/mongodb";
import { authorSchema } from "@/types/properties";
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

    // Get website database name
    const websiteId = searchParams.get("websiteId");
    let userDomain = searchParams.get("domain");
    let websiteDatabaseName = null;

    if (websiteId) {
      const sitesCollection = await getCollection("sites");
      const { ObjectId } = require("mongodb");
      const website = await sitesCollection.findOne({
        _id: new ObjectId(websiteId),
        userId: userId,
      });

      if (website) {
        userDomain = website.domain;
        websiteDatabaseName = website.dbName;
      }
    }

    if (!userDomain) {
      const usersCollection = await getCollection("users");
      const user = await usersCollection.findOne({ _id: userId });
      if (user && user.domainName) {
        userDomain = user.domainName + ".juzbuild.com";
        const websiteName = user.domainName
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "");
        websiteDatabaseName = `juzbuild_${websiteName}`;
      } else {
        userDomain = decoded.email?.split("@")[0] + ".juzbuild.com";
        const emailPrefix = decoded.email
          ?.split("@")[0]
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "");
        websiteDatabaseName = `juzbuild_${emailPrefix}`;
      }
    }

    const collection = websiteDatabaseName
      ? await getCollection("authors", websiteDatabaseName)
      : await getCollection("authors");

    // Get authors with sorting
    const authors = await collection.find({}).sort({ createdAt: -1 }).toArray();

    // Convert ObjectId to string for each author
    const formattedAuthors = authors.map((author: any) => ({
      ...author,
      _id: author._id.toString(),
    }));

    return NextResponse.json({
      success: true,
      authors: formattedAuthors,
    });
  } catch (error) {
    console.error("Error fetching authors:", error);
    return NextResponse.json(
      { error: "Failed to fetch authors" },
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

    // Get website database name
    const websiteId = searchParams.get("websiteId");
    let userDomain = searchParams.get("domain");
    let websiteDatabaseName = null;

    if (websiteId) {
      const sitesCollection = await getCollection("sites");
      const { ObjectId } = require("mongodb");
      const website = await sitesCollection.findOne({
        _id: new ObjectId(websiteId),
        userId: userId,
      });

      if (website) {
        userDomain = website.domain;
        websiteDatabaseName = website.dbName;
      }
    }

    if (!userDomain) {
      const usersCollection = await getCollection("users");
      const user = await usersCollection.findOne({ _id: userId });
      if (user && user.domainName) {
        userDomain = user.domainName + ".juzbuild.com";
        const websiteName = user.domainName
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "");
        websiteDatabaseName = `juzbuild_${websiteName}`;
      } else {
        userDomain = decoded.email?.split("@")[0] + ".juzbuild.com";
        const emailPrefix = decoded.email
          ?.split("@")[0]
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "");
        websiteDatabaseName = `juzbuild_${emailPrefix}`;
      }
    }

    const body = await request.json();

    // Validate the request body
    const validationResult = authorSchema.safeParse({
      ...body,
      userId,
      domain: userDomain,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const authorData = validationResult.data;
    const collection = websiteDatabaseName
      ? await getCollection("authors", websiteDatabaseName)
      : await getCollection("authors");

    // Check if slug already exists
    const existingAuthor = await collection.findOne({ slug: authorData.slug });
    if (existingAuthor) {
      return NextResponse.json(
        { error: "Author with this slug already exists" },
        { status: 400 }
      );
    }

    const result = await collection.insertOne(authorData);

    return NextResponse.json({
      success: true,
      author: {
        ...authorData,
        _id: result.insertedId.toString(),
      },
    });
  } catch (error) {
    console.error("Error creating author:", error);
    return NextResponse.json(
      { error: "Failed to create author" },
      { status: 500 }
    );
  }
}
