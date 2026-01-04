/**
 * Analytics API Service - v2.0 Polyglot Backend Integration
 * Interfaces with Python analytics backend for financial intelligence
 */
import logger from "@/utils/common/logger";
import { ApiClient } from "@/services/api/client";
import { predictNextPayday as localPredict } from "@/utils/budgeting/paydayPredictor";
import type { PaycheckEntry as LocalPaycheckEntry } from "@/utils/budgeting/paydayPredictor";

// --- Types ---

export interface PaycheckEntry {
  date?: string;
  processedAt?: string;
  amount?: number;
  [key: string]: unknown;
}

export interface PaydayPrediction {
  nextPayday: string | null;
  confidence: number;
  pattern: string | null;
  intervalDays?: number;
  message: string;
}

export interface MerchantSuggestion {
  category: string;
  amount: number;
  count: number;
  suggestedBudget: number;
  monthlyAverage: number;
}

// API Response Types
interface PredictionApiResponse {
  prediction: PaydayPrediction;
}

interface CategoryApiResponse {
  suggestions: MerchantSuggestion[];
}

// --- Implementation ---

export class AnalyticsApiService {
  private static readonly PREDICTION_ENDPOINT = "/api/analytics/prediction";
  private static readonly CATEGORIZATION_ENDPOINT = "/api/analytics/categorization";
  private static readonly TIMEOUT_MS = 30000;

  /**
   * Predict next payday based on paycheck history
   * Uses V2 Polyglot Backend with fallback to local prediction when offline or API fails
   *
   * Note: navigator.onLine only checks browser connectivity, not API reachability.
   * API errors (timeout, 5xx, network issues) are caught and trigger fallback.
   */
  static async predictNextPayday(paychecks: PaycheckEntry[]): Promise<PaydayPrediction | null> {
    try {
      logger.info("Calling Python analytics API: predictNextPayday", {
        paycheckCount: paychecks.length,
      });

      // Check if online before making API call
      // Note: navigator.onLine only detects browser connectivity, not API health
      if (!ApiClient.isOnline()) {
        logger.warn("Browser offline - using local payday prediction fallback");
        return this.localPaydayPredictionFallback(paychecks);
      }

      const response = await ApiClient.post<PredictionApiResponse>(
        this.PREDICTION_ENDPOINT,
        { paychecks },
        { timeout: this.TIMEOUT_MS }
      );

      if (!response.success || !response.data?.prediction) {
        // API failed, unreachable, or returned error - fallback to local
        logger.warn("API failed or unreachable - using local payday prediction fallback", {
          error: response.error,
        });
        return this.localPaydayPredictionFallback(paychecks);
      }

      logger.info("Payday prediction successful", {
        confidence: response.data.prediction.confidence,
        pattern: response.data.prediction.pattern,
      });

      return response.data.prediction;
    } catch (error) {
      // Network error, timeout, or API down - fallback to local
      logger.warn("Network error or API down - using local payday prediction fallback", {
        error: error instanceof Error ? error.message : String(error),
      });
      return this.localPaydayPredictionFallback(paychecks);
    }
  }

  /**
   * Analyze merchant patterns and get envelope suggestions
   * Uses V2 Polyglot Backend - returns empty array when offline
   */
  static async analyzeMerchantPatterns(
    transactions: Array<Record<string, unknown>>,
    monthsOfData: number = 1
  ): Promise<MerchantSuggestion[]> {
    try {
      logger.info("Calling Python analytics API: analyzeMerchants", {
        transactionCount: transactions.length,
        monthsOfData,
      });

      // Check if online before making API call
      if (!ApiClient.isOnline()) {
        logger.warn("Offline - merchant analysis unavailable");
        return [];
      }

      const response = await ApiClient.post<CategoryApiResponse>(
        this.CATEGORIZATION_ENDPOINT,
        { transactions, monthsOfData },
        { timeout: this.TIMEOUT_MS }
      );

      if (!response.success || !response.data?.suggestions) {
        logger.error("Merchant analysis failed", { error: response.error });
        return [];
      }

      logger.info("Merchant analysis successful", {
        suggestionCount: response.data.suggestions.length,
      });

      return response.data.suggestions;
    } catch (error) {
      logger.error("Failed to analyze merchants", error);
      return [];
    }
  }

  /**
   * Local fallback for payday prediction when API is unavailable
   * Converts backend response format to match frontend format
   *
   * Type Note: This method normalizes the type difference between local and API responses:
   * - Local predictor returns: nextPayday: Date | null
   * - API response expects: nextPayday: string | null (ISO format for JSON serialization)
   * This conversion ensures consistent interface regardless of prediction source.
   */
  private static localPaydayPredictionFallback(
    paychecks: PaycheckEntry[]
  ): PaydayPrediction | null {
    try {
      // Convert PaycheckEntry to LocalPaycheckEntry format, normalizing date fields
      const localPaychecks: LocalPaycheckEntry[] = paychecks.map((paycheck) => ({
        ...paycheck,
        date: paycheck.date ? new Date(paycheck.date) : undefined,
        processedAt: paycheck.processedAt ? new Date(paycheck.processedAt) : undefined,
      }));

      const localPrediction = localPredict(localPaychecks);

      // Convert Date to ISO string for API compatibility
      // Local predictor returns Date, API expects string
      return {
        nextPayday: localPrediction.nextPayday ? localPrediction.nextPayday.toISOString() : null,
        confidence: localPrediction.confidence,
        pattern: localPrediction.pattern,
        intervalDays: localPrediction.intervalDays,
        message: localPrediction.message,
      };
    } catch (error) {
      logger.error("Local payday prediction fallback failed", error);
      return null;
    }
  }

  /**
   * Health check for the analytics API
   */
  static async healthCheck(): Promise<boolean> {
    try {
      // Check both endpoints
      const [predictionHealth, categorizationHealth] = await Promise.all([
        ApiClient.get<{ success?: boolean }>(this.PREDICTION_ENDPOINT, {
          timeout: 5000,
        }),
        ApiClient.get<{ success?: boolean }>(this.CATEGORIZATION_ENDPOINT, {
          timeout: 5000,
        }),
      ]);

      const isHealthy = (response: { success?: boolean } | null | undefined): boolean => {
        if (response == null) {
          return false;
        }
        // If the API call succeeded but the response does not contain a `success` field,
        // treat the endpoint as healthy. Only an explicit `success: false` is unhealthy.
        if (typeof response.success === "undefined") {
          return true;
        }
        return response.success === true;
      };

      return isHealthy(predictionHealth) && isHealthy(categorizationHealth);
    } catch (error) {
      logger.error("Analytics API health check failed", error);
      return false;
    }
  }
}

export default AnalyticsApiService;
