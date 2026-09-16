import { z } from "zod";

/**
 * Format Zod validation errors safely across Zod versions (v3 and v4)
 */
export function formatZodError(error) {
  if (!error) return { message: "Validation error", issues: [] };
  const issues = Array.isArray(error.issues)
    ? error.issues
    : Array.isArray(error.errors)
    ? error.errors
    : [];
  const message = issues[0]?.message || error.message || "Invalid input data";
  return { message, issues };
}

// Strict email regex requiring proper user, domain, and top-level domain
export const strictEmailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const registerSchema = z.object({
  email: z
    .string({ required_error: "Email address is required" })
    .trim()
    .min(1, "Email address is required")
    .regex(strictEmailRegex, "Please enter a valid email address format (e.g. name@example.com)")
    .toLowerCase(),
  password: z
    .string({ required_error: "Password is required" })
    .min(6, "Password must be at least 6 characters"),
  firstName: z
    .string({ required_error: "First name is required" })
    .trim()
    .min(1, "First name is required")
    .max(50, "First name must be less than 50 characters"),
  lastName: z
    .string()
    .trim()
    .max(50, "Last name must be less than 50 characters")
    .optional()
    .default(""),
  selectedCharityId: z.string().optional().nullable(),
  charityContributionPercent: z
    .number()
    .min(10, "Minimum contribution is 10%")
    .max(100, "Maximum contribution is 100%")
    .default(10),
});

export const loginSchema = z.object({
  email: z
    .string({ required_error: "Email address is required" })
    .trim()
    .min(1, "Email address is required")
    .regex(strictEmailRegex, "Please enter a valid email address format (e.g. name@example.com)")
    .toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

export const userProfileUpdateSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "First name cannot be empty")
    .max(50, "First name must be less than 50 characters")
    .optional(),
  lastName: z
    .string()
    .trim()
    .max(50, "Last name must be less than 50 characters")
    .optional()
    .default(""),
  selectedCharityId: z.string().nullable().optional(),
  charityContributionPercent: z
    .number()
    .min(10, "Minimum contribution is 10%")
    .max(100, "Maximum contribution is 100%")
    .optional(),
});

// PRD § 05: Stableford format (1-45), exactly one date
export const scoreSubmissionSchema = z.object({
  score: z
    .number({ invalid_type_error: "Score must be a number" })
    .int("Score must be an integer")
    .min(1, "Stableford score must be between 1 and 45")
    .max(45, "Stableford score must be between 1 and 45"),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format. Use YYYY-MM-DD",
  }),
  courseName: z.string().trim().optional().default("Course Round"),
});

export const scoreUpdateSchema = z.object({
  score: z
    .number({ invalid_type_error: "Score must be a number" })
    .int("Score must be an integer")
    .min(1, "Stableford score must be between 1 and 45")
    .max(45, "Stableford score must be between 1 and 45")
    .optional(),
  courseName: z.string().trim().optional(),
});

export const charitySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").trim(),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase alphanumeric and hyphens")
    .trim(),
  tagline: z.string().min(5, "Tagline is required").trim(),
  description: z.string().min(10, "Description must be at least 10 characters").trim(),
  category: z.enum([
    "Healthcare",
    "Youth & Education",
    "Veterans",
    "Environment",
    "Disaster Relief",
    "Community",
  ]),
  logoUrl: z.string().url("Valid logo URL is required"),
  bannerUrl: z.string().url("Valid banner URL is required"),
  websiteUrl: z.string().url("Valid website URL is required").optional().or(z.literal("")),
  isFeatured: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true),
});

export const donationSchema = z.object({
  charityId: z.string().min(1, "Charity ID is required"),
  amount: z.number().min(1, "Minimum donation is $1"),
  donorName: z.string().trim().optional().default("Anonymous Donor"),
  donorEmail: z.string().email("Valid donor email is required"),
  message: z.string().trim().optional().default(""),
});

export const drawSimulationSchema = z.object({
  drawMonth: z.string().regex(/^\d{4}-\d{2}$/, "drawMonth must be formatted as YYYY-MM"),
  algorithmType: z.enum(["random", "frequency_weighted"]).default("random"),
});

export const drawPublishSchema = z.object({
  drawMonth: z.string().regex(/^\d{4}-\d{2}$/, "drawMonth must be formatted as YYYY-MM"),
  algorithmType: z.enum(["random", "frequency_weighted"]),
  drawnNumbers: z
    .array(z.number().int().min(1).max(45))
    .length(5, "drawnNumbers must contain exactly 5 numbers")
    .refine((nums) => new Set(nums).size === 5, {
      message: "drawnNumbers must contain 5 unique numbers",
    }),
  confirmationPhrase: z
    .string()
    .transform((val) => val.trim().toUpperCase())
    .refine((val) => val === "CONFIRM PUBLISH", {
      message: "Must confirm with exact phrase 'CONFIRM PUBLISH'",
    }),
});

export const proofSubmissionSchema = z.object({
  proofScreenshotUrl: z.string().url("Must be a valid screenshot URL"),
});

export const winnerReviewSchema = z.object({
  action: z.enum(["approve", "reject"]),
  rejectionReason: z.string().optional(),
});

export const winnerPayoutSchema = z.object({
  payoutMethod: z.string().min(1, "Payout method is required"),
  payoutReference: z.string().min(1, "Payout transaction reference is required"),
});
