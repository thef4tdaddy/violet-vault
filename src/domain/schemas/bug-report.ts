/**
 * Bug Report Domain Schema
 * Runtime validation for bug report submissions
 * Part of Phase 1: Create BugReportSchema
 */

import { z } from "zod";

/**
 * Bug severity levels
 */
export const BugSeveritySchema = z.enum(["low", "medium", "high", "critical"]);
export type BugSeverity = z.infer<typeof BugSeveritySchema>;

/**
 * System information schema
 */
export const SystemInfoSchema = z.object({
  browser: z.string().optional(),
  version: z.string().optional(),
  platform: z.string().optional(),
  userAgent: z.string().optional(),
  viewport: z
    .object({
      width: z.number().int().positive(),
      height: z.number().int().positive(),
    })
    .optional(),
  performance: z.record(z.string(), z.unknown()).optional(),
  storage: z.record(z.string(), z.unknown()).optional(),
  network: z.record(z.string(), z.unknown()).optional(),
  timestamp: z.string().optional(),
  fallback: z.boolean().optional(),
});

export type SystemInfo = z.infer<typeof SystemInfoSchema>;

/**
 * Context information schema for page/route context
 */
export const ContextInfoSchema = z.object({
  page: z.string().optional(),
  route: z.string().optional(),
  ui: z.record(z.string(), z.unknown()).optional(),
  data: z.record(z.string(), z.unknown()).optional(),
});

export type ContextInfo = z.infer<typeof ContextInfoSchema>;

/**
 * Zod schema for BugReport validation
 * Represents a complete bug report with all metadata
 */
export const BugReportSchema = z.object({
  // Required fields
  title: z
    .string()
    .min(1, "Bug report title is required")
    .max(200, "Title must be 200 characters or less"),

  // Optional descriptive fields
  description: z.string().max(5000, "Description must be 5000 characters or less").optional(),
  steps: z.array(z.string()).optional(),
  expectedBehavior: z
    .string()
    .max(1000, "Expected behavior must be 1000 characters or less")
    .optional(),
  actualBehavior: z
    .string()
    .max(1000, "Actual behavior must be 1000 characters or less")
    .optional(),

  // Classification
  severity: BugSeveritySchema.default("medium"),
  labels: z.array(z.string()).default([]),

  // Technical data
  systemInfo: SystemInfoSchema.optional(),
  contextInfo: ContextInfoSchema.optional(),
  screenshot: z.string().optional(), // Base64 data URL
  screenshotNote: z.string().optional(),

  // Metadata
  appVersion: z.string().optional(),
  timestamp: z.string().optional(),
  reportSource: z.string().optional(),
  reportVersion: z.string().optional(),

  // Custom data
  customData: z.record(z.string(), z.unknown()).default({}),
});

/**
 * Type inference from schema
 * Use this type for fully validated bug report data
 */
export type BugReport = z.infer<typeof BugReportSchema>;

/**
 * Partial bug report schema for updates
 */
export const BugReportPartialSchema = BugReportSchema.partial();
export type BugReportPartial = z.infer<typeof BugReportPartialSchema>;

/**
 * Validation helper - throws on invalid data
 */
export const validateBugReport = (data: unknown): BugReport => {
  return BugReportSchema.parse(data);
};

/**
 * Safe validation helper - returns result with error details
 */
export const validateBugReportSafe = (data: unknown) => {
  return BugReportSchema.safeParse(data);
};

/**
 * Validation helper for partial updates
 */
export const validateBugReportPartial = (data: unknown): BugReportPartial => {
  return BugReportPartialSchema.parse(data);
};
