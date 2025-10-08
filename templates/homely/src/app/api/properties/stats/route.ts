import { PropertyService } from "@/services";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Get basic property stats using PropertyService
    const stats = await PropertyService.getStats();

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Stats API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
