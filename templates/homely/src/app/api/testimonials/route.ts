import { TestimonialService } from "@/services/TestimonialService";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    // Check if there are any testimonials in the database
    const { total } = await TestimonialService.findAll({
      isActive: true,
      limit: 1,
    });

    // If no testimonials exist, seed with default data
    if (total === 0) {
      const defaultTestimonials = [
        {
          name: "John Smith",
          role: "Property Investor",
          message:
            "Outstanding service from start to finish! The team helped me find the perfect investment property and guided me through every step of the process. Their market knowledge is exceptional.",
          image: "/images/testimonial/johns.jpg",
          rating: 5,
          isActive: true,
          order: 1,
        },
        {
          name: "Sarah Johnson",
          role: "First-time Buyer",
          message:
            "As a first-time homebuyer, I was nervous about the process. But the team made everything so smooth and explained everything clearly. I couldn't be happier with my new home!",
          image: "/images/testimonial/smiths.jpg",
          rating: 5,
          isActive: true,
          order: 2,
        },
        {
          name: "Michael Chen",
          role: "Real Estate Developer",
          company: "Chen Properties",
          message:
            "Professional, reliable, and results-driven. They've helped us sell multiple high-value properties quickly and at great prices. Highly recommend their services.",
          image: "/images/users/mark.jpg",
          rating: 5,
          isActive: true,
          order: 3,
        },
      ];

      // Create default testimonials
      for (const testimonialData of defaultTestimonials) {
        await TestimonialService.create(testimonialData);
      }
    }

    // Fetch testimonials for homepage
    const { testimonials } = await TestimonialService.findAll({
      isActive: true,
      limit: 10,
    });

    return NextResponse.json({
      testimonials,
      total: testimonials.length,
    });
  } catch (error) {
    console.error("Testimonials GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const { name, role, message, image } = body;

    if (!name || !role || !message || !image) {
      return NextResponse.json(
        { error: "Name, role, message, and image are required" },
        { status: 400 }
      );
    }

    // Create new testimonial
    const testimonial = await TestimonialService.create({
      name,
      role,
      company: body.company || "",
      message,
      image,
      rating: body.rating || 5,
      isActive: body.isActive !== undefined ? body.isActive : true,
      order: body.order || 0,
    });

    return NextResponse.json(
      { message: "Testimonial created successfully", testimonial },
      { status: 201 }
    );
  } catch (error) {
    console.error("Testimonial POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
