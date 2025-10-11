// Cloudinary utility for handling image uploads
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
if (
  !process.env.CLOUDINARY_CLOUD_NAME ||
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET
) {
  throw new Error(
    "Cloudinary credentials are required in environment variables"
  );
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface CloudinaryUploadResult {
  public_id: string;
  version: number;
  signature: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  secure_url: string;
  url: string;
  bytes: number;
}

/**
 * Upload image to Cloudinary
 * @param imageBuffer - Image buffer from uploaded file
 * @param options - Upload options
 */
export async function uploadToCloudinary(
  imageBuffer: Buffer,
  options: {
    folder?: string;
    public_id?: string;
    transformation?: any;
  } = {}
): Promise<CloudinaryUploadResult> {
  try {
    const result = await new Promise<CloudinaryUploadResult>(
      (resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: options.folder || "juzbuild/logos",
              public_id: options.public_id,
              resource_type: "image",
              format: "webp", // Convert to WebP for better performance
              quality: "auto:good",
              fetch_format: "auto",
              transformation: options.transformation || [
                { width: 500, height: 500, crop: "limit" }, // Limit max size
                { quality: "auto:good" },
                { format: "webp" },
              ],
              ...options,
            },
            (error, result) => {
              if (error) {
                reject(error);
              } else if (result) {
                resolve(result as CloudinaryUploadResult);
              } else {
                reject(new Error("Upload failed - no result returned"));
              }
            }
          )
          .end(imageBuffer);
      }
    );

    return result;
  } catch (error: any) {
    throw new Error(`Image upload failed: ${error.message}`);
  }
}

/**
 * Delete image from Cloudinary
 * @param public_id - Public ID of the image to delete
 */
export async function deleteFromCloudinary(public_id: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(public_id);
  } catch (error: any) {
    throw new Error(`Image deletion failed: ${error.message}`);
  }
}

/**
 * Generate signed upload URL for client-side uploads
 * @param options - Upload options
 */
export function generateSignedUploadUrl(options: {
  folder?: string;
  public_id?: string;
  timestamp?: number;
}): { url: string; signature: string; timestamp: number; api_key: string } {
  const timestamp =
    options.timestamp || Math.round(new Date().getTime() / 1000);
  const params_to_sign = {
    timestamp,
    folder: options.folder || "juzbuild/logos",
    ...(options.public_id && { public_id: options.public_id }),
  };

  const signature = cloudinary.utils.api_sign_request(
    params_to_sign,
    process.env.CLOUDINARY_API_SECRET!
  );

  return {
    url: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
    signature,
    timestamp,
    api_key: process.env.CLOUDINARY_API_KEY!,
  };
}

export { cloudinary };
export default cloudinary;
