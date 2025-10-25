import { z } from "zod";

// Lead status enum
export enum LeadStatus {
  NEW = "new",
  CONTACTED = "contacted",
  QUALIFIED = "qualified",
  CONVERTED = "converted",
  CLOSED = "closed",
  LOST = "lost",
}

// Lead source enum
export enum LeadSource {
  CONTACT_FORM = "contact_form",
  PROPERTY_INQUIRY = "property_inquiry",
  PHONE_CALL = "phone_call",
  EMAIL = "email",
  SOCIAL_MEDIA = "social_media",
  REFERRAL = "referral",
  WEBSITE = "website",
  ADVERTISEMENT = "advertisement",
  OTHER = "other",
}

// Lead priority enum
export enum LeadPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  URGENT = "urgent",
}

// Lead interface
export interface Lead {
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  source: LeadSource;
  status: LeadStatus;
  priority: LeadPriority;
  subject?: string;
  message?: string;
  propertyInterest?: string; // Property ID they're interested in
  budget?: string;
  timeline?: string;
  assignedTo?: string; // User ID of assigned agent
  tags?: string[];
  notes?: string;
  lastContactDate?: Date;
  nextFollowUpDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  userId?: string; // Owner of the lead (for multi-tenant)
  ipAddress?: string;
  userAgent?: string;
}

// Zod schemas for validation
export const leadSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  email: z
    .string()
    .email("Please enter a valid email address")
    .max(100, "Email must be less than 100 characters"),
  phone: z
    .string()
    .max(20, "Phone number must be less than 20 characters")
    .optional()
    .or(z.literal("")),
  company: z
    .string()
    .max(100, "Company name must be less than 100 characters")
    .optional()
    .or(z.literal("")),
  source: z.nativeEnum(LeadSource),
  status: z.nativeEnum(LeadStatus).optional().default(LeadStatus.NEW),
  priority: z.nativeEnum(LeadPriority).optional().default(LeadPriority.MEDIUM),
  subject: z
    .string()
    .max(200, "Subject must be less than 200 characters")
    .optional()
    .or(z.literal("")),
  message: z
    .string()
    .max(2000, "Message must be less than 2000 characters")
    .optional()
    .or(z.literal("")),
  propertyInterest: z.string().optional().or(z.literal("")),
  budget: z
    .string()
    .max(100, "Budget must be less than 100 characters")
    .optional()
    .or(z.literal("")),
  timeline: z
    .string()
    .max(100, "Timeline must be less than 100 characters")
    .optional()
    .or(z.literal("")),
  assignedTo: z.string().optional().or(z.literal("")),
  tags: z.array(z.string()).optional().default([]),
  notes: z
    .string()
    .max(2000, "Notes must be less than 2000 characters")
    .optional()
    .or(z.literal("")),
  nextFollowUpDate: z.string().optional().or(z.literal("")),
});

export const updateLeadSchema = leadSchema.extend({
  status: z.nativeEnum(LeadStatus),
  priority: z.nativeEnum(LeadPriority),
  lastContactDate: z.string().optional(),
});

// Lead filter schema for API queries
export const leadFilterSchema = z.object({
  status: z.nativeEnum(LeadStatus).optional(),
  source: z.nativeEnum(LeadSource).optional(),
  priority: z.nativeEnum(LeadPriority).optional(),
  assignedTo: z.string().optional(),
  search: z.string().optional(),
  propertyInterest: z.string().optional(),
  createdAfter: z.string().optional(),
  createdBefore: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  sortBy: z.string().optional().default("createdAt"),
  sortDirection: z.enum(["asc", "desc"]).default("desc"),
  userId: z.string().optional(),
});

export type LeadFilter = z.infer<typeof leadFilterSchema>;
export type CreateLeadData = z.infer<typeof leadSchema>;
export type UpdateLeadData = z.infer<typeof updateLeadSchema>;

// Lead stats interface for dashboard
export interface LeadStats {
  total: number;
  new: number;
  contacted: number;
  qualified: number;
  converted: number;
  conversionRate: number;
  thisMonth: number;
  lastMonth: number;
  monthlyGrowth: number;
}
