import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

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
    const validTypes = ["image/x-icon", "image/png", "image/jpeg", "image/svg+xml"];
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

    // Create filename with timestamp
    const timestamp = Date.now();
    const extension = file.type === "image/x-icon" ? "ico" : file.name.split(".").pop() || "png";
    const filename = `favicon-${timestamp}.${extension}`;

    // Define upload directory
    const uploadDir = join(process.cwd(), "public", "uploads", "favicons");

    // Create directory if it doesn't exist
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Save file
    const filepath = join(uploadDir, filename);
    await writeFile(filepath, buffer);

    // Return the URL for accessing the file
    const faviconUrl = `/uploads/favicons/${filename}`;

    return NextResponse.json({
      success: true,
      faviconUrl,
      filename,
    });
  } catch (error: any) {
    console.error("Favicon upload error:", error);
    return NextResponse.json(
      { success: false, error: "Upload failed: " + error.message },
      { status: 500 }
    );
  }
}
