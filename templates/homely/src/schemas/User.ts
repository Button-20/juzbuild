import { ObjectId } from "mongodb";
import { z } from "zod";

// User Schema
export const UserSchema = z.object({
  _id: z.instanceof(ObjectId).optional(),
  name: z.string().min(1, "Name is required").trim(),
  email: z.string().email("Invalid email").toLowerCase().trim(),
  password: z.string().optional(),
  role: z.enum(["user"]).default("user"),
  avatar: z.string().default(""),
  provider: z.enum(["credentials", "google"]).default("credentials"),
  providerId: z.string().optional(),
  isActive: z.boolean().default(true),
  lastLogin: z.date().optional(),
  resetPasswordToken: z.string().optional(),
  resetPasswordExpires: z.date().optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

// User input schemas
export const CreateUserSchema = UserSchema.omit({
  _id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const UpdateUserSchema = UserSchema.omit({
  _id: true,
  createdAt: true,
}).partial();

export const LoginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email("Invalid email"),
});

export const ResetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Type exports
export type User = z.infer<typeof UserSchema>;
export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;
