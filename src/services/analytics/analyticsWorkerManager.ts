/**
 * Analytics Worker Manager - Interface for using the analytics Web Worker
 *
 * Provides a simple API for offloading heavy analytics calculations
 * to a background thread (Phase 1.2)
 */

import logger from "@/utils/core/common/logger";
import type { WorkerRequest, WorkerResponse } from "@/workers/analyticsWorker";

type Transaction = {
  id: string;
  date: string | Date;
  amount: number;
  category?: string;
  envelopeId?: string;
};

type HeatmapData = {
  date: string;
  value: number;
  transactions: number;
};

type TrendData = {
  period: string;
  income: number;
  expenses: number;
  net: number;
  count: number;
};

type CategoryData = {
  category: string;
  amount: number;
  count: number;
  percentage: number;
};

type QuickStats = {
  totalIncome: number;
  totalExpenses: number;
  netCashFlow: number;
  transactionCount: number;
  avgTransaction: number;
};

/**
 * Analytics Worker Manager
 * Manages Web Worker lifecycle and communication
 */
class AnalyticsWorkerManager {
  private worker: Worker | null = null;
  private pendingRequests = new Map<
    string,
    {
      resolve: (data: unknown) => void;
      reject: (error: Error) => void;
    }
  >();
  private requestCounter = 0;

  /**
   * Initialize the Web Worker
   */
  private initWorker(): void {
    if (this.worker) {
      return;
    }

    try {
      // Create worker from file
      this.worker = new Worker(new URL("@/workers/analyticsWorker.ts", import.meta.url), {
        type: "module",
      });

      // Set up message handler
      this.worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
        const { id, success, data, error, duration } = event.data;

        const pending = this.pendingRequests.get(id);
        if (!pending) {
          logger.warn("Received response for unknown request", { id });
          return;
        }

        this.pendingRequests.delete(id);

        if (success) {
          logger.debug("Worker calculation completed", { id, duration });
          pending.resolve(data);
        } else {
          logger.error("Worker calculation failed", { id, error });
          pending.reject(new Error(error || "Worker calculation failed"));
        }
      };

      // Set up error handler
      this.worker.onerror = (error) => {
        logger.error("Worker error", error);
        this.cleanup();
      };

      logger.info("Analytics worker initialized");
    } catch (error) {
      logger.error("Failed to initialize worker", error);
      this.worker = null;
    }
  }

  /**
   * Send request to worker
   */
  private sendRequest<T>(
    type: WorkerRequest["type"],
    payload: WorkerRequest["payload"]
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!this.worker) {
        this.initWorker();
      }

      if (!this.worker) {
        reject(new Error("Worker initialization failed"));
        return;
      }

      const id = `req_${++this.requestCounter}`;
      this.pendingRequests.set(id, { resolve: resolve as (data: unknown) => void, reject });

      const request: WorkerRequest = {
        id,
        type,
        payload,
      };

      this.worker.postMessage(request);
    });
  }

  /**
   * Calculate heatmap in worker
   */
  async calculateHeatmap(transactions: Transaction[]): Promise<HeatmapData[]> {
    return this.sendRequest<HeatmapData[]>("heatmap", { transactions });
  }

  /**
   * Calculate trends in worker
   */
  async calculateTrends(
    transactions: Transaction[],
    periodType: "daily" | "weekly" | "monthly" = "monthly"
  ): Promise<TrendData[]> {
    return this.sendRequest<TrendData[]>("trends", {
      transactions,
      periodType,
    });
  }

  /**
   * Calculate category breakdown in worker
   */
  async calculateCategoryBreakdown(transactions: Transaction[]): Promise<CategoryData[]> {
    return this.sendRequest<CategoryData[]>("categoryBreakdown", { transactions });
  }

  /**
   * Calculate quick stats in worker
   */
  async calculateQuickStats(transactions: Transaction[]): Promise<QuickStats> {
    return this.sendRequest<QuickStats>("quickStats", { transactions });
  }

  /**
   * Check if worker is available
   */
  isAvailable(): boolean {
    return typeof Worker !== "undefined";
  }

  /**
   * Clean up worker resources
   */
  cleanup(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
      logger.info("Analytics worker terminated");
    }

    // Reject all pending requests
    for (const [_id, pending] of this.pendingRequests.entries()) {
      pending.reject(new Error("Worker terminated"));
    }
    this.pendingRequests.clear();
  }
}

// Export singleton instance
export const analyticsWorkerManager = new AnalyticsWorkerManager();

// Export types
export type { Transaction, HeatmapData, TrendData, CategoryData, QuickStats };
