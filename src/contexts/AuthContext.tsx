"use client";

import AuthLoading from "@/components/auth/AuthLoading";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface User {
  id: string;
  fullName: string;
  avatar: string;
  email: string;
  companyName: string;
  domainName: string;
  selectedPlan: "starter" | "pro" | "agency";
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshAuth: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Check if auth-token cookie exists (HTTP-only cookies aren't accessible via JS)
      // So we'll just make the request and let the server read the cookie
      const response = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "include", // Important: Include cookies in the request
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData.user);
      } else {
        // Invalid or missing token
        setUser(null);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies in request
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Login failed");
      }

      const data = await response.json();

      // Cookie is already set by the server as HTTP-only
      // Just update the user state
      setUser(data.user);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Call logout API to clear HTTP-only cookie
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout API error:", error);
    }

    // Clear user state
    setUser(null);

    // Redirect to login page
    window.location.href = "/login";
  };

  const refreshAuth = async () => {
    await checkAuth();
  };

  const value = {
    user,
    isLoading,
    login,
    logout,
    refreshAuth,
    isAuthenticated,
  };

  if (isLoading) {
    return <AuthLoading />;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
