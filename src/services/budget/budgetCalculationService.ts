/**
 * Budget Calculation Service - Hybrid Client/Backend
 * Provides budget calculations with automatic fallback
 * Prefers Go backend for performance, falls back to client-side calculations
 *
 * @module services/budget/budgetCalculationService
 */

import logger from "@/utils/common/logger";
import { BudgetEngineService } from "@/services/api/budgetEngineService";
import type { Envelope } from "@/domain/schemas/envelope";
import type { Transaction } from "@/domain/schemas/transaction";
import type { Bill } from "@/domain/schemas/bill";
import {
  calculateEnvelopeData as calculateClientSide,
  calculateEnvelopeTotals as calculateTotalsClientSide,
  type Transaction as ClientTransaction,
  type Bill as ClientBill,
  type Envelope as ClientEnvelope,
} from "@/utils/budgeting/envelopeCalculations";
import type { EnvelopeData as ClientEnvelopeData } from "@/utils/budgeting/envelopeCalculations";

// --- Types ---

export interface BudgetCalculationOptions {
  preferBackend?: boolean; // Default: true
  forceClientSide?: boolean; // Default: false
  timeout?: number; // Default: 60000ms
}

export interface BudgetCalculationResult {
  envelopeData: ClientEnvelopeData[];
  totals: {
    totalBiweeklyNeed: number;
    totalAllocated: number;
    totalBalance: number;
    totalSpent: number;
    totalUpcoming: number;
    billsDueCount: number;
    envelopeCount: number;
  };
  source: "backend" | "client"; // Indicates which calculation method was used
}

// --- Service Implementation ---

export class BudgetCalculationService {
  private static backendAvailable: boolean | null = null;
  private static lastHealthCheck = 0;
  private static readonly HEALTH_CHECK_INTERVAL = 60000; // 1 minute

  /**
   * Calculate budget data with automatic backend/client fallback
   *
   * @param envelopes - Array of envelopes
   * @param transactions - Array of transactions
   * @param bills - Array of bills
   * @param options - Calculation options
   * @returns Calculated budget data and totals
   */
  static async calculate(
    envelopes: Envelope[],
    transactions: Transaction[],
    bills: Bill[],
    options: BudgetCalculationOptions = {}
  ): Promise<BudgetCalculationResult> {
    const { preferBackend = true, forceClientSide = false } = options;

    // Force client-side calculation if requested
    if (forceClientSide) {
      logger.info("Using client-side budget calculation (forced)");
      return this.calculateClientSide(envelopes, transactions, bills);
    }

    // Try backend calculation if preferred and available
    if (preferBackend) {
      const backendAvailable = await this.checkBackendAvailability();

      if (backendAvailable) {
        try {
          const result = await this.calculateBackend(envelopes, transactions, bills);

          if (result) {
            return result;
          }
        } catch (error) {
          logger.warn("Backend calculation failed, falling back to client-side", {
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }
    }

    // Fallback to client-side calculation
    logger.info("Using client-side budget calculation (fallback)");
    return this.calculateClientSide(envelopes, transactions, bills);
  }

  /**
   * Calculate budget using Go backend
   */
  private static async calculateBackend(
    envelopes: Envelope[],
    transactions: Transaction[],
    bills: Bill[]
  ): Promise<BudgetCalculationResult | null> {
    try {
      logger.info("Attempting backend budget calculation");

      const response = await BudgetEngineService.calculateBudget(envelopes, transactions, bills);

      if (!response.success || !response.data) {
        const errorMessage = response.error || "Unknown backend error";
        logger.error("Backend calculation failed", { error: errorMessage });
        // Return null to trigger fallback, but preserve error context in logs
        return null;
      }

      // Map backend response to our format with explicit field validation
      const envelopeData: ClientEnvelopeData[] = response.data.data.map((envData) => {
        // Validate required fields exist
        if (!envData.id) {
          throw new Error("Backend returned envelope without ID");
        }

        return {
          ...envData,
          // Ensure all fields match client-side format with proper defaults
          id: envData.id,
          totalSpent: envData.totalSpent || 0,
          totalUpcoming: envData.totalUpcoming || 0,
          totalOverdue: envData.totalOverdue || 0,
          allocated: envData.allocated || 0,
          available: envData.available || 0,
          committed: envData.committed || 0,
          utilizationRate: envData.utilizationRate || 0,
          status: envData.status || "healthy",
          upcomingBills: envData.upcomingBills || [],
          overdueBills: envData.overdueBills || [],
          transactions: Array.isArray(envData.transactions)
            ? envData.transactions.filter(
                (txn: any): txn is Transaction =>
                  txn && typeof txn === "object" && "createdAt" in txn && "lastModified" in txn
              )
            : [],
          bills: envData.bills || [],
          biweeklyNeed: envData.biweeklyNeed || 0,
        } as ClientEnvelopeData;
      });

      const totals = {
        totalBiweeklyNeed: response.data.totals.totalBiweeklyNeed || 0,
        totalAllocated: response.data.totals.totalAllocated || 0,
        totalBalance: response.data.totals.totalBalance || 0,
        totalSpent: response.data.totals.totalSpent || 0,
        totalUpcoming: response.data.totals.totalUpcoming || 0,
        billsDueCount: response.data.totals.billsDueCount || 0,
        envelopeCount: response.data.totals.envelopeCount || 0,
      };

      logger.info("Backend calculation successful", {
        envelopeCount: envelopeData.length,
        totalAllocated: totals.totalAllocated,
      });

      return {
        envelopeData,
        totals,
        source: "backend",
      };
    } catch (error) {
      logger.error("Backend calculation error", error);
      return null;
    }
  }

  /**
   * Calculate budget using client-side logic
   */
  private static calculateClientSide(
    envelopes: Envelope[],
    transactions: Transaction[],
    bills: Bill[]
  ): BudgetCalculationResult {
    logger.info("Performing client-side budget calculation");

    // Convert domain schema types to calculation types
    const clientTransactions: ClientTransaction[] = transactions.map((tx) => ({
      id: tx.id,
      envelopeId: tx.envelopeId,
      type: tx.type,
      amount: tx.amount,
      date:
        tx.date instanceof Date
          ? new Date(Date.UTC(tx.date.getFullYear(), tx.date.getMonth(), tx.date.getDate()))
              .toISOString()
              .split("T")[0]
          : tx.date,
      description: tx.description,
    }));

    const clientBills: ClientBill[] = bills.map((bill) => ({
      id: bill.id,
      envelopeId: bill.envelopeId,
      isPaid: bill.isPaid,
      amount: bill.amount,
      dueDate:
        bill.dueDate instanceof Date ? bill.dueDate.toISOString().split("T")[0] : bill.dueDate,
      name: bill.name,
    }));

    const clientEnvelopes: ClientEnvelope[] = envelopes.map((envelope) => ({
      ...envelope,
    }));

    const envelopeData = calculateClientSide(clientEnvelopes, clientTransactions, clientBills);
    const totals = calculateTotalsClientSide(envelopeData);

    return {
      envelopeData,
      totals,
      source: "client",
    };
  }

  /**
   * Check if backend is available (with caching)
   */
  private static async checkBackendAvailability(): Promise<boolean> {
    const now = Date.now();

    // Narrow `this` to allow an internal in-flight promise without changing class fields
    const self = this as typeof BudgetCalculationService & {
      healthCheckPromise?: Promise<boolean> | null;
    };

    // Return cached result if recent
    if (this.backendAvailable !== null && now - this.lastHealthCheck < this.HEALTH_CHECK_INTERVAL) {
      return this.backendAvailable;
    }

    // If a health check is already in progress, await the same promise
    if (self.healthCheckPromise) {
      return self.healthCheckPromise;
    }

    // Perform health check and share the in-flight promise across callers
    self.healthCheckPromise = (async () => {
      try {
        const available = await BudgetEngineService.isAvailable();
        this.backendAvailable = available;
        this.lastHealthCheck = Date.now();
        logger.info("Backend availability check", { available: this.backendAvailable });
        return available;
      } catch (error) {
        logger.warn("Backend availability check failed", {
          error: error instanceof Error ? error.message : String(error),
        });
        this.backendAvailable = false;
        this.lastHealthCheck = Date.now();
        return false;
      } finally {
        self.healthCheckPromise = null;
      }
    })();

    return self.healthCheckPromise;
  }

  /**
   * Force refresh backend availability status
   */
  static async refreshBackendStatus(): Promise<boolean> {
    // Clear cached status
    this.backendAvailable = null;
    this.lastHealthCheck = 0;

    // Also clear any in-flight health check promise so the next call starts fresh
    const self = this as typeof BudgetCalculationService & {
      healthCheckPromise?: Promise<boolean> | null;
    };
    self.healthCheckPromise = null;
    return this.checkBackendAvailability();
  }

  /**
   * Get current backend availability status (cached)
   */
  static getBackendStatus(): boolean | null {
    return this.backendAvailable;
  }
}

export default BudgetCalculationService;
