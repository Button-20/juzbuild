import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      message: "Dashboard overview endpoint",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch overview" },
      { status: 500 }
    );
  }
}
