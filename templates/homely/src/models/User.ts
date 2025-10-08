import { z } from "zod";

export const userSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6).optional(),
  role: z.enum(["user"]).default("user"),
  avatar: z.string().optional(),
  provider: z.enum(["credentials", "google"]).default("credentials"),
  providerId: z.string().optional(),
  isActive: z.boolean().default(true),
  lastLogin: z.date().optional(),
  resetPasswordToken: z.string().optional(),
  resetPasswordExpires: z.date().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type User = z.infer<typeof userSchema>;
