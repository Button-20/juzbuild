/**
 * PUT /api/auth/profile
 * Update user profile information
 */

import { getUserFromRequest, toObjectId } from "@/lib/auth";
import { getCollection } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest) {
  try {
    const userPayload = getUserFromRequest(request);
    if (!userPayload) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      fullName,
      companyName,
      phoneNumber,
      supportEmail,
      whatsappNumber,
      address,
      tagline,
      aboutSection,
      country,
      city,
      facebookUrl,
      twitterUrl,
      instagramUrl,
      linkedinUrl,
      youtubeUrl,
    } = body;

    // Get users collection
    const usersCollection = await getCollection("users");

    // Build update object with only provided fields
    const updateFields: Record<string, any> = {};
    if (fullName !== undefined) updateFields.fullName = fullName;
    if (companyName !== undefined) updateFields.companyName = companyName;
    if (phoneNumber !== undefined) updateFields.phoneNumber = phoneNumber;
    if (supportEmail !== undefined) updateFields.supportEmail = supportEmail;
    if (whatsappNumber !== undefined)
      updateFields.whatsappNumber = whatsappNumber;
    if (address !== undefined) updateFields.address = address;
    if (tagline !== undefined) updateFields.tagline = tagline;
    if (aboutSection !== undefined) updateFields.aboutSection = aboutSection;
    if (country !== undefined) updateFields.country = country;
    if (city !== undefined) updateFields.city = city;
    if (facebookUrl !== undefined) updateFields.facebookUrl = facebookUrl;
    if (twitterUrl !== undefined) updateFields.twitterUrl = twitterUrl;
    if (instagramUrl !== undefined) updateFields.instagramUrl = instagramUrl;
    if (linkedinUrl !== undefined) updateFields.linkedinUrl = linkedinUrl;
    if (youtubeUrl !== undefined) updateFields.youtubeUrl = youtubeUrl;

    // Update user in database
    const result = await usersCollection.findOneAndUpdate(
      { _id: toObjectId(userPayload.userId) },
      {
        $set: {
          ...updateFields,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    if (!result) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Return updated user (without sensitive fields)
    const { password, ...userWithoutPassword } = result;

    return NextResponse.json({
      message: "Profile updated successfully",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Profile update error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { message: "Failed to update profile", error: errorMessage },
      { status: 500 }
    );
  }
}
