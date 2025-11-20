import { useEffect, useRef, useState } from 'react';

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error" | "update" | "reminder";
  category: "system" | "profile" | "billing" | "security" | "feature" | "maintenance";
  isRead: boolean;
  readAt: string | null;
  actionUrl: string | null;
  actionText: string | null;
  createdAt: string;
  updatedAt: string;
}

interface UseNotificationResult {
  isConnected: boolean;
  connectionError: string | null;
  reconnect: () => void;
}

interface NotificationCallbacks {
  onNewNotification?: (notification: Notification) => void;
  onUnreadCountUpdate?: (count: number) => void;
  onConnectionChange?: (connected: boolean) => void;
}

export function useNotificationStream(callbacks?: NotificationCallbacks): UseNotificationResult {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const lastNotificationRef = useRef<string | null>(null);
  const maxReconnectAttempts = 3;
  const usePollingFallback = useRef(false);

  // Polling fallback function
  const startPolling = () => {
    console.log("Starting polling fallback for notifications");
    setIsConnected(true);
    setConnectionError(null);
    usePollingFallback.current = true;
    callbacks?.onConnectionChange?.(true);

    const poll = async () => {
      try {
        const response = await fetch("/api/notifications?limit=1", {
          credentials: "include",
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.notifications.length > 0) {
          const latestNotification = data.notifications[0];
          
          // Check if this is a new notification
          if (lastNotificationRef.current !== latestNotification._id) {
            lastNotificationRef.current = latestNotification._id;
            callbacks?.onNewNotification?.(latestNotification);
          }
          
          // Update unread count
          callbacks?.onUnreadCountUpdate?.(data.unreadCount);
        }
      } catch (error) {
        console.error("Polling error:", error);
        // Don't stop polling on error, just log it
      }
    };

    // Initial poll
    poll();
    
    // Set up polling interval
    pollingIntervalRef.current = setInterval(poll, 10000); // Poll every 10 seconds
  };

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    usePollingFallback.current = false;
  };

  const connectSSE = () => {
    try {
      // Close existing connection
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }

      console.log("Attempting SSE connection...");

      // Create new EventSource connection
      const eventSource = new EventSource("/api/notifications/ws", {
        withCredentials: true,
      });

      eventSource.onopen = () => {
        console.log("SSE notification stream connected");
        setIsConnected(true);
        setConnectionError(null);
        reconnectAttemptsRef.current = 0;
        usePollingFallback.current = false;
        callbacks?.onConnectionChange?.(true);
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          switch (data.type) {
            case "connected":
              console.log("SSE notification stream ready");
              break;

            case "notification":
              console.log("New notification received via SSE:", data.data);
              callbacks?.onNewNotification?.(data.data);
              break;

            case "unread_count":
              callbacks?.onUnreadCountUpdate?.(data.count);
              break;

            case "heartbeat":
              // Keep connection alive
              break;

            default:
              console.log("Unknown SSE message type:", data.type);
          }
        } catch (error) {
          console.error("Error parsing SSE message:", error);
        }
      };

      eventSource.onerror = (error) => {
        console.error("SSE notification stream error:", error);
        setIsConnected(false);
        
        // Check if this is a connection error or auth error
        const errorMessage = eventSource.readyState === EventSource.CLOSED 
          ? "SSE Connection closed" 
          : "SSE Connection error";
          
        setConnectionError(errorMessage);
        callbacks?.onConnectionChange?.(false);
        
        // Close the current connection
        eventSource.close();

        // Try to reconnect or fallback to polling
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = Math.pow(2, reconnectAttemptsRef.current) * 2000; // 2s, 4s, 8s
          console.log(
            `Attempting SSE reconnection in ${delay}ms (attempt ${
              reconnectAttemptsRef.current + 1
            }/${maxReconnectAttempts})`
          );

          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connectSSE();
          }, delay);
        } else {
          console.log("Max SSE reconnection attempts reached, falling back to polling");
          setConnectionError("SSE failed, using polling");
          startPolling();
        }
      };

      eventSourceRef.current = eventSource;
    } catch (error) {
      console.error("Failed to create SSE EventSource:", error);
      setConnectionError("Failed to create SSE connection");
      startPolling(); // Fallback to polling immediately
    }
  };

  const connect = () => {
    // Stop any existing polling
    stopPolling();
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    reconnectAttemptsRef.current = 0;
    
    // Try SSE first, fallback to polling if it fails
    connectSSE();
  };

  const disconnect = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    
    stopPolling();
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    setIsConnected(false);
  };

  const reconnect = () => {
    disconnect();
    setTimeout(connect, 1000); // Wait 1 second before reconnecting
  };

  useEffect(() => {
    connect();

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, []);

  return {
    isConnected,
    connectionError,
    reconnect,
  };
}