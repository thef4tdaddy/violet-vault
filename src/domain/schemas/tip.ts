import { z } from "zod";

/**
 * Tip categories for organizing and filtering tips
 */
export enum TipCategory {
  ONBOARDING = "onboarding",
  BUDGETING = "budgeting",
  DEBT_MANAGEMENT = "debt-management",
  BILLS = "bills",
  TRANSACTIONS = "transactions",
  ADVANCED_FEATURES = "advanced-features",
  BEST_PRACTICES = "best-practices",
  SECURITY = "security",
  SYNC = "sync",
  AUTOMATION = "automation",
}

/**
 * Tip priority levels for smart timing
 */
export enum TipPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

/**
 * Contexts where tips can be displayed
 */
export enum TipContext {
  DASHBOARD = "dashboard",
  ENVELOPES = "envelopes",
  TRANSACTIONS = "transactions",
  DEBT = "debt",
  BILLS = "bills",
  SETTINGS = "settings",
  ONBOARDING = "onboarding",
  QUICK_ADD = "quick-add",
  INSIGHTS = "insights",
}

/**
 * Schema for a single tip configuration
 */
export const TipConfigSchema = z.object({
  id: z.string(),
  category: z.nativeEnum(TipCategory),
  priority: z.nativeEnum(TipPriority),
  context: z.array(z.nativeEnum(TipContext)),
  title: z.string().optional(),
  content: z.string(),
  icon: z.string().optional(),
  actionLabel: z.string().optional(),
  actionUrl: z.string().optional(),
  dismissible: z.boolean().default(true),
  showOnce: z.boolean().default(false),
  minUserMaturity: z.number().min(0).max(100).default(0), // 0-100 scale for progressive disclosure
  conditions: z
    .object({
      hasEnvelopes: z.boolean().optional(),
      hasTransactions: z.boolean().optional(),
      hasDebts: z.boolean().optional(),
      hasBills: z.boolean().optional(),
      hasPaychecks: z.boolean().optional(),
      isNewUser: z.boolean().optional(),
      daysSinceSignup: z.number().optional(),
    })
    .optional(),
});

/**
 * Schema for user tip preferences
 */
export const TipPreferencesSchema = z.object({
  tipsEnabled: z.boolean().default(true),
  dismissedTips: z.array(z.string()).default([]),
  viewedTips: z.array(z.string()).default([]),
  lastViewedAt: z.record(z.string(), z.number()).default({}), // tipId -> timestamp
  userMaturityScore: z.number().min(0).max(100).default(0),
});

/**
 * Schema for tip display state
 */
export const TipDisplayStateSchema = z.object({
  tipId: z.string(),
  shown: z.boolean(),
  dismissed: z.boolean(),
  timestamp: z.number(),
});

/**
 * Schema for tip analytics
 */
export const TipAnalyticsSchema = z.object({
  tipId: z.string(),
  views: z.number().default(0),
  dismissals: z.number().default(0),
  interactions: z.number().default(0),
  lastShown: z.number().optional(),
});

/**
 * Type exports
 */
export type TipConfig = z.input<typeof TipConfigSchema>; // Use input type to allow partial optional fields
export type TipPreferences = z.infer<typeof TipPreferencesSchema>;
export type TipDisplayState = z.infer<typeof TipDisplayStateSchema>;
export type TipAnalytics = z.infer<typeof TipAnalyticsSchema>;
