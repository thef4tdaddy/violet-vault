/**
 * Budget Engine Service - Go Backend Integration
 * High-performance envelope budget calculations via Go serverless functions
 *
 * @module services/api/budgetEngineService
 */

import { ApiClient, type ApiResponse } from "@/services/api/client";
import logger from "@/utils/common/logger";
import type { Envelope } from "@/domain/schemas/envelope";
import type { Transaction } from "@/domain/schemas/transaction";
import type { Bill } from "@/domain/schemas/bill";

// --- Request/Response Types ---
// These match the Go backend structs in /api/budget/index.go

export interface BudgetCalculationRequest {
  envelopes: Envelope[];
  transactions: Transaction[];
  bills: Bill[];
}

export interface EnvelopeData extends Envelope {
  totalSpent: number;
  totalUpcoming: number;
  totalOverdue: number;
  allocated: number;
  available: number;
  committed: number;
  utilizationRate: number;
  status: string;
  upcomingBills: Bill[];
  overdueBills: Bill[];
  transactions: Transaction[];
  bills: Bill[];
  biweeklyNeed: number;
}

export interface GlobalTotals {
  totalAllocated: number;
  totalSpent: number;
  totalBalance: number;
  totalUpcoming: number;
  totalBiweeklyNeed: number;
  billsDueCount: number;
  envelopeCount: number;
}

export interface BudgetCalculationResponse {
  success: boolean;
  data: EnvelopeData[];
  totals: GlobalTotals;
  error?: string;
}

// --- Service Implementation ---

export class BudgetEngineService {
  private static readonly ENDPOINT = "/api/budget";

  /**
   * Calculate envelope budgets using Go backend
   *
   * @param envelopes - Array of envelopes to calculate
   * @param transactions - Array of transactions for calculations
   * @param bills - Array of bills for calculations
   * @returns Calculated envelope data and totals
   */
  static async calculateBudget(
    envelopes: Envelope[],
    transactions: Transaction[],
    bills: Bill[]
  ): Promise<ApiResponse<BudgetCalculationResponse>> {
    try {
      logger.info("Calculating budget via Go backend", {
        envelopeCount: envelopes.length,
        transactionCount: transactions.length,
        billCount: bills.length,
      });

      const requestBody: BudgetCalculationRequest = {
        envelopes,
        transactions,
        bills,
      };

      const response = await ApiClient.post<BudgetCalculationResponse>(
        this.ENDPOINT,
        requestBody,
        {
          timeout: 60000, // 60 seconds for large datasets
        }
      );

      if (!response.success) {
        logger.error("Budget calculation failed", {
          error: response.error,
        });
        return response;
      }

      logger.info("Budget calculation successful", {
        envelopeCount: response.data?.data?.length || 0,
        totalAllocated: response.data?.totals?.totalAllocated || 0,
      });

      return response;
    } catch (error) {
      logger.error("Budget calculation error", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Budget calculation failed",
      };
    }
  }

  /**
   * Check if budget engine service is available
   * Used for feature detection and fallback logic
   */
  static async isAvailable(): Promise<boolean> {
    try {
      // Check if API client is online
      if (!ApiClient.isOnline()) {
        return false;
      }

      // Perform a lightweight health check
      const health = await ApiClient.healthCheck();
      return health;
    } catch (error) {
      logger.warn("Budget engine service not available", {
        error: error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  }
}

export default BudgetEngineService;
