/**
 * Cache Entry Domain Schema
 * Runtime validation for cache entries
 * Part of Issue #412: Domain Types & Zod Schemas for Finance Models
 */

import { z } from "zod";

/**
 * Zod schema for CacheEntry validation
 * Represents cached data with expiration
 */
export const CacheEntrySchema = z.object({
  key: z.string().min(1, "Cache key is required").max(500),
  value: z.unknown(),
  expiresAt: z.number().int().positive("Expiration time must be a positive number"),
  category: z.string().min(1, "Category is required").max(100),
  size: z.number().int().min(0).optional(),
});

/**
 * Type inference from schema
 */
export type CacheEntry = z.infer<typeof CacheEntrySchema>;

/**
 * Partial cache entry schema for updates
 */
export const CacheEntryPartialSchema = CacheEntrySchema.partial();
export type CacheEntryPartial = z.infer<typeof CacheEntryPartialSchema>;

/**
 * Validation helper - throws on invalid data
 */
export const validateCacheEntry = (data: unknown): CacheEntry => {
  return CacheEntrySchema.parse(data);
};

/**
 * Safe validation helper - returns result with error details
 */
export const validateCacheEntrySafe = (data: unknown) => {
  return CacheEntrySchema.safeParse(data);
};

/**
 * Validation helper for partial updates
 */
export const validateCacheEntryPartial = (data: unknown): CacheEntryPartial => {
  return CacheEntryPartialSchema.parse(data);
};
