import { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";

// Store Server-Sent Events connections by user ID with additional metadata
const connections = new Map<
  string,
  {
    controller: ReadableStreamDefaultController;
    heartbeat: NodeJS.Timeout;
    encoder: TextEncoder;
  }
>();

export async function GET(request: NextRequest) {
  let userId: string;
  let heartbeat: NodeJS.Timeout;

  try {
    const token = request.cookies.get("auth-token")?.value;

    if (!token) {
      return new Response("Unauthorized", { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return new Response("Invalid token", { status: 401 });
    }

    userId = decoded.userId;
    const encoder = new TextEncoder();

    // Create Server-Sent Events stream
    const stream = new ReadableStream({
      start(controller) {
        try {
          // Clean up any existing connection for this user
          const existingConnection = connections.get(userId);
          if (existingConnection) {
            clearInterval(existingConnection.heartbeat);
            connections.delete(userId);
          }

          // Send initial connection message
          const connectMessage = `data: ${JSON.stringify({
            type: "connected",
            message: "Notification stream connected",
            timestamp: Date.now(),
          })}\n\n`;

          controller.enqueue(encoder.encode(connectMessage));

          // Keep connection alive with heartbeat
          heartbeat = setInterval(() => {
            try {
              const heartbeatMessage = `data: ${JSON.stringify({
                type: "heartbeat",
                timestamp: Date.now(),
              })}\n\n`;

              controller.enqueue(encoder.encode(heartbeatMessage));
            } catch (error) {
              console.error("Heartbeat error:", error);
              clearInterval(heartbeat);
              connections.delete(userId);
            }
          }, 30000); // 30 second heartbeat

          // Store connection for this user
          connections.set(userId, { controller, heartbeat, encoder });

          console.log(`SSE connection established for user: ${userId}`);
        } catch (error) {
          console.error("Error in SSE start:", error);
          throw error;
        }
      },
      cancel() {
        try {
          console.log(`SSE connection cancelled for user: ${userId}`);
          // Clean up on disconnect
          const connection = connections.get(userId);
          if (connection) {
            clearInterval(connection.heartbeat);
            connections.delete(userId);
          }
          if (heartbeat) {
            clearInterval(heartbeat);
          }
        } catch (error) {
          console.error("Error in SSE cancel:", error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Cache-Control",
      },
    });
  } catch (error) {
    console.error("SSE connection error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

// Utility function to send notifications to a specific user
export function sendNotificationToUser(userId: string, notification: any) {
  try {
    const connection = connections.get(userId);
    if (connection && connection.controller) {
      const message = `data: ${JSON.stringify({
        type: "notification",
        data: notification,
      })}\n\n`;

      connection.controller.enqueue(connection.encoder.encode(message));
      console.log(`Notification sent to user ${userId}:`, notification.title);
      return true;
    }
    console.log(`No connection found for user: ${userId}`);
    return false;
  } catch (error) {
    console.error("Error sending notification to user:", error);
    // Clean up failed connection
    const connection = connections.get(userId);
    if (connection) {
      clearInterval(connection.heartbeat);
      connections.delete(userId);
    }
    return false;
  }
}

// Utility function to broadcast to all connected users
export function broadcastNotification(notification: any) {
  let sentCount = 0;

  connections.forEach((connection, userId) => {
    try {
      const message = `data: ${JSON.stringify({
        type: "notification",
        data: notification,
      })}\n\n`;

      connection.controller.enqueue(connection.encoder.encode(message));
      sentCount++;
    } catch (error) {
      console.error(`Error broadcasting to user ${userId}:`, error);
      // Clean up failed connection
      clearInterval(connection.heartbeat);
      connections.delete(userId);
    }
  });
  return sentCount;
}

// Utility function to send unread count updates
export function sendUnreadCountUpdate(userId: string, count: number) {
  try {
    const connection = connections.get(userId);
    if (connection && connection.controller) {
      const message = `data: ${JSON.stringify({
        type: "unread_count",
        count: count,
      })}\n\n`;

      connection.controller.enqueue(connection.encoder.encode(message));
      console.log(`Unread count update sent to user ${userId}:`, count);
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error sending unread count update:", error);
    // Clean up failed connection
    const connection = connections.get(userId);
    if (connection) {
      clearInterval(connection.heartbeat);
      connections.delete(userId);
    }
    return false;
  }
}
