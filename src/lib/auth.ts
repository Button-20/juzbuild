import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

const JWT_SECRET =
  process.env.JWT_SECRET ||
  "b225f214f1660e420f7aade6fc133112adec572f30790197a0a3819bebb97f5905ac8f310e06f9d9d3c7ab9bf9231cd57fcbe1f075689a8cea12c0e2e3b23681";
const JWT_EXPIRES_IN = "7d";

export interface JWTPayload {
  userId: string;
  email: string;
  companyName: string;
  iat?: number;
  exp?: number;
}

export interface User {
  _id: string;
  fullName: string;
  email: string;
  password: string;
  companyName: string;
  domainName: string;
  country: string;
  city: string;
  tagline?: string;
  aboutSection?: string;
  selectedTheme?: string;
  selectedPlan: string;
  billingCycle: string;
  phoneNumber?: string;
  createdAt: Date;
  updatedAt: Date;
  isActive?: boolean;
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

// Verify password
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Generate JWT token
export function generateToken(
  payload: Omit<JWTPayload, "iat" | "exp">
): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// Verify JWT token
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    console.error("JWT verification failed:", error);
    return null;
  }
}

// Extract token from request
export function getTokenFromRequest(request: NextRequest): string | null {
  // Try to get token from Authorization header
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }

  // Try to get token from cookies
  const token = request.cookies.get("auth-token")?.value;
  return token || null;
}

// Get user from request
export function getUserFromRequest(request: NextRequest): JWTPayload | null {
  const token = getTokenFromRequest(request);
  if (!token) return null;

  return verifyToken(token);
}

// Create session data
export function createSession(user: User) {
  const payload: Omit<JWTPayload, "iat" | "exp"> = {
    userId: user._id,
    email: user.email,
    companyName: user.companyName,
  };

  return {
    token: generateToken(payload),
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      companyName: user.companyName,
      selectedPlan: user.selectedPlan,
    },
  };
}
