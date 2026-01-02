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

interface AnalyticsRequest {
  operation: "predictPayday" | "analyzeMerchants";
  transactions?: Array<Record<string, unknown>>;
  paychecks?: PaycheckEntry[];
  monthsOfData?: number;
}

interface AnalyticsResponse {
  success: boolean;
  error?: string;
  prediction?: PaydayPrediction;
  suggestions?: MerchantSuggestion[];
}

// --- Implementation ---

export class AnalyticsApiService {
  private static readonly API_ENDPOINT = "/api/analytics";
  private static readonly TIMEOUT_MS = 30000;

  /**
   * Predict next payday based on paycheck history
   */
  static async predictNextPayday(paychecks: PaycheckEntry[]): Promise<PaydayPrediction | null> {
    try {
      logger.info("Calling Python analytics API: predictNextPayday", {
        paycheckCount: paychecks.length,
      });

      const request: AnalyticsRequest = {
        operation: "predictPayday",
        paychecks,
      };

      const response = await this.callApi(request);

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

      const request: AnalyticsRequest = {
        operation: "analyzeMerchants",
        transactions,
        monthsOfData,
      };

      const response = await this.callApi(request);

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
  private static async callApi(request: AnalyticsRequest): Promise<AnalyticsResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT_MS);

    try {
      const response = await fetch(this.API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
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
      const response = await fetch(this.API_ENDPOINT, {
        method: "GET",
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      return data.success === true;
    } catch (error) {
      logger.error("Analytics API health check failed", error);
      return false;
    }
  }
}

export default AnalyticsApiService;
