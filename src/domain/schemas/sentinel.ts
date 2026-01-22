/**
 * Zod validation schemas for SentinelShare data
 */
import { z } from "zod";

/**
 * Schema for SentinelShare receipt status
 */
export const SentinelReceiptStatusSchema = z.enum(["pending", "matched", "ignored"]);

/**
 * Schema for a SentinelShare receipt
 */
export const SentinelReceiptSchema = z.object({
  id: z.string().min(1),
  amount: z.number(),
  merchant: z.string().min(1),
  date: z.string().datetime(),
  category: z.string().optional(),
  description: z.string().optional(),
  status: SentinelReceiptStatusSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  matchedTransactionId: z.string().optional(),
  sourceApp: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

/**
 * Schema for SentinelShare API response
 */
export const SentinelReceiptsResponseSchema = z.object({
  receipts: z.array(SentinelReceiptSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive().optional(),
  pageSize: z.number().int().positive().optional(),
});

/**
 * Schema for updating receipt status
 */
export const UpdateReceiptStatusSchema = z.object({
  receiptId: z.string().min(1),
  status: z.enum(["matched", "ignored"]),
  matchedTransactionId: z.string().optional(),
});

/**
 * Schema for API error response
 */
export const SentinelApiErrorSchema = z.object({
  message: z.string(),
  code: z.string().optional(),
  details: z.unknown().optional(),
});

// Infer types from schemas for convenience
export type SentinelReceiptStatusType = z.infer<typeof SentinelReceiptStatusSchema>;
export type SentinelReceiptType = z.infer<typeof SentinelReceiptSchema>;
export type SentinelReceiptsResponseType = z.infer<typeof SentinelReceiptsResponseSchema>;
export type UpdateReceiptStatusType = z.infer<typeof UpdateReceiptStatusSchema>;
export type SentinelApiErrorType = z.infer<typeof SentinelApiErrorSchema>;
