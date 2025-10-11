import { uploadToCloudinary } from "@/lib/cloudinary";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Check if the request has form data
    const formData = await request.formData();
    const logoFile = formData.get("logo") as File;

    if (!logoFile) {
      return NextResponse.json(
        { error: "No logo file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/svg+xml",
    ];
    if (!allowedTypes.includes(logoFile.type)) {
      return NextResponse.json(
        {
          error:
            "Invalid file type. Only JPEG, PNG, WebP, and SVG files are allowed.",
        },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (logoFile.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB." },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await logoFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate a unique public_id for the logo
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const public_id = `logo_${timestamp}_${randomId}`;

    // Upload to Cloudinary
    const result = await uploadToCloudinary(buffer, {
      folder: "juzbuild/logos",
      public_id: public_id,
      transformation: [
        { width: 500, height: 500, crop: "limit" },
        { quality: "auto:good" },
        { format: "auto" },
      ],
    });

    return NextResponse.json({
      success: true,
      logoUrl: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
      message: "Logo uploaded successfully",
    });
  } catch (error: any) {
    console.error("Logo upload error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Logo upload failed",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
