import { verifyToken } from "@/lib/auth";
import { LeadService } from "@/lib/services";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
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

    const userId = decoded.userId;

    const stats = await LeadService.getStats(userId);

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching lead stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch lead statistics" },
      { status: 500 }
    );
  }
}

export async function POST() {
  return NextResponse.json(
    { message: "Method not allowed. Use GET to fetch lead statistics." },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { message: "Method not allowed. Use GET to fetch lead statistics." },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { message: "Method not allowed. Use GET to fetch lead statistics." },
    { status: 405 }
  );
}
