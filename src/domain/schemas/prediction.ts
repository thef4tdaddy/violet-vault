/**
 * Prediction API Schemas - Issue #1847
 * Zod schemas for Python Paycheck Prediction Service (#1787)
 * Provides runtime type safety for /api/analytics/paycheck-prediction endpoint
 *
 * PRIVACY-FIRST: These schemas enforce anonymized data only (no envelope names, user IDs)
 */

import { z } from "zod";

/**
 * Historical session schema (privacy-first: no envelope names)
 * Maps to Python's HistoricalSession Pydantic model
 */
export const HistoricalSessionSchema = z.object({
  date: z.string().datetime({ message: "Date must be a valid ISO 8601 datetime string" }),
  amountCents: z.number().int().positive("Amount must be greater than 0"),
  ratios: z
    .array(z.number().min(0, "Ratios must be non-negative").max(1, "Ratios must be <= 1.0"))
    .refine(
      (ratios) => {
        const sum = ratios.reduce((acc, ratio) => acc + ratio, 0);
        return Math.abs(sum - 1.0) < 0.01;
      },
      {
        message: "Ratios must sum to approximately 1.0",
      }
    ),
});

export type HistoricalSession = z.infer<typeof HistoricalSessionSchema>;

/**
 * Prediction request schema (privacy-first: no identifiable data)
 * Maps to Python's PredictionRequest Pydantic model
 */
export const PredictionRequestSchema = z.object({
  paycheckCents: z
    .number()
    .int("Paycheck amount must be an integer")
    .positive("Paycheck amount must be greater than 0")
    .max(10_000_000, "Paycheck amount cannot exceed $100,000"),
  historicalSessions: z
    .array(HistoricalSessionSchema)
    .min(3, "Need at least 3 historical paychecks for prediction")
    .max(50, "Maximum 50 historical sessions allowed"),
  currentMonth: z
    .number()
    .int("Month must be an integer")
    .min(1, "Month must be between 1 and 12")
    .max(12, "Month must be between 1 and 12"),
  numEnvelopes: z
    .number()
    .int("Number of envelopes must be an integer")
    .positive("Must have at least 1 envelope")
    .max(200, "Maximum 200 envelopes allowed"),
  paycheckFrequency: z
    .enum(["weekly", "biweekly", "monthly"], {
      error: "Frequency must be one of: weekly, biweekly, monthly",
    })
    .optional(),
});

export type PredictionRequest = z.infer<typeof PredictionRequestSchema>;

/**
 * Reasoning info schema
 * Maps to Python's ReasoningInfo Pydantic model
 */
export const ReasoningInfoSchema = z.object({
  basedOn: z.string(),
  dataPoints: z.number().int().nonnegative(),
  patternType: z.string(),
  seasonalAdjustment: z.boolean(),
});

export type ReasoningInfo = z.infer<typeof ReasoningInfoSchema>;

/**
 * Prediction response schema
 * Maps to Python's PredictionResponse Pydantic model
 */
export const PredictionResponseSchema = z.object({
  suggestedAllocationsCents: z.array(z.number().int().nonnegative()),
  confidence: z
    .number()
    .min(0.0, "Confidence must be between 0.0 and 1.0")
    .max(1.0, "Confidence must be between 0.0 and 1.0"),
  reasoning: ReasoningInfoSchema,
  modelVersion: z.string(),
  lastTrainedDate: z.string(),
});

export type PredictionResponse = z.infer<typeof PredictionResponseSchema>;

/**
 * Error response schema
 */
export const PredictionErrorSchema = z.object({
  error: z.string(),
  detail: z.string().optional(),
});

export type PredictionError = z.infer<typeof PredictionErrorSchema>;

/**
 * Frequency detection request schema (for smart auto-detection from amount)
 * Maps to Python's FrequencyDetectionRequest Pydantic model
 */
export const FrequencyDetectionRequestSchema = z.object({
  paycheckCents: z
    .number()
    .int("Paycheck amount must be an integer")
    .positive("Paycheck amount must be greater than 0")
    .max(10_000_000, "Paycheck amount cannot exceed $100,000"),
  historicalSessions: z
    .array(HistoricalSessionSchema)
    .min(1, "Need at least 1 historical paycheck for detection")
    .max(50, "Maximum 50 historical sessions allowed"),
});

export type FrequencyDetectionRequest = z.infer<typeof FrequencyDetectionRequestSchema>;

/**
 * Frequency suggestion response schema
 * Maps to Python's FrequencySuggestion Pydantic model
 */
export const FrequencySuggestionSchema = z.object({
  suggestedFrequency: z.enum(["weekly", "biweekly", "monthly", "unknown"], {
    error: "Frequency must be one of: weekly, biweekly, monthly, unknown",
  }),
  confidence: z
    .number()
    .min(0.0, "Confidence must be between 0.0 and 1.0")
    .max(1.0, "Confidence must be between 0.0 and 1.0"),
  reasoning: z.string(),
  matchedCluster: z.number().int().positive().nullable(),
});

export type FrequencySuggestion = z.infer<typeof FrequencySuggestionSchema>;

/**
 * Validation helpers
 */

/**
 * Validate prediction request before sending to API
 */
export function validatePredictionRequest(data: unknown): PredictionRequest {
  return PredictionRequestSchema.parse(data);
}

/**
 * Validate prediction request (safe - returns result object)
 */
export function validatePredictionRequestSafe(data: unknown) {
  return PredictionRequestSchema.safeParse(data);
}

/**
 * Validate prediction response from API
 */
export function validatePredictionResponse(data: unknown): PredictionResponse {
  return PredictionResponseSchema.parse(data);
}

/**
 * Validate prediction response (safe - returns result object)
 */
export function validatePredictionResponseSafe(data: unknown) {
  return PredictionResponseSchema.safeParse(data);
}

/**
 * Type guard to check if response is an error
 */
export function isPredictionError(data: unknown): data is PredictionError {
  return PredictionErrorSchema.safeParse(data).success;
}

/**
 * Helper: Convert allocation history to anonymized ratios for privacy
 * This ensures no envelope names are sent to the prediction service
 */
export function convertAllocationHistoryToRatios(allocations: {
  date: string;
  amountCents: number;
  envelopeAllocations: Array<{ envelopeId: string; amountCents: number }>;
}): HistoricalSession {
  const totalCents = allocations.envelopeAllocations.reduce(
    (sum, alloc) => sum + alloc.amountCents,
    0
  );

  // Calculate ratios (privacy-first: no envelope IDs in ratios)
  const ratios = allocations.envelopeAllocations.map((alloc) => alloc.amountCents / totalCents);

  return {
    date: allocations.date,
    amountCents: allocations.amountCents,
    ratios,
  };
}

/**
 * Helper: Validate that historical sessions preserve envelope order
 * All sessions must have the same number of ratios (same envelope count)
 */
export function validateHistoricalSessionsConsistency(sessions: HistoricalSession[]): {
  valid: boolean;
  error?: string;
} {
  if (sessions.length === 0) {
    return { valid: false, error: "No historical sessions provided" };
  }

  const expectedLength = sessions[0].ratios.length;

  for (let i = 1; i < sessions.length; i++) {
    if (sessions[i].ratios.length !== expectedLength) {
      return {
        valid: false,
        error: `Inconsistent envelope count: session 0 has ${expectedLength} envelopes, session ${i} has ${sessions[i].ratios.length}`,
      };
    }
  }

  return { valid: true };
}
