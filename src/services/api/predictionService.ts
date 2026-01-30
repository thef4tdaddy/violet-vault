/**
 * Prediction API Service - Issue #1847
 * Type-safe client for Python Paycheck Prediction Service (#1787)
 * Provides validated API calls with Zod schema enforcement
 *
 * PRIVACY-FIRST: Only sends anonymized ratios, no envelope names or user IDs
 */

import {
  PredictionRequestSchema,
  PredictionResponseSchema,
  PredictionErrorSchema,
  type PredictionRequest,
  type PredictionResponse,
  type PredictionError,
  type HistoricalSession,
  convertAllocationHistoryToRatios,
  validateHistoricalSessionsConsistency,
} from "@/domain/schemas/prediction";

/**
 * Base API configuration
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
const PREDICTION_ENDPOINT = "/api/analytics/paycheck-prediction";

/**
 * API Error class for prediction service errors
 */
export class PredictionServiceError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: PredictionError
  ) {
    super(message);
    this.name = "PredictionServiceError";
  }
}

/**
 * Get AI-powered paycheck allocation suggestions
 *
 * @param request - Prediction request (will be validated)
 * @returns Prediction response with suggested allocations
 * @throws {PredictionServiceError} If validation fails or API returns error
 *
 * PRIVACY: Request contains NO envelope names, user IDs, or identifiable data
 *
 * @example
 * ```typescript
 * const prediction = await getPrediction({
 *   paycheckCents: 250000,
 *   historicalSessions: [
 *     { date: "2026-01-15", amountCents: 250000, ratios: [0.5, 0.3, 0.2] }
 *   ],
 *   currentMonth: 1,
 *   numEnvelopes: 3
 * });
 * ```
 */
export async function getPrediction(request: unknown): Promise<PredictionResponse> {
  // Validate request with Zod
  const validationResult = PredictionRequestSchema.safeParse(request);

  if (!validationResult.success) {
    const errors = validationResult.error.issues
      .map((err) => `${err.path.map(String).join(".")}: ${err.message}`)
      .join(", ");
    throw new PredictionServiceError(`Invalid prediction request: ${errors}`, 400);
  }

  const validatedRequest: PredictionRequest = validationResult.data;

  // Additional validation: check consistency of historical sessions
  const consistencyCheck = validateHistoricalSessionsConsistency(
    validatedRequest.historicalSessions
  );
  if (!consistencyCheck.valid) {
    throw new PredictionServiceError(
      consistencyCheck.error || "Historical sessions are inconsistent",
      400
    );
  }

  try {
    const response = await fetch(`${API_BASE_URL}${PREDICTION_ENDPOINT}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validatedRequest),
    });

    const data = await response.json();

    // Check if response is an error
    if (!response.ok) {
      const errorValidation = PredictionErrorSchema.safeParse(data);
      if (errorValidation.success) {
        throw new PredictionServiceError(
          errorValidation.data.error,
          response.status,
          errorValidation.data
        );
      }
      throw new PredictionServiceError(
        `API request failed with status ${response.status}`,
        response.status
      );
    }

    // Validate response with Zod
    const resultValidation = PredictionResponseSchema.safeParse(data);

    if (!resultValidation.success) {
      const errors = resultValidation.error.issues
        .map((err) => `${err.path.map(String).join(".")}: ${err.message}`)
        .join(", ");
      throw new PredictionServiceError(`Invalid API response: ${errors}`, 500);
    }

    return resultValidation.data;
  } catch (error) {
    if (error instanceof PredictionServiceError) {
      throw error;
    }

    // Network or other errors
    throw new PredictionServiceError(
      `Failed to connect to prediction service: ${error instanceof Error ? error.message : "Unknown error"}`,
      0
    );
  }
}

/**
 * Get prediction from allocation history (convenience function)
 * Automatically converts allocation history to anonymized ratios
 *
 * PRIVACY: This function strips envelope names and only sends ratios
 *
 * @param paycheckAmountCents - Current paycheck amount
 * @param allocationHistory - Historical allocations (with envelope IDs)
 * @param numEnvelopes - Number of envelopes to predict for
 * @returns Prediction response with suggested allocations
 *
 * @example
 * ```typescript
 * const prediction = await getPredictionFromHistory(
 *   250000,
 *   [
 *     {
 *       date: "2026-01-15",
 *       amountCents: 250000,
 *       envelopeAllocations: [
 *         { envelopeId: "rent", amountCents: 125000 },
 *         { envelopeId: "savings", amountCents: 75000 },
 *       ]
 *     }
 *   ],
 *   2
 * );
 * ```
 */
export async function getPredictionFromHistory(
  paycheckAmountCents: number,
  allocationHistory: Array<{
    date: string;
    amountCents: number;
    envelopeAllocations: Array<{ envelopeId: string; amountCents: number }>;
  }>,
  numEnvelopes: number
): Promise<PredictionResponse> {
  // Convert to anonymized historical sessions (privacy-first)
  const historicalSessions: HistoricalSession[] = allocationHistory.map(
    convertAllocationHistoryToRatios
  );

  // Get current month
  const currentMonth = new Date().getMonth() + 1; // 1-12

  return getPrediction({
    paycheckCents: paycheckAmountCents,
    historicalSessions,
    currentMonth,
    numEnvelopes,
  });
}

/**
 * Check if prediction service is available
 * Makes a GET request to health check endpoint
 */
export async function checkPredictionServiceHealth(): Promise<{
  available: boolean;
  version?: string;
}> {
  try {
    const response = await fetch(`${API_BASE_URL}${PREDICTION_ENDPOINT}`, {
      method: "GET",
    });

    if (response.ok) {
      const data = await response.json();
      return {
        available: true,
        version: data.version,
      };
    }

    return { available: false };
  } catch {
    return { available: false };
  }
}
