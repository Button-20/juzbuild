import { getUserFromRequest } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";
import { getCollection } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Get user from JWT token
    const tokenPayload = getUserFromRequest(request);

    if (!tokenPayload) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Check if Cloudinary is configured
    const isCloudinaryConfigured =
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET;

    if (!isCloudinaryConfigured) {
      return NextResponse.json(
        {
          message:
            "Avatar upload is not configured. Please set up Cloudinary credentials.",
        },
        { status: 503 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("avatar") as File;

    if (!file) {
      return NextResponse.json(
        { message: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { message: "Invalid file type. Only JPEG, PNG, and WebP are allowed." },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { message: "File too large. Maximum size is 5MB." },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: "image",
            folder: "juzbuild/avatars",
            public_id: `avatar_${tokenPayload.userId}`,
            overwrite: true,
            transformation: [
              { width: 400, height: 400, crop: "fill" },
              { quality: "auto" },
              { format: "webp" },
            ],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        )
        .end(buffer);
    });

    const result = uploadResult as any;

    // Update user avatar in database
    const usersCollection = await getCollection("users");

    await usersCollection.updateOne(
      { _id: toObjectId(tokenPayload.userId) },
      {
        $set: {
          avatar: result.secure_url,
          avatarPublicId: result.public_id,
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      message: "Avatar updated successfully",
      avatarUrl: result.secure_url,
    });
  } catch (error) {
    console.error("Avatar upload error:", error);
    return NextResponse.json(
      { message: "Failed to upload avatar" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Get user from JWT token
    const tokenPayload = getUserFromRequest(request);

    if (!tokenPayload) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Get user from database
    const usersCollection = await getCollection("users");
    const user = await usersCollection.findOne({
      _id: toObjectId(tokenPayload.userId),
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Delete from Cloudinary if exists
    if (user.avatarPublicId) {
      await cloudinary.uploader.destroy(user.avatarPublicId);
    }

    // Remove avatar from database
    await usersCollection.updateOne(
      { _id: toObjectId(tokenPayload.userId) },
      {
        $unset: {
          avatar: "",
          avatarPublicId: "",
        },
        $set: {
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      message: "Avatar removed successfully",
    });
  } catch (error) {
    console.error("Avatar delete error:", error);
    return NextResponse.json(
      { message: "Failed to remove avatar" },
      { status: 500 }
    );
  }
}
