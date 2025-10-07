import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Testimonial from "@/models/Testimonial";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

// GET - Get specific testimonial
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { id } = await params;
    const testimonial = await Testimonial.findById(id);

    if (!testimonial) {
      return NextResponse.json(
        { error: "Testimonial not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ testimonial });
  } catch (error) {
    console.error("Testimonial GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update testimonial
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { id } = await params;
    const body = await request.json();

    // Find the testimonial
    const testimonial = await Testimonial.findById(id);

    if (!testimonial) {
      return NextResponse.json(
        { error: "Testimonial not found" },
        { status: 404 }
      );
    }

    // Validate rating if provided
    if (body.rating && (body.rating < 1 || body.rating > 5)) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Update fields
    Object.keys(body).forEach((key) => {
      if (key === "rating") {
        testimonial[key] = parseFloat(body[key]) || testimonial[key];
      } else if (key === "order") {
        testimonial[key] = parseInt(body[key]) || testimonial[key];
      } else if (key !== "_id" && key !== "createdAt" && key !== "updatedAt") {
        testimonial[key] = body[key];
      }
    });

    await testimonial.save();

    return NextResponse.json({
      success: true,
      testimonial,
    });
  } catch (error) {
    console.error("Testimonial PUT error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete testimonial
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { id } = await params;
    const testimonial = await Testimonial.findById(id);

    if (!testimonial) {
      return NextResponse.json(
        { error: "Testimonial not found" },
        { status: 404 }
      );
    }

    await Testimonial.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Testimonial deleted successfully",
    });
  } catch (error) {
    console.error("Testimonial DELETE error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
