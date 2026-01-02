/**
 * Analytics API Service - v2.0 Polyglot Backend Integration
 * Interfaces with Python analytics backend for financial intelligence
 */
import logger from "@/utils/common/logger";

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

interface AnalyticsResponse {
  success: boolean;
  error?: string;
  prediction?: PaydayPrediction;
  suggestions?: MerchantSuggestion[];
}

// --- Implementation ---

export class AnalyticsApiService {
  private static readonly PREDICTION_ENDPOINT = "/api/analytics/prediction";
  private static readonly CATEGORIZATION_ENDPOINT = "/api/analytics/categorization";
  private static readonly TIMEOUT_MS = 30000;

  /**
   * Predict next payday based on paycheck history
   */
  static async predictNextPayday(paychecks: PaycheckEntry[]): Promise<PaydayPrediction | null> {
    try {
      logger.info("Calling Python analytics API: predictNextPayday", {
        paycheckCount: paychecks.length,
      });

      const response = await this.callApi(this.PREDICTION_ENDPOINT, {
        paychecks,
      });

      if (!response.success || !response.prediction) {
        logger.error("Payday prediction failed", { error: response.error });
        return null;
      }

      logger.info("Payday prediction successful", {
        confidence: response.prediction.confidence,
        pattern: response.prediction.pattern,
      });

      return response.prediction;
    } catch (error) {
      logger.error("Failed to predict payday", error);
      return null;
    }
  }

  /**
   * Analyze merchant patterns and get envelope suggestions
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

      const response = await this.callApi(this.CATEGORIZATION_ENDPOINT, {
        transactions,
        monthsOfData,
      });

      if (!response.success || !response.suggestions) {
        logger.error("Merchant analysis failed", { error: response.error });
        return [];
      }

      logger.info("Merchant analysis successful", {
        suggestionCount: response.suggestions.length,
      });

      return response.suggestions;
    } catch (error) {
      logger.error("Failed to analyze merchants", error);
      return [];
    }
  }

  /**
   * Call the Python analytics API
   */
  private static async callApi(
    endpoint: string,
    body: Record<string, unknown>
  ): Promise<AnalyticsResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT_MS);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result: AnalyticsResponse = await response.json();
      return result;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("Analytics API request timeout");
      }

      throw error;
    }
  }

  /**
   * Health check for the analytics API
   */
  static async healthCheck(): Promise<boolean> {
    try {
      // Check both endpoints
      const [predictionHealth, categorizationHealth] = await Promise.all([
        fetch(this.PREDICTION_ENDPOINT, { method: "GET" }).then((r) => r.json()),
        fetch(this.CATEGORIZATION_ENDPOINT, { method: "GET" }).then((r) => r.json()),
      ]);

      return predictionHealth.success === true && categorizationHealth.success === true;
    } catch (error) {
      logger.error("Analytics API health check failed", error);
      return false;
    }
  }
}

export default AnalyticsApiService;
