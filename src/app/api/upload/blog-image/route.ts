import { verifyToken } from "@/lib/auth";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { NextRequest, NextResponse } from "next/server";

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

    // Check if the request has form data
    const formData = await request.formData();
    const imageFile = formData.get("image") as File;
    const imageType = formData.get("type") as string; // "cover" or "author"

    if (!imageFile) {
      return NextResponse.json(
        { error: "No image file provided" },
        { status: 400 }
      );
    }

    if (!imageType || !["cover", "author"].includes(imageType)) {
      return NextResponse.json(
        { error: "Invalid image type. Must be 'cover' or 'author'" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    if (!allowedTypes.includes(imageFile.type)) {
      return NextResponse.json(
        {
          error:
            "Invalid file type. Only JPEG, PNG, WebP, and GIF files are allowed.",
        },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (imageFile.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB." },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate a unique public_id for the blog image
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const publicId = `blog/${imageType}/${decoded.userId}/${timestamp}_${randomId}`;

    // Define transformations based on image type
    let transformation;
    if (imageType === "cover") {
      // Cover image optimizations - landscape format
      transformation = [
        { width: 1200, height: 630, crop: "fill", gravity: "auto" }, // Standard blog cover size
        { quality: "auto" },
        { fetch_format: "auto" },
      ];
    } else {
      // Author image optimizations - square profile format
      transformation = [
        { width: 300, height: 300, crop: "fill", gravity: "face" }, // Square profile image with face detection
        { quality: "auto" },
        { fetch_format: "auto" },
      ];
    }

    // Upload to Cloudinary with appropriate optimizations
    const cloudinaryResult = await uploadToCloudinary(buffer, {
      folder: `blog/${imageType}`,
      public_id: publicId,
      transformation,
    });

    return NextResponse.json({
      success: true,
      imageUrl: cloudinaryResult.secure_url,
      publicId: cloudinaryResult.public_id,
      width: cloudinaryResult.width,
      height: cloudinaryResult.height,
      type: imageType,
    });
  } catch (error) {
    console.error("Error uploading blog image:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}
