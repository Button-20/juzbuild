import { verifyToken } from "@/lib/auth";
import { getCollection } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const resolvedParams = await params;
    const authorId = resolvedParams.id;

    // Get website database name
    const websiteId = searchParams.get("websiteId");
    let userDomain = searchParams.get("domain");
    let websiteDatabaseName = null;

    if (websiteId) {
      const websitesCollection = await getCollection("websites");
      const { ObjectId } = require("mongodb");
      const website = await websitesCollection.findOne({
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

    const { ObjectId } = require("mongodb");

    // Check if author exists
    const existingAuthor = await collection.findOne({
      _id: new ObjectId(authorId),
    });

    if (!existingAuthor) {
      return NextResponse.json({ error: "Author not found" }, { status: 404 });
    }

    const body = await request.json();

    const updateData = {
      ...body,
      updatedAt: new Date(),
    };

    // Remove undefined values
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    // Check if slug is being changed and if it conflicts with existing authors
    if (updateData.slug && updateData.slug !== existingAuthor.slug) {
      const conflictingAuthor = await collection.findOne({
        slug: updateData.slug,
        _id: { $ne: new ObjectId(authorId) },
      });
      if (conflictingAuthor) {
        return NextResponse.json(
          { error: "Author with this slug already exists" },
          { status: 400 }
        );
      }
    }

    const result = await collection.updateOne(
      { _id: new ObjectId(authorId) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Author not found" }, { status: 404 });
    }

    // Get updated author
    const updatedAuthor = await collection.findOne({
      _id: new ObjectId(authorId),
    });

    return NextResponse.json({
      success: true,
      author: {
        ...updatedAuthor,
        _id: updatedAuthor._id.toString(),
      },
    });
  } catch (error) {
    console.error("Error updating author:", error);
    return NextResponse.json(
      { error: "Failed to update author" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const resolvedParams = await params;
    const authorId = resolvedParams.id;

    // Get website database name
    const websiteId = searchParams.get("websiteId");
    let userDomain = searchParams.get("domain");
    let websiteDatabaseName = null;

    if (websiteId) {
      const websitesCollection = await getCollection("websites");
      const { ObjectId } = require("mongodb");
      const website = await websitesCollection.findOne({
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

    const { ObjectId } = require("mongodb");

    // Check if there are any blog posts using this author
    const blogsCollection = websiteDatabaseName
      ? await getCollection("blogs", websiteDatabaseName)
      : await getCollection("blogs");

    const authorData = await collection.findOne({
      _id: new ObjectId(authorId),
    });
    if (authorData) {
      const blogCount = await blogsCollection.countDocuments({
        author: authorData.name,
      });
      if (blogCount > 0) {
        return NextResponse.json(
          {
            error: `Cannot delete author. ${blogCount} blog post(s) are still using this author.`,
          },
          { status: 400 }
        );
      }
    }

    const result = await collection.deleteOne({
      _id: new ObjectId(authorId),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Author not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Author deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting author:", error);
    return NextResponse.json(
      { error: "Failed to delete author" },
      { status: 500 }
    );
  }
}
