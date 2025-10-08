import {
  ConversationState,
  generateCustomAIResponse,
  initializeConversation,
  PropertyContext,
} from "@/lib/custom-ai";
import connectDB from "@/lib/mongodb";
import { PropertyService, PropertyTypeService } from "@/services";
import { NextRequest, NextResponse } from "next/server";

// Simple in-memory conversation storage (for demo - use Redis or DB in production)
const conversationStore = new Map<string, ConversationState>();

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 15; // 15 requests per minute

function getRateLimitKey(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0] : "unknown";
  return ip;
}

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;

  const userLimit = rateLimitMap.get(key);

  if (!userLimit || userLimit.resetTime < windowStart) {
    rateLimitMap.set(key, { count: 1, resetTime: now });
    return true;
  }

  if (userLimit.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  userLimit.count++;
  return true;
}

export async function POST(request: NextRequest) {
  // Check rate limit first
  const rateLimitKey = getRateLimitKey(request);
  if (!checkRateLimit(rateLimitKey)) {
    return NextResponse.json({
      success: true,
      response:
        "I'm receiving a lot of messages right now. Please wait a moment before sending another message, or use the WhatsApp button to contact us directly! 📞",
    });
  }

  try {
    const { message, sessionId } = await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Get or create conversation state
    const conversationKey = sessionId || "default";
    let conversationState = conversationStore.get(conversationKey);

    if (!conversationState) {
      conversationState = initializeConversation();
    }

    // Connect to database and get property context
    await connectDB();
    const propertyContext = await getPropertyContext(message);

    // Generate AI response using custom system
    const { response, newState } = generateCustomAIResponse(
      message,
      conversationState,
      propertyContext
    );

    // Update conversation state
    conversationStore.set(conversationKey, newState);

    return NextResponse.json({
      success: true,
      response: response,
      sessionId: conversationKey,
      conversationStep: newState.step,
      debug: {
        intent: newState.userIntent,
        budget: newState.budget,
        area: newState.area,
        propertyType: newState.propertyType,
      },
    });
  } catch (error) {
    console.error("Custom AI Chat error:", error);

    // Always provide a helpful fallback response
    return NextResponse.json({
      success: true,
      response:
        "I'm here to help you with your real estate needs! 🏠 Are you looking to **buy**, **rent**, or **sell** a property?",
    });
  }
}

// GET method for health check
export async function GET() {
  return NextResponse.json({
    success: true,
    message: "AI Chat API is running with custom conversation system",
    timestamp: new Date().toISOString(),
  });
}

async function getPropertyContext(
  userMessage: string
): Promise<PropertyContext> {
  try {
    const message = userMessage.toLowerCase();
    let properties: any[] = [];
    let propertyTypes: any[] = [];

    // Get property types
    const propertyTypesResult = await PropertyTypeService.findAll({});
    propertyTypes = propertyTypesResult.propertyTypes;

    // Search for relevant properties based on message content
    if (
      message.includes("villa") ||
      message.includes("apartment") ||
      message.includes("office") ||
      message.includes("property") ||
      message.includes("rent") ||
      message.includes("buy") ||
      message.includes("$") ||
      /\d{3,}/.test(message)
    ) {
      // Build search query
      const searchQuery: any = {};

      // Filter by property type if mentioned
      if (message.includes("villa")) {
        const villaType = propertyTypes.find((pt) =>
          pt.name.toLowerCase().includes("villa")
        );
        if (villaType) searchQuery.propertyType = villaType._id;
      } else if (message.includes("apartment")) {
        const aptType = propertyTypes.find((pt) =>
          pt.name.toLowerCase().includes("apartment")
        );
        if (aptType) searchQuery.propertyType = aptType._id;
      } else if (message.includes("office")) {
        const officeType = propertyTypes.find((pt) =>
          pt.name.toLowerCase().includes("office")
        );
        if (officeType) searchQuery.propertyType = officeType._id;
      }

      // Filter by price range if mentioned
      if (message.includes("cheap") || message.includes("affordable")) {
        searchQuery.price = { $lt: 500000 };
      } else if (message.includes("luxury") || message.includes("expensive")) {
        searchQuery.price = { $gt: 1000000 };
      }

      // Extract budget numbers
      const budgetMatch = message.match(/\$?(\d{1,3}(?:,?\d{3,6})?)/);
      if (budgetMatch) {
        const budget = parseInt(budgetMatch[1].replace(",", ""));
        if (budget < 5000) {
          // Likely monthly rent - convert to rough purchase price
          searchQuery.price = { $lt: budget * 300 };
        } else {
          // Likely purchase price or high rent
          searchQuery.price = { $lte: budget };
        }
      }

      // Filter by location keywords
      const locationKeywords = extractLocationKeywords(message);
      if (locationKeywords.length > 0) {
        searchQuery.$or = locationKeywords.map((keyword) => ({
          $or: [
            { location: new RegExp(keyword, "i") },
            { address: new RegExp(keyword, "i") },
            { title: new RegExp(keyword, "i") },
          ],
        }));
      }

      // Get matching properties
      const { db } = await connectDB();
      const propertiesCollection = db.collection("properties");

      properties = await propertiesCollection
        .find(searchQuery)
        .limit(6)
        .toArray();

      // If no specific matches, get featured properties
      if (properties.length === 0) {
        properties = await PropertyService.findFeatured(6);
      }
    }

    // Get general statistics for context
    const stats = await PropertyService.getStats();
    const { db } = await connectDB();
    const propertiesCollection = db.collection("properties");
    const averagePrice = await propertiesCollection
      .aggregate([{ $group: { _id: null, avgPrice: { $avg: "$price" } } }])
      .toArray();

    return {
      properties,
      propertyTypes,
      totalProperties: stats.total,
      averagePrice: averagePrice[0]?.avgPrice || 0,
    };
  } catch (error) {
    console.error("Error getting property context:", error);
    return {
      properties: [],
      propertyTypes: [],
      totalProperties: 0,
      averagePrice: 0,
    };
  }
}

function extractLocationKeywords(message: string): string[] {
  const locationIndicators = [
    /\bin\s+([a-zA-Z\s]+?)(?:\s|$|[.!?])/gi,
    /\bnear\s+([a-zA-Z\s]+?)(?:\s|$|[.!?])/gi,
    /\sat\s+([a-zA-Z\s]+?)(?:\s|$|[.!?])/gi,
  ];

  const keywords: string[] = [];
  locationIndicators.forEach((regex) => {
    const matches = message.matchAll(regex);
    for (const match of matches) {
      if (match[1] && match[1].trim().length > 2) {
        keywords.push(match[1].trim());
      }
    }
  });

  return keywords;
}
