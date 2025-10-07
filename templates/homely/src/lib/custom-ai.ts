// Custom AI Chat System - No OpenAI dependency
// Conversation-driven real estate assistant

// Chat message interface
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// Conversation state interface
export interface ConversationState {
  step: ConversationStep;
  userIntent?: "buy" | "rent" | "sell";
  budget?: string;
  area?: string;
  propertyType?: string;
  bedrooms?: number;
  contactInfo?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  collectedData?: Record<string, any>;
}

// Conversation steps
export enum ConversationStep {
  GREETING = "greeting",
  INTENT_DETECTION = "intent_detection",
  BUDGET_COLLECTION = "budget_collection",
  AREA_COLLECTION = "area_collection",
  PROPERTY_PREFERENCES = "property_preferences",
  PROPERTY_SUGGESTIONS = "property_suggestions",
  VISIT_SCHEDULING = "visit_scheduling",
  CONTACT_COLLECTION = "contact_collection",
  LEAD_COMPLETION = "lead_completion",
}

// Property context interface
export interface PropertyContext {
  properties: any[];
  propertyTypes: any[];
  totalProperties: number;
  averagePrice: number;
}

// Format price for display
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

// Initialize conversation state
export const initializeConversation = (): ConversationState => ({
  step: ConversationStep.GREETING,
  collectedData: {},
});

// Extract user intent from message
export const extractUserIntent = (
  message: string
): "buy" | "rent" | "sell" | null => {
  const lowerMessage = message.toLowerCase();

  if (
    lowerMessage.includes("rent") ||
    lowerMessage.includes("rental") ||
    lowerMessage.includes("lease")
  ) {
    return "rent";
  }
  if (
    lowerMessage.includes("buy") ||
    lowerMessage.includes("purchase") ||
    lowerMessage.includes("buying")
  ) {
    return "buy";
  }
  if (
    lowerMessage.includes("sell") ||
    lowerMessage.includes("selling") ||
    lowerMessage.includes("list")
  ) {
    return "sell";
  }
  return null;
};

// Extract budget information
export const extractBudget = (message: string): string | null => {
  const lowerMessage = message.toLowerCase();

  // Look for common budget patterns
  const budgetPatterns = [
    /\$?(\d{1,3},?\d{3,6})/,
    /(\d{1,3})k/i,
    /under (\d+)/,
    /below (\d+)/,
    /around (\d+)/,
    /(\d+) thousand/,
    /(\d+) million/,
  ];

  for (const pattern of budgetPatterns) {
    const match = message.match(pattern);
    if (match) {
      return match[0];
    }
  }

  // Check for budget ranges
  if (
    lowerMessage.includes("budget") ||
    lowerMessage.includes("afford") ||
    lowerMessage.includes("price")
  ) {
    return "mentioned budget";
  }

  return null;
};

// Extract area/location information
export const extractArea = (message: string): string | null => {
  const lowerMessage = message.toLowerCase();

  // Common location indicators
  const locationKeywords = [
    "downtown",
    "center",
    "city center",
    "urban",
    "suburb",
    "residential",
    "near",
    "close to",
    "around",
    "in",
    "at",
    "location",
    "area",
    "district",
    "neighborhood",
    "community",
    "zone",
  ];

  for (const keyword of locationKeywords) {
    if (lowerMessage.includes(keyword)) {
      // Try to extract the location name
      const words = message.split(" ");
      const keywordIndex = words.findIndex((word) =>
        word.toLowerCase().includes(keyword)
      );
      if (keywordIndex >= 0 && keywordIndex < words.length - 1) {
        return words.slice(keywordIndex, keywordIndex + 3).join(" ");
      }
      return keyword;
    }
  }

  return null;
};

// Extract contact information
export const extractContactInfo = (
  message: string
): Partial<ConversationState["contactInfo"]> => {
  const contactInfo: Partial<ConversationState["contactInfo"]> = {};

  // Email pattern
  const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  const emailMatch = message.match(emailPattern);
  if (emailMatch) {
    contactInfo.email = emailMatch[0];
  }

  // Phone pattern (various formats)
  const phonePattern = /(\+?1?[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
  const phoneMatch = message.match(phonePattern);
  if (phoneMatch) {
    contactInfo.phone = phoneMatch[0];
  }

  // Name extraction (if preceded by "I'm", "My name is", etc.)
  const namePatterns = [
    /(?:i'?m|my name is|call me|this is)\s+([a-zA-Z\s]{2,30})/i,
    /^([a-zA-Z\s]{2,30})(?:\s|$)/, // First words if they look like a name
  ];

  for (const pattern of namePatterns) {
    const match = message.match(pattern);
    if (match && match[1] && !match[1].toLowerCase().includes("interested")) {
      contactInfo.name = match[1].trim();
      break;
    }
  }

  return contactInfo;
};

// Generate response based on conversation state and user message
export const generateCustomAIResponse = (
  userMessage: string,
  conversationState: ConversationState,
  propertyContext?: PropertyContext
): { response: string; newState: ConversationState } => {
  const newState = { ...conversationState };
  let response = "";

  switch (conversationState.step) {
    case ConversationStep.GREETING:
      response =
        "Hello! 👋 Welcome to our real estate platform. I'm here to help you find your perfect property. Are you looking to **buy**, **rent**, or **sell** a property today?";
      newState.step = ConversationStep.INTENT_DETECTION;
      break;

    case ConversationStep.INTENT_DETECTION:
      const intent = extractUserIntent(userMessage);
      if (intent) {
        newState.userIntent = intent;
        newState.step = ConversationStep.BUDGET_COLLECTION;

        if (intent === "rent") {
          response =
            "Great choice! 🏠 I'd love to help you find a rental property. What's your monthly budget range? \n\nFor example: '$1,500-2,000' or 'around $1,800'";
        } else if (intent === "buy") {
          response =
            "Excellent! 🏡 I'll help you find properties to purchase. What's your budget range? \n\nYou can say something like: '$300,000-500,000' or 'under $400k'";
        } else if (intent === "sell") {
          response =
            "Perfect! 💼 I can help you sell your property. To get started, could you tell me about your property? What type is it and where is it located?";
          newState.step = ConversationStep.PROPERTY_PREFERENCES;
        }
      } else {
        response =
          "I'd be happy to help! Could you clarify if you're looking to:\n• **Buy** a property\n• **Rent** a property\n• **Sell** your property\n\nThis will help me assist you better! 😊";
      }
      break;

    case ConversationStep.BUDGET_COLLECTION:
      const budget = extractBudget(userMessage);
      if (budget || userMessage.includes("$") || userMessage.match(/\d+/)) {
        newState.budget = userMessage;
        newState.step = ConversationStep.AREA_COLLECTION;
        response = `Perfect! 💰 So you're looking at **${userMessage}** for ${
          newState.userIntent === "rent" ? "monthly rent" : "purchase price"
        }. \n\nWhich area or neighborhood interests you most? You can be specific like 'Downtown' or general like 'near the city center'. 📍`;
      } else {
        response =
          "I'd like to help you find properties in your budget range. Could you share your budget? \n\n💡 Examples:\n• '$1,500/month' (for rentals)\n• '$300,000-400,000' (for purchases)\n• 'Around $250k'";
      }
      break;

    case ConversationStep.AREA_COLLECTION:
      const area = extractArea(userMessage);
      if (area || userMessage.trim().length > 3) {
        newState.area = userMessage;
        newState.step = ConversationStep.PROPERTY_PREFERENCES;

        const propertyTypeQuestion =
          newState.userIntent === "sell"
            ? "Great! 🏠 Now, what type of property do you have? \n\n• Apartment\n• Villa\n• House\n• Office\n• Other?"
            : "Perfect! 🎯 What type of property are you interested in? \n\n• **Apartment** - Modern living spaces\n• **Villa** - Luxury homes with space\n• **House** - Family-friendly options\n• **Office** - Commercial spaces\n\nAny preference?";
        response = propertyTypeQuestion;
      } else {
        response =
          "Could you tell me which area or neighborhood you're interested in? 🗺️\n\n💡 Examples:\n• 'Downtown'\n• 'Suburban area'\n• 'Near the business district'\n• 'City center'";
      }
      break;

    case ConversationStep.PROPERTY_PREFERENCES:
      newState.propertyType = userMessage;

      if (newState.userIntent === "sell") {
        newState.step = ConversationStep.CONTACT_COLLECTION;
        response =
          "Thank you for the information! 📝 I'd like to have one of our property specialists contact you to discuss selling your property. \n\nCould you share your contact information?\n• **Name**\n• **Email** or **Phone number**";
      } else {
        newState.step = ConversationStep.PROPERTY_SUGGESTIONS;
        response = generatePropertySuggestions(newState, propertyContext);
      }
      break;

    case ConversationStep.PROPERTY_SUGGESTIONS:
      if (
        userMessage.toLowerCase().includes("yes") ||
        userMessage.toLowerCase().includes("interested") ||
        userMessage.toLowerCase().includes("schedule") ||
        userMessage.toLowerCase().includes("visit")
      ) {
        newState.step = ConversationStep.VISIT_SCHEDULING;
        response =
          "Excellent! 📅 I'd love to schedule a property visit for you. \n\nWhen would work best for you?\n• **This week** or **next week**?\n• **Morning**, **afternoon**, or **evening**?";
      } else if (
        userMessage.toLowerCase().includes("more") ||
        userMessage.toLowerCase().includes("other") ||
        userMessage.toLowerCase().includes("different")
      ) {
        response = generatePropertySuggestions(newState, propertyContext, true);
      } else {
        newState.step = ConversationStep.VISIT_SCHEDULING;
        response =
          "Would you like to schedule a visit to see any of these properties in person? 🏠✨ I can arrange a viewing at your convenience!";
      }
      break;

    case ConversationStep.VISIT_SCHEDULING:
      newState.collectedData!.preferredVisitTime = userMessage;
      newState.step = ConversationStep.CONTACT_COLLECTION;
      response =
        "Perfect! 📋 To schedule your property visit, I'll need your contact information. \n\nCould you please share:\n• **Your name**\n• **Email address**\n• **Phone number**";
      break;

    case ConversationStep.CONTACT_COLLECTION:
      const contactInfo = extractContactInfo(userMessage);
      newState.contactInfo = { ...newState.contactInfo, ...contactInfo };

      // Check if we have enough contact info
      const hasName =
        newState.contactInfo?.name || userMessage.split(" ").length >= 2;
      const hasEmail = newState.contactInfo?.email;
      const hasPhone = newState.contactInfo?.phone;

      if (hasName && (hasEmail || hasPhone)) {
        if (!newState.contactInfo!.name && userMessage.split(" ").length >= 2) {
          newState.contactInfo!.name = userMessage
            .split(" ")
            .slice(0, 2)
            .join(" ");
        }

        newState.step = ConversationStep.LEAD_COMPLETION;
        response = generateLeadCompletionResponse(newState);

        // Save the lead to your database
        saveLead(newState);
      } else {
        response =
          "I'd like to make sure I can reach you! 📞 Could you please provide:\n\n• **Your full name**\n• **Email address** or **phone number**\n\n💡 Example: 'John Smith, john@email.com, 555-123-4567'";
      }
      break;

    case ConversationStep.LEAD_COMPLETION:
      response =
        "Thank you for using our property assistant! 🙏 Is there anything else I can help you with today? \n\nYou can also use the WhatsApp button below to speak directly with our team! 💬";
      newState.step = ConversationStep.GREETING; // Reset for new conversation
      break;

    default:
      response =
        "I'm here to help you with your real estate needs! 🏠 Are you looking to **buy**, **rent**, or **sell** a property?";
      newState.step = ConversationStep.INTENT_DETECTION;
  }

  return { response, newState };
};

// Generate property suggestions based on user preferences
const generatePropertySuggestions = (
  state: ConversationState,
  propertyContext?: PropertyContext,
  showDifferent: boolean = false
): string => {
  let response = `🎯 **Based on your preferences:**\n• ${state.userIntent?.toUpperCase()} • ${
    state.budget
  } • ${state.area} • ${
    state.propertyType
  }\n\n🏠 **Here are some great options:**\n\n`;

  if (propertyContext && propertyContext.properties.length > 0) {
    const properties = showDifferent
      ? propertyContext.properties.slice(3, 6)
      : propertyContext.properties.slice(0, 3);

    properties.forEach((property, index) => {
      response += `**${index + 1}. ${property.title}**\n`;
      response += `📍 ${property.location}\n`;
      response += `💰 ${formatPrice(property.price)}${
        state.userIntent === "rent" ? "/month" : ""
      }\n`;
      response += `🏠 ${property.bedrooms} bed, ${property.bathrooms} bath • 📐 ${property.area} sq ft\n\n`;
    });
  } else {
    // Fallback suggestions
    response +=
      "**1. Modern Family Home**\n📍 Downtown Area\n💰 $350,000\n🏠 3 bed, 2 bath • 📐 1,200 sq ft\n\n";
    response +=
      "**2. Luxury Apartment**\n📍 City Center\n💰 $275,000\n🏠 2 bed, 2 bath • 📐 900 sq ft\n\n";
    response +=
      "**3. Spacious Villa**\n📍 Residential District\n💰 $450,000\n🏠 4 bed, 3 bath • 📐 1,800 sq ft\n\n";
  }

  response +=
    "✨ **Interested in any of these?** I can schedule a visit for you! Just say 'Yes' or 'Schedule visit' 📅";

  return response;
};

// Generate lead completion response
const generateLeadCompletionResponse = (state: ConversationState): string => {
  const action =
    state.userIntent === "sell" ? "property evaluation" : "property viewing";

  return `🎉 **Perfect! Here's your request summary:**

👤 **Your Details:**
• **Name:** ${state.contactInfo?.name}
• **Email:** ${state.contactInfo?.email || "Not provided"}
• **Phone:** ${state.contactInfo?.phone || "Not provided"}

🏠 **Property Request:**
• **Interest:** ${state.userIntent?.toUpperCase()}
• **Budget:** ${state.budget || "To be discussed"}
• **Area:** ${state.area || "Flexible"}
• **Type:** ${state.propertyType || "Any"}

⚡ **What happens next:**
• Our specialist will contact you within **24 hours**
• We'll ${
    state.userIntent === "sell"
      ? "schedule a **property evaluation**"
      : "arrange **property viewings**"
  }
• You'll get **personalized recommendations**

🚀 **Thank you for choosing us!** We're excited to help you with your real estate journey! 

*Your lead has been sent instantly to our team* ✅`;
};

// Save lead to database/email
const saveLead = async (state: ConversationState) => {
  const leadData = {
    intent: state.userIntent,
    budget: state.budget,
    area: state.area,
    propertyType: state.propertyType,
    contactInfo: state.contactInfo,
    preferredVisitTime: state.collectedData?.preferredVisitTime,
    timestamp: new Date().toISOString(),
    source: "AI Chatbot",
  };

  console.log("🎯 New Lead Generated:", leadData);

  try {
    // Send to your lead management system
    const response = await fetch("/api/leads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(leadData),
    });

    if (response.ok) {
      console.log("✅ Lead saved successfully");
    } else {
      console.log("⚠️ Failed to save lead to database");
    }
  } catch (error) {
    console.error("❌ Error saving lead:", error);
  }

  // Also trigger email notification
  try {
    await fetch("/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: state.contactInfo?.name || "New Lead",
        email: state.contactInfo?.email || "Not provided",
        phone: state.contactInfo?.phone || "Not provided",
        message: `New ${state.userIntent} lead from AI chatbot:
        
Budget: ${state.budget}
Area: ${state.area}  
Property Type: ${state.propertyType}
Preferred Visit Time: ${
          state.collectedData?.preferredVisitTime || "Not specified"
        }

This lead was automatically generated by the AI chatbot.`,
        propertyName: `AI Chatbot Lead - ${state.userIntent}`,
        propertyUrl: window.location.href,
      }),
    });
  } catch (error) {
    console.error("❌ Error sending lead email:", error);
  }
};

// Validate configuration (always valid for custom AI)
export const validateAIConfig = (): boolean => {
  return true; // Custom AI doesn't need external API
};

// Generate fallback responses (for compatibility)
export const generateFallbackResponse = (message: string): string => {
  return "I'm here to help you with your real estate needs! 🏠 Are you looking to **buy**, **rent**, or **sell** a property?";
};
