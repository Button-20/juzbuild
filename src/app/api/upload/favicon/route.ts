import { uploadToCloudinary } from "@/lib/cloudinary";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("favicon") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = [
      "image/x-icon",
      "image/png",
      "image/jpeg",
      "image/svg+xml",
    ];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid file type. Please upload ICO, PNG, JPG, or SVG",
        },
        { status: 400 }
      );
    }

    // Validate file size (max 1MB)
    if (file.size > 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: "File size must be less than 1MB" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate a unique public_id for the favicon
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const public_id = `favicon_${timestamp}_${randomId}`;

    // Upload to Cloudinary with transformations for different formats
    const result = await uploadToCloudinary(buffer, {
      folder: "juzbuild/favicons",
      public_id: public_id,
      transformation: [
        { width: 512, height: 512, crop: "limit" },
        { quality: "auto:good" },
        { format: "auto" },
      ],
    });

    return NextResponse.json({
      success: true,
      faviconUrl: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
      message: "Favicon uploaded successfully",
    });
  } catch (error: any) {
    console.error("❌ Favicon upload error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Favicon upload failed",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
