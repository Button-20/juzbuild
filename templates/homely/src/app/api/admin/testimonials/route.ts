import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Testimonial from "@/models/Testimonial";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

// GET - List all testimonials (admin)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

    // Build query
    const query: any = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { role: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
        { message: { $regex: search, $options: "i" } },
      ];
    }

    // Get total count
    const total = await Testimonial.countDocuments(query);

    // Get testimonials
    const testimonials = await Testimonial.find(query)
      .sort({ order: 1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({
      testimonials,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    console.error("Testimonials GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create new testimonial
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { name, role, company, message, image, rating, isActive, order } =
      body;

    // Validate required fields
    if (!name || !role || !message || !image) {
      return NextResponse.json(
        { error: "Name, role, message, and image are required" },
        { status: 400 }
      );
    }

    // Validate rating
    if (rating && (rating < 1 || rating > 5)) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Get the next order number if not provided
    let testimonialOrder = order;
    if (!testimonialOrder) {
      const maxOrderTestimonial = await Testimonial.findOne().sort({
        order: -1,
      });
      testimonialOrder = (maxOrderTestimonial?.order || 0) + 1;
    }

    const testimonial = new Testimonial({
      name,
      role,
      company: company || undefined,
      message,
      image,
      rating: rating || 5,
      isActive: isActive !== undefined ? isActive : true,
      order: testimonialOrder,
    });

    await testimonial.save();

    return NextResponse.json({
      success: true,
      testimonial,
    });
  } catch (error) {
    console.error("Testimonial creation error:", error);
    return NextResponse.json(
      { error: "Failed to create testimonial" },
      { status: 500 }
    );
  }
}
