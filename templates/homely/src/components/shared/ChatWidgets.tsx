"use client";

import { Icon } from "@iconify/react";
import { useEffect, useRef, useState } from "react";

interface ChatWidgetsProps {
  whatsappNumber?: string;
  whatsappMessage?: string;
}

export default function ChatWidgets({
  whatsappNumber = "+233123456789", // Replace with actual WhatsApp number
  whatsappMessage = "Hi! I'm interested in your real estate properties.",
}: ChatWidgetsProps) {
  const [showAiChat, setShowAiChat] = useState(false);
  const [showWidgets, setShowWidgets] = useState(false);
  const [aiMessages, setAiMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm your AI real estate assistant. I have access to our property database and can help you find the perfect property based on your preferences. What are you looking for today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when messages change
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }, 50); // Small delay to ensure DOM is updated
  };

  // Scroll to bottom when messages update or typing changes
  useEffect(() => {
    scrollToBottom();
  }, [aiMessages, isTyping]);

  // Scroll to bottom when chat opens
  useEffect(() => {
    if (showAiChat) {
      setTimeout(scrollToBottom, 100); // Delay for animation
    }
  }, [showAiChat]);

  // Show widgets after a short delay
  useEffect(() => {
    const timer = setTimeout(() => setShowWidgets(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const openWhatsApp = () => {
    const encodedMessage = encodeURIComponent(whatsappMessage);
    const whatsappUrl = `https://wa.me/${whatsappNumber.replace(
      /[^0-9]/g,
      ""
    )}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: newMessage.trim(),
      sender: "user" as const,
      timestamp: new Date(),
    };

    setAiMessages((prev) => [...prev, userMessage]);
    const currentMessage = newMessage.trim();
    setNewMessage("");
    setIsTyping(true);

    try {
      // Send message to AI API
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: currentMessage,
          conversation: aiMessages.slice(-5).map((msg) => ({
            role: msg.sender === "user" ? "user" : "assistant",
            content: msg.text,
          })),
        }),
      });

      const data = await response.json();

      if (data.success && data.response) {
        setAiMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            text: data.response,
            sender: "bot" as const,
            timestamp: new Date(),
          },
        ]);
      } else {
        throw new Error(data.error || "Failed to get AI response");
      }
    } catch (error) {
      console.error("AI Chat error:", error);
      // Fallback to simple responses if AI fails
      const aiResponse = generateAiResponse(currentMessage);
      setAiMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          text: aiResponse,
          sender: "bot" as const,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const generateAiResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();

    if (message.includes("price") || message.includes("cost")) {
      return "Our properties range from affordable apartments to luxury villas. Would you like me to show you properties within a specific price range?";
    }

    if (message.includes("location") || message.includes("where")) {
      return "We have properties in various prime locations. Which area are you most interested in? I can help you find properties in specific neighborhoods.";
    }

    if (message.includes("bedroom") || message.includes("bed")) {
      return "How many bedrooms are you looking for? We have studio apartments to large family homes with multiple bedrooms.";
    }

    if (
      message.includes("villa") ||
      message.includes("apartment") ||
      message.includes("office")
    ) {
      return "Great choice! We have excellent options in that category. Would you like me to show you some featured properties or help you with specific requirements?";
    }

    if (
      message.includes("contact") ||
      message.includes("phone") ||
      message.includes("email")
    ) {
      return "You can contact us at jasonaddy51@gmail.com or click the WhatsApp button to chat with us directly! We're here to help you find your perfect property.";
    }

    if (
      message.includes("hello") ||
      message.includes("hi") ||
      message.includes("hey")
    ) {
      return "Hello! Welcome to our real estate platform. I'm here to help you find the perfect property. What type of property are you looking for?";
    }

    if (message.includes("thank") || message.includes("thanks")) {
      return "You're very welcome! Is there anything else I can help you with regarding our properties?";
    }

    // Default responses
    const responses = [
      "That's a great question! I'd be happy to help you with that. Can you tell me more about what you're looking for?",
      "I understand you're interested in our properties. Would you like me to show you some options or connect you with one of our agents?",
      "Let me help you find the perfect property! What specific features are you looking for?",
      "I'm here to assist you with all your real estate needs. Would you like to browse our featured properties or get more information about a specific type?",
      "That's interesting! For more detailed information, I'd recommend speaking with one of our expert agents. Would you like me to connect you?",
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  };

  if (!showWidgets) return null;

  return (
    <>
      {/* Chat Widgets Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
        {/* AI Chat Window */}
        {showAiChat && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-80 sm:w-96 h-96 flex flex-col animate-in slide-in-from-bottom-5 fade-in duration-300">
            {/* Chat Header */}
            <div className="bg-primary text-white p-4 rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Icon icon="ph:robot" width={16} height={16} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">AI Assistant</h3>
                  <p className="text-xs text-white/80">Online</p>
                </div>
              </div>
              <button
                onClick={() => setShowAiChat(false)}
                className="p-1 hover:bg-white/20 rounded transition-colors"
              >
                <Icon icon="ph:x" width={16} height={16} />
              </button>
            </div>

            {/* Chat Messages */}
            <div
              className="flex-1 p-4 overflow-y-auto space-y-3 scroll-smooth"
              id="chat-messages"
              style={{ scrollBehavior: "smooth" }}
            >
              {aiMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl ${
                      message.sender === "user"
                        ? "bg-primary text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">
                      {message.text}
                    </p>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-2xl">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Invisible element to scroll to */}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <form
              onSubmit={handleSendMessage}
              className="p-4 border-t border-gray-200 dark:border-gray-600"
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-full focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="bg-primary text-white w-10 h-10 flex justify-center items-center rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Icon icon="ph:paper-plane-tilt" width={16} height={16} />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Widget Buttons */}
        <div className="flex flex-col gap-3">
          {/* WhatsApp Button */}
          <button
            onClick={openWhatsApp}
            className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 group animate-in slide-in-from-right-5 fade-in"
            title="Chat on WhatsApp"
          >
            <Icon icon="ph:whatsapp-logo-fill" width={24} height={24} />
            <span className="absolute right-16 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white px-3 py-1 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              Chat on WhatsApp
            </span>
          </button>

          {/* AI Chat Button */}
          <button
            onClick={() => setShowAiChat(!showAiChat)}
            className="bg-primary hover:bg-primary/90 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 group animate-in slide-in-from-right-5 fade-in"
            title="AI Assistant"
            style={{ animationDelay: "0.1s" }}
          >
            <Icon icon="ph:robot-fill" width={24} height={24} />
            <span className="absolute right-16 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white px-3 py-1 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              AI Assistant
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Chat Overlay */}
      {showAiChat && (
        <div
          className="fixed inset-0 bg-black/50 z-40 sm:hidden"
          onClick={() => setShowAiChat(false)}
        />
      )}
    </>
  );
}
