/**
 * Allocation API Schemas - Issue #1847
 * Zod schemas for Go Allocation Engine (#1786)
 * Provides runtime type safety for /api/allocate endpoint
 */

import { z } from "zod";

/**
 * Envelope schema for allocation requests
 * Maps to Go's Envelope struct in api/allocate/types.go
 */
export const EnvelopeAllocationSchema = z.object({
  id: z.string().min(1, "Envelope ID is required"),
  name: z.string().optional(),
  monthlyTargetCents: z.number().int().nonnegative("Monthly target cannot be negative"),
  currentBalanceCents: z.number().int().nonnegative("Current balance cannot be negative"),
  category: z.enum(["bills", "savings", "discretionary"]).optional(),
  priority: z.number().int().nonnegative("Priority must be non-negative").optional(),
});

export type EnvelopeAllocation = z.infer<typeof EnvelopeAllocationSchema>;

/**
 * Allocation item schema (single allocation to an envelope)
 * Maps to Go's AllocationItem struct
 */
export const AllocationItemSchema = z.object({
  envelopeId: z.string().min(1, "Envelope ID is required"),
  amountCents: z.number().int().nonnegative("Amount cannot be negative"),
  reason: z.string().optional(),
});

export type AllocationItem = z.infer<typeof AllocationItemSchema>;

/**
 * Previous allocation for "last split" strategy
 */
export const PreviousAllocationSchema = z.array(AllocationItemSchema);

export type PreviousAllocation = z.infer<typeof PreviousAllocationSchema>;

/**
 * Allocation request schema
 * Maps to Go's AllocationRequest struct
 */
export const AllocationRequestSchema = z.object({
  strategy: z.enum(["even_split", "last_split", "target_first"], {
    errorMap: () => ({ message: "Strategy must be one of: even_split, last_split, target_first" }),
  }),
  paycheckAmountCents: z
    .number()
    .int("Paycheck amount must be an integer")
    .positive("Paycheck amount must be greater than 0")
    .max(10_000_000, "Paycheck amount cannot exceed $100,000"),
  envelopes: z
    .array(EnvelopeAllocationSchema)
    .min(1, "At least one envelope is required")
    .max(200, "Maximum 200 envelopes allowed"),
  previousAllocation: PreviousAllocationSchema.optional(),
});

export type AllocationRequest = z.infer<typeof AllocationRequestSchema>;

/**
 * Allocation result schema (API response)
 * Maps to Go's AllocationResult struct
 */
export const AllocationResultSchema = z.object({
  allocations: z.array(AllocationItemSchema),
  totalAllocatedCents: z.number().int().nonnegative(),
  remainingCents: z.number().int(),
  strategy: z.string(),
  executionTimeMs: z.number().optional(),
});

export type AllocationResult = z.infer<typeof AllocationResultSchema>;

/**
 * Error response schema
 * Maps to Go's ErrorResponse struct
 */
export const AllocationErrorSchema = z.object({
  error: z.string(),
  message: z.string().optional(),
  code: z.number().int().optional(),
});

export type AllocationError = z.infer<typeof AllocationErrorSchema>;

/**
 * Validation helpers
 */

/**
 * Validate allocation request before sending to API
 */
export function validateAllocationRequest(data: unknown): AllocationRequest {
  return AllocationRequestSchema.parse(data);
}

/**
 * Validate allocation request (safe - returns result object)
 */
export function validateAllocationRequestSafe(data: unknown) {
  return AllocationRequestSchema.safeParse(data);
}

/**
 * Validate allocation result from API response
 */
export function validateAllocationResult(data: unknown): AllocationResult {
  return AllocationResultSchema.parse(data);
}

/**
 * Validate allocation result (safe - returns result object)
 */
export function validateAllocationResultSafe(data: unknown) {
  return AllocationResultSchema.safeParse(data);
}

/**
 * Type guard to check if response is an error
 */
export function isAllocationError(data: unknown): data is AllocationError {
  return AllocationErrorSchema.safeParse(data).success;
}
