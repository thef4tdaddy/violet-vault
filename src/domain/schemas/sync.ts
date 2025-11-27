/**
 * Sync Domain Schema
 * Runtime validation for cloud sync entities
 * Part of Issue #1341: Replace Manual Type Guards with Zod Schemas
 */

import { z } from "zod";
import logger from "@/utils/common/logger";

/**
 * Cloud Sync User Schema - validates user info for cloud sync operations
 * Replaces manual isValidUser() type guard
 */
export const CloudSyncUserSchema = z.object({
  uid: z.string().min(1, "User ID is required"),
  userName: z.string().min(1, "User name is required"),
});
export type CloudSyncUser = z.infer<typeof CloudSyncUserSchema>;

/**
 * Chunked Sync Stats Schema - validates sync statistics structure
 * Replaces manual isValidStats() type guard
 */
export const ChunkedSyncStatsSchema = z.object({
  maxChunkSize: z.number().positive("Max chunk size must be positive"),
  maxArrayChunkSize: z.number().positive("Max array chunk size must be positive"),
  isInitialized: z.boolean(),
  lastSyncTimestamp: z.number().optional(),
  totalChunks: z.number().optional(),
  failedChunks: z.number().optional(),
});
export type ChunkedSyncStatsValidated = z.infer<typeof ChunkedSyncStatsSchema>;

/**
 * Loaded Data Schema - validates the structure of loaded data from cloud
 * Replaces manual isValidLoadedData() type guard
 * Allows null, primitives, or object with optional transactions/envelopes arrays
 */
export const LoadedDataSchema = z
  .union([
    z.null(),
    z.string(),
    z.number(),
    z.boolean(),
    z
      .object({
        transactions: z.union([z.null(), z.array(z.unknown())]).optional(),
        envelopes: z.union([z.null(), z.array(z.unknown())]).optional(),
      })
      .passthrough(), // Allow additional properties
    z.array(z.unknown()),
  ])
  .describe("Loaded data from cloud sync");
export type LoadedData = z.infer<typeof LoadedDataSchema>;

// ===== Validation Helpers =====

/**
 * Validation helper - throws on invalid cloud sync user
 */
export const validateCloudSyncUser = (data: unknown): CloudSyncUser => {
  return CloudSyncUserSchema.parse(data);
};

/**
 * Safe validation helper - returns result with detailed error messages
 */
export const validateCloudSyncUserSafe = (data: unknown) => {
  return CloudSyncUserSchema.safeParse(data);
};

/**
 * Validation helper - throws on invalid chunked sync stats
 */
export const validateChunkedSyncStats = (data: unknown): ChunkedSyncStatsValidated => {
  return ChunkedSyncStatsSchema.parse(data);
};

/**
 * Safe validation helper - returns result with detailed error messages
 */
export const validateChunkedSyncStatsSafe = (data: unknown) => {
  return ChunkedSyncStatsSchema.safeParse(data);
};

/**
 * Validation helper - throws on invalid loaded data
 */
export const validateLoadedData = (data: unknown): LoadedData => {
  return LoadedDataSchema.parse(data);
};

/**
 * Safe validation helper - returns result with detailed error messages
 */
export const validateLoadedDataSafe = (data: unknown) => {
  return LoadedDataSchema.safeParse(data);
};

/**
 * Format validation errors for logging
 * Provides detailed, human-readable error messages
 */
export const formatSyncValidationErrors = (
  error: z.ZodError,
  context: string
): { message: string; details: string[] } => {
  const details = error.issues.map((issue) => {
    const path = issue.path.length > 0 ? issue.path.join(".") : "root";
    return `${path}: ${issue.message}`;
  });

  const message = `${context} validation failed with ${error.issues.length} error(s)`;

  // Log the validation error with context
  logger.warn(message, { context, details });

  return { message, details };
};
