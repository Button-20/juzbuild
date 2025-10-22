import { verifyToken } from "@/lib/auth";
import { getCollection } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const TestimonialUpdateSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  role: z.string().min(1, "Role is required").optional(),
  company: z.string().optional(),
  message: z.string().min(1, "Message is required").optional(),
  image: z
    .string()
    .url("Valid image URL required")
    .optional()
    .or(z.literal("")),
  rating: z.number().min(1).max(5).optional(),
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
    const validatedData = TestimonialUpdateSchema.parse(body);

    if (!ObjectId.isValid(resolvedParams.id)) {
      return NextResponse.json(
        { error: "Invalid testimonial ID" },
        { status: 400 }
      );
    }

    // Get website ID from query params to determine which database to use
    const { searchParams } = new URL(request.url);
    const websiteId = searchParams.get("websiteId");
    let websiteDatabaseName: string | undefined = undefined;

    if (websiteId) {
      // Get the specific website's database name
      const sitesCollection = await getCollection("sites");
      const website = await sitesCollection.findOne({
        _id: new ObjectId(websiteId),
        userId: decoded.userId,
      });

      if (website && website.dbName) {
        websiteDatabaseName = website.dbName;
      }
    }

    const testimonialsCollection = websiteDatabaseName
      ? await getCollection("testimonials", websiteDatabaseName)
      : await getCollection("testimonials");

    // Check if testimonial exists
    const existingTestimonial = await testimonialsCollection.findOne({
      _id: new ObjectId(resolvedParams.id),
    });

    if (!existingTestimonial) {
      return NextResponse.json(
        { error: "Testimonial not found" },
        { status: 404 }
      );
    }

    // Update testimonial
    const updateData = {
      ...validatedData,
      updatedAt: new Date(),
    };

    const result = await testimonialsCollection.updateOne(
      { _id: new ObjectId(resolvedParams.id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Testimonial not found" },
        { status: 404 }
      );
    }

    // Get updated testimonial
    const updatedTestimonial = await testimonialsCollection.findOne({
      _id: new ObjectId(resolvedParams.id),
    });

    return NextResponse.json({
      success: true,
      testimonial: {
        ...updatedTestimonial,
        _id: updatedTestimonial!._id.toString(),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error updating testimonial:", error);
    return NextResponse.json(
      { error: "Failed to update testimonial" },
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
      return NextResponse.json(
        { error: "Invalid testimonial ID" },
        { status: 400 }
      );
    }

    // Get website ID from query params to determine which database to use
    const { searchParams } = new URL(request.url);
    const websiteId = searchParams.get("websiteId");
    let websiteDatabaseName: string | undefined = undefined;

    if (websiteId) {
      // Get the specific website's database name
      const sitesCollection = await getCollection("sites");
      const website = await sitesCollection.findOne({
        _id: new ObjectId(websiteId),
        userId: decoded.userId,
      });

      if (website && website.dbName) {
        websiteDatabaseName = website.dbName;
      }
    }

    const testimonialsCollection = websiteDatabaseName
      ? await getCollection("testimonials", websiteDatabaseName)
      : await getCollection("testimonials");

    // Delete testimonial
    const result = await testimonialsCollection.deleteOne({
      _id: new ObjectId(resolvedParams.id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Testimonial not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Testimonial deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting testimonial:", error);
    return NextResponse.json(
      { error: "Failed to delete testimonial" },
      { status: 500 }
    );
  }
}
