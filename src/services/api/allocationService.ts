/**
 * Allocation API Service - Issue #1847
 * Type-safe client for Go Allocation Engine (#1786)
 * Provides validated API calls with Zod schema enforcement
 */

import {
  AllocationRequestSchema,
  AllocationResultSchema,
  AllocationErrorSchema,
  type AllocationRequest,
  type AllocationResult,
  type AllocationError,
} from "@/domain/schemas/allocation";

/**
 * Base API configuration
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
const ALLOCATE_ENDPOINT = "/api/allocate";

/**
 * API Error class for allocation service errors
 */
export class AllocationServiceError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: AllocationError
  ) {
    super(message);
    this.name = "AllocationServiceError";
  }
}

/**
 * Allocate paycheck using Go allocation engine
 *
 * @param request - Allocation request (will be validated)
 * @returns Allocation result with allocations for each envelope
 * @throws {AllocationServiceError} If validation fails or API returns error
 *
 * @example
 * ```typescript
 * const result = await allocatePaycheck({
 *   strategy: "even_split",
 *   paycheckAmountCents: 250000,
 *   envelopes: [
 *     { id: "rent", monthlyTargetCents: 100000, currentBalanceCents: 0 }
 *   ]
 * });
 * ```
 */
export async function allocatePaycheck(request: unknown): Promise<AllocationResult> {
  // Validate request with Zod
  const validationResult = AllocationRequestSchema.safeParse(request);

  if (!validationResult.success) {
    const errors = validationResult.error.issues
      .map((err) => `${err.path.map(String).join(".")}: ${err.message}`)
      .join(", ");
    throw new AllocationServiceError(`Invalid allocation request: ${errors}`, 400);
  }

  const validatedRequest: AllocationRequest = validationResult.data;

  try {
    const response = await fetch(`${API_BASE_URL}${ALLOCATE_ENDPOINT}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validatedRequest),
    });

    const data = await response.json();

    // Check if response is an error
    if (!response.ok) {
      const errorValidation = AllocationErrorSchema.safeParse(data);
      if (errorValidation.success) {
        throw new AllocationServiceError(
          errorValidation.data.message || errorValidation.data.error,
          response.status,
          errorValidation.data
        );
      }
      throw new AllocationServiceError(
        `API request failed with status ${response.status}`,
        response.status
      );
    }

    // Validate response with Zod
    const resultValidation = AllocationResultSchema.safeParse(data);

    if (!resultValidation.success) {
      const errors = resultValidation.error.issues
        .map((err) => `${err.path.map(String).join(".")}: ${err.message}`)
        .join(", ");
      throw new AllocationServiceError(`Invalid API response: ${errors}`, 500);
    }

    return resultValidation.data;
  } catch (error) {
    if (error instanceof AllocationServiceError) {
      throw error;
    }

    // Network or other errors
    throw new AllocationServiceError(
      `Failed to connect to allocation service: ${error instanceof Error ? error.message : "Unknown error"}`,
      0
    );
  }
}

/**
 * Allocate using Even Split strategy
 * Distributes funds weighted by monthly targets
 *
 * @param paycheckAmountCents - Paycheck amount in cents
 * @param envelopes - Envelope data with targets and balances
 * @param paycheckFrequency - Optional frequency (weekly, biweekly, monthly) to adjust targets
 */
export async function allocateEvenSplit(
  paycheckAmountCents: number,
  envelopes: AllocationRequest["envelopes"],
  paycheckFrequency?: "weekly" | "biweekly" | "monthly"
): Promise<AllocationResult> {
  return allocatePaycheck({
    strategy: "even_split",
    paycheckAmountCents,
    envelopes,
    paycheckFrequency,
  });
}

/**
 * Allocate using Last Split strategy
 * Clones and scales previous paycheck allocation
 */
export async function allocateLastSplit(
  paycheckAmountCents: number,
  envelopes: AllocationRequest["envelopes"],
  previousAllocation: AllocationRequest["previousAllocation"]
): Promise<AllocationResult> {
  return allocatePaycheck({
    strategy: "last_split",
    paycheckAmountCents,
    envelopes,
    previousAllocation,
  });
}

/**
 * Allocate using Target First strategy
 * Prioritizes bills category envelopes before discretionary
 */
export async function allocateTargetFirst(
  paycheckAmountCents: number,
  envelopes: AllocationRequest["envelopes"]
): Promise<AllocationResult> {
  return allocatePaycheck({
    strategy: "target_first",
    paycheckAmountCents,
    envelopes,
  });
}
