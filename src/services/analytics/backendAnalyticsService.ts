/**
 * Backend Analytics Service
 *
 * Handles communication with Go/Python analytics endpoints for Tier 2.
 * All payloads are encrypted using AES-256-GCM before transmission.
 *
 * Endpoints:
 * - Go: /api/analytics/heatmap-generator
 * - Go: /api/analytics/trend-aggregator
 * - Go: /api/analytics/health-calculator
 * - Python: /api/ml/predict-allocations
 * - Python: /api/ml/detect-anomalies
 * - Python: /api/ml/generate-insights
 *
 * @module backendAnalyticsService
 */

import { encryptData, decryptData } from "@/utils/security/encryption";
import { keyManagement } from "@/utils/security/keyManagement";
import logger from "@/utils/core/common/logger";
import type { EncryptedPayload } from "@/utils/security/encryption";
import type { AllocationTransaction } from "@/types/allocation";

/**
 * Backend API endpoints
 */
const ENDPOINTS = {
  // Go endpoints
  HEATMAP: "/api/analytics/heatmap-generator",
  TRENDS: "/api/analytics/trend-aggregator",
  HEALTH: "/api/analytics/health-calculator",

  // Python ML endpoints
  PREDICT: "/api/ml/predict_allocations",
  ANOMALIES: "/api/ml/detect_anomalies",
  INSIGHTS: "/api/ml/generate_insights",
} as const;

/**
 * Request timeout (milliseconds)
 */
const REQUEST_TIMEOUT = 30_000; // 30 seconds

/**
 * Retry configuration
 */
const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 10_000, // 10 seconds
  backoffMultiplier: 2,
} as const;

/**
 * API error with status code
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public endpoint: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetch with timeout
 */
async function fetchWithTimeout(
  url: string,
  options: globalThis.RequestInit,
  timeout: number
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Make encrypted API call with retry logic
 */
async function performEncryptedRequest<T>(endpoint: string, payload: unknown): Promise<T> {
  // Get encryption key
  const key = keyManagement.getKey();
  if (!key) {
    throw new Error("Encryption not unlocked. Please unlock Tier 2 analytics first.");
  }

  // Encrypt payload
  const encryptedPayload = await encryptData(payload, key);
  logger.debug("Making encrypted API call", {
    endpoint,
    payloadSize: new Blob([JSON.stringify(encryptedPayload)]).size,
  });

  // Make API call
  const response = await fetchWithTimeout(
    endpoint,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ encrypted: encryptedPayload }),
    },
    REQUEST_TIMEOUT
  );

  // Handle non-OK responses
  if (!response.ok) {
    const errorText = await response.text();
    throw new ApiError(`API call failed: ${errorText}`, response.status, endpoint);
  }

  // Parse response
  const data = await response.json();

  // Decrypt response if encrypted
  if (data.encrypted) {
    const decrypted = await decryptData<T>(data.encrypted as EncryptedPayload, key);
    logger.debug("API call successful (encrypted response)", { endpoint });
    return decrypted;
  }

  // Return unencrypted response (for health checks, etc.)
  logger.debug("API call successful (plain response)", { endpoint });
  return data as T;
}

/**
 * Make encrypted API call with retry logic
 */
async function callApiWithRetry<T>(
  endpoint: string,
  payload: unknown,
  retries: number = RETRY_CONFIG.maxRetries
): Promise<T> {
  let lastError: Error | null = null;
  let delay: number = RETRY_CONFIG.initialDelay;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await performEncryptedRequest<T>(endpoint, payload);
    } catch (error) {
      lastError = error as Error;

      // Don't retry on certain errors
      if (
        (error instanceof ApiError && (error.statusCode === 401 || error.statusCode === 403)) ||
        (error instanceof Error && error.message.includes("encryption"))
      ) {
        throw error;
      }

      // Log retry
      if (attempt < retries) {
        logger.warn("API call failed, retrying...", {
          endpoint,
          attempt: attempt + 1,
          maxRetries: retries,
          delay,
          error: lastError.message,
        });

        await sleep(delay);
        delay = Math.min(delay * RETRY_CONFIG.backoffMultiplier, RETRY_CONFIG.maxDelay);
      }
    }
  }

  // All retries exhausted
  logger.error("API call failed after all retries", {
    endpoint,
    retries,
    error: lastError?.message,
  });
  throw lastError || new Error("Unknown error during API call");
}

/**
 * Heatmap data point
 */
export interface HeatmapDataPoint {
  date: string; // ISO date
  intensity: number; // 0-100
  amount: number;
  count: number;
}

/**
 * Generate allocation heatmap (Go endpoint)
 *
 * @param transactions - Allocation transactions
 * @param dateRange - Date range for heatmap
 * @returns Heatmap data points
 *
 * @example
 * ```typescript
 * const heatmap = await generateHeatmap(transactions, {
 *   start: "2026-01-01",
 *   end: "2026-02-01"
 * });
 * ```
 */
export async function generateHeatmap(
  transactions: AllocationTransaction[],
  dateRange: { start: string; end: string }
): Promise<HeatmapDataPoint[]> {
  return callApiWithRetry<HeatmapDataPoint[]>(ENDPOINTS.HEATMAP, {
    transactions,
    dateRange,
  });
}

/**
 * Trend data point
 */
export interface TrendDataPoint {
  date: string;
  [envelopeId: string]: number | string; // envelope amounts by ID
}

/**
 * Trend metadata
 */
export interface TrendMetadata {
  direction: "up" | "down" | "flat";
  slope: number; // Linear regression slope
  r2: number; // R-squared value (0-1)
}

/**
 * Generate allocation trends (Go endpoint)
 *
 * @param transactions - Allocation transactions
 * @param options - Trend options
 * @returns Trend data points and metadata
 *
 * @example
 * ```typescript
 * const trends = await generateTrends(transactions, {
 *   envelopeIds: ["env_123", "env_456"],
 *   granularity: "weekly"
 * });
 * ```
 */
export async function generateTrends(
  transactions: AllocationTransaction[],
  options: {
    envelopeIds: string[];
    granularity: "daily" | "weekly" | "monthly";
  }
): Promise<{
  data: TrendDataPoint[];
  metadata: Record<string, TrendMetadata>;
}> {
  return callApiWithRetry(ENDPOINTS.TRENDS, {
    transactions,
    envelopeIds: options.envelopeIds,
    granularity: options.granularity,
  });
}

/**
 * Health component score
 */
export interface HealthComponentScore {
  component: "consistency" | "billCoverage" | "savingsRate" | "emergencyFund" | "discretionary";
  score: number; // 0-100
  weight: number;
  description: string;
}

/**
 * Calculate allocation health score (Go endpoint)
 *
 * @param transactions - Allocation transactions
 * @returns Overall score and component breakdown
 *
 * @example
 * ```typescript
 * const health = await calculateHealth(transactions);
 * console.log(`Health score: ${health.overall}`);
 * ```
 */
export async function calculateHealth(transactions: AllocationTransaction[]): Promise<{
  overall: number;
  components: HealthComponentScore[];
}> {
  return callApiWithRetry(ENDPOINTS.HEALTH, { transactions });
}

/**
 * Allocation prediction
 */
export interface AllocationPrediction {
  envelopeId: string;
  amount: number;
  confidence: number; // 0-100
  rationale: string;
}

/**
 * Predict allocations using ML (Python endpoint)
 *
 * @param history - Historical allocation transactions
 * @param paycheckAmount - Upcoming paycheck amount
 * @returns Top 5 predicted allocations
 *
 * @example
 * ```typescript
 * const predictions = await predictAllocations(history, 2500.00);
 * console.log(`Top prediction: ${predictions[0].envelopeId}`);
 * ```
 */
export async function predictAllocations(
  history: AllocationTransaction[],
  paycheckAmount: number
): Promise<AllocationPrediction[]> {
  return callApiWithRetry(ENDPOINTS.PREDICT, {
    history,
    paycheckAmount,
  });
}

/**
 * Anomaly detection result
 */
export interface AnomalyResult {
  date: string;
  severity: "high" | "medium" | "low";
  description: string;
  affectedEnvelopes: string[];
}

/**
 * Detect anomalies in allocations (Python endpoint)
 *
 * @param transactions - Allocation transactions
 * @returns Detected anomalies
 *
 * @example
 * ```typescript
 * const anomalies = await detectAnomalies(transactions);
 * if (anomalies.length > 0) {
 *   console.log(`Found ${anomalies.length} anomalies`);
 * }
 * ```
 */
export async function detectAnomalies(
  transactions: AllocationTransaction[]
): Promise<AnomalyResult[]> {
  return callApiWithRetry(ENDPOINTS.ANOMALIES, { transactions });
}

/**
 * ML insight
 */
export interface MLInsight {
  type: "warning" | "success" | "info";
  title: string;
  description: string;
  confidence: number; // 0-100
  actionable: boolean;
  action?: string; // Suggested action
}

/**
 * Generate insights from allocations (Python endpoint)
 *
 * @param transactions - Allocation transactions
 * @returns Top 3-5 actionable insights
 *
 * @example
 * ```typescript
 * const insights = await generateInsights(transactions);
 * insights.forEach(insight => {
 *   console.log(`${insight.title}: ${insight.description}`);
 * });
 * ```
 */
export async function generateInsights(
  transactions: AllocationTransaction[]
): Promise<MLInsight[]> {
  return callApiWithRetry(ENDPOINTS.INSIGHTS, { transactions });
}

/**
 * Test backend connection
 *
 * @returns Connection test result
 *
 * @example
 * ```typescript
 * const result = await testConnection();
 * if (result.status === "ok") {
 *   console.log(`Connected to ${result.region} in ${result.latency}ms`);
 * }
 * ```
 */
export async function testConnection(): Promise<{
  status: "ok" | "error";
  latency: number;
  region: string;
  timestamp: number;
}> {
  const startTime = performance.now();

  try {
    const response = await fetchWithTimeout(
      "/api/health",
      { method: "GET" },
      5000 // 5 second timeout
    );

    const latency = Math.round(performance.now() - startTime);

    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status}`);
    }

    const data = await response.json();

    return {
      status: "ok",
      latency,
      region: data.region || "unknown",
      timestamp: data.timestamp || Date.now(),
    };
  } catch (error) {
    logger.error("Connection test failed", { error });
    return {
      status: "error",
      latency: Math.round(performance.now() - startTime),
      region: "unknown",
      timestamp: Date.now(),
    };
  }
}

/**
 * Backend Analytics Service (singleton)
 */
export const backendAnalyticsService = {
  generateHeatmap,
  generateTrends,
  calculateHealth,
  predictAllocations,
  detectAnomalies,
  generateInsights,
  testConnection,
};
