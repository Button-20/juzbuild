import { verifyToken } from "@/lib/auth";
import { getCollection } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const FaqUpdateSchema = z.object({
  question: z.string().min(1, "Question is required").optional(),
  answer: z.string().min(1, "Answer is required").optional(),
  category: z.string().optional(),
  isActive: z.boolean().optional(),
  order: z.number().min(0).optional(),
});

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

    const resolvedParams = await params;
    const body = await request.json();
    const validatedData = FaqUpdateSchema.parse(body);

    if (!ObjectId.isValid(resolvedParams.id)) {
      return NextResponse.json({ error: "Invalid FAQ ID" }, { status: 400 });
    }

    // Get website ID from query params
    const { searchParams } = new URL(request.url);
    const websiteId = searchParams.get("websiteId");
    let websiteDatabaseName: string | undefined = undefined;

    if (websiteId) {
      // Get the specific website's database name
      const websitesCollection = await getCollection("websites");
      const website = await websitesCollection.findOne({
        _id: new ObjectId(websiteId),
        userId: decoded.userId,
      });

      if (website && website.dbName) {
        websiteDatabaseName = website.dbName;
      }
    }

    if (!websiteDatabaseName) {
      return NextResponse.json({ error: "Website not found" }, { status: 404 });
    }

    // Get FAQ collection from website's database
    const { MongoClient } = require("mongodb");
    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();

    try {
      const db = client.db(websiteDatabaseName);
      const faqsCollection = db.collection("faqs");

      // Check if FAQ exists
      const existingFaq = await faqsCollection.findOne({
        _id: new ObjectId(resolvedParams.id),
      });

      if (!existingFaq) {
        return NextResponse.json({ error: "FAQ not found" }, { status: 404 });
      }

      // Update FAQ
      const updateData = {
        ...validatedData,
        updatedAt: new Date(),
      };

      const result = await faqsCollection.updateOne(
        { _id: new ObjectId(resolvedParams.id) },
        { $set: updateData }
      );

      if (result.matchedCount === 0) {
        return NextResponse.json({ error: "FAQ not found" }, { status: 404 });
      }

      // Get updated FAQ
      const updatedFaq = await faqsCollection.findOne({
        _id: new ObjectId(resolvedParams.id),
      });

      return NextResponse.json({
        success: true,
        faq: {
          ...updatedFaq,
          _id: updatedFaq!._id.toString(),
        },
      });
    } finally {
      await client.close();
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error updating FAQ:", error);
    return NextResponse.json(
      { error: "Failed to update FAQ" },
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

    const resolvedParams = await params;

    if (!ObjectId.isValid(resolvedParams.id)) {
      return NextResponse.json({ error: "Invalid FAQ ID" }, { status: 400 });
    }

    // Get website ID from query params
    const { searchParams } = new URL(request.url);
    const websiteId = searchParams.get("websiteId");
    let websiteDatabaseName: string | undefined = undefined;

    if (websiteId) {
      // Get the specific website's database name
      const websitesCollection = await getCollection("websites");
      const website = await websitesCollection.findOne({
        _id: new ObjectId(websiteId),
        userId: decoded.userId,
      });

      if (website && website.dbName) {
        websiteDatabaseName = website.dbName;
      }
    }

    if (!websiteDatabaseName) {
      return NextResponse.json({ error: "Website not found" }, { status: 404 });
    }

    // Delete FAQ from website's database
    const { MongoClient } = require("mongodb");
    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();

    try {
      const db = client.db(websiteDatabaseName);
      const faqsCollection = db.collection("faqs");

      const result = await faqsCollection.deleteOne({
        _id: new ObjectId(resolvedParams.id),
      });

      if (result.deletedCount === 0) {
        return NextResponse.json({ error: "FAQ not found" }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        message: "FAQ deleted successfully",
      });
    } finally {
      await client.close();
    }
  } catch (error) {
    console.error("Error deleting FAQ:", error);
    return NextResponse.json(
      { error: "Failed to delete FAQ" },
      { status: 500 }
    );
  }
}
