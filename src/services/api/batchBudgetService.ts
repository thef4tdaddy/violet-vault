/**
 * Batch Budget Calculation Service
 * Frontend service for batch calculation API integration
 *
 * @module services/api/batchBudgetService
 */

import { ApiClient, type ApiResponse } from "@/services/api/client";
import logger from "@/utils/common/logger";
import type { Envelope } from "@/domain/schemas/envelope";
import type { Transaction } from "@/domain/schemas/transaction";
import type { Bill } from "@/domain/schemas/bill";
import type { EnvelopeData, GlobalTotals } from "@/services/api/budgetEngineService";

// --- Request/Response Types ---
// These match the Go backend structs in /api/budget/batch.go

export interface BatchItem {
  userId: string;
  envelopes: Envelope[];
  transactions: Transaction[];
  bills: Bill[];
  metadata?: Record<string, unknown>;
}

export interface BatchRequest {
  requests: BatchItem[];
}

export interface BatchResultItem {
  userId: string;
  success: boolean;
  data?: EnvelopeData[];
  totals?: GlobalTotals;
  error?: string;
  metadata?: Record<string, unknown>;
}

export interface BatchSummary {
  totalRequests: number;
  successfulCount: number;
  failedCount: number;
  totalEnvelopes: number;
  totalTransactions: number;
  totalBills: number;
}

export interface BatchResponse {
  success: boolean;
  results: BatchResultItem[];
  summary: BatchSummary;
  error?: string;
}

// --- Service Implementation ---

export class BatchBudgetService {
  private static readonly ENDPOINT = "/api/budget/batch";
  private static readonly MAX_BATCH_SIZE = 100;

  /**
   * Process batch budget calculations
   *
   * @param items - Array of batch items to calculate
   * @returns Batch calculation results
   */
  static async processBatch(items: BatchItem[]): Promise<ApiResponse<BatchResponse>> {
    try {
      // Validate batch size
      if (items.length === 0) {
        logger.warn("Empty batch request");
        return {
          success: false,
          error: "Batch must contain at least one item",
        };
      }

      if (items.length > this.MAX_BATCH_SIZE) {
        logger.warn("Batch size exceeds maximum", {
          size: items.length,
          max: this.MAX_BATCH_SIZE,
        });
        return {
          success: false,
          error: `Batch size exceeds maximum of ${this.MAX_BATCH_SIZE} items`,
        };
      }

      logger.info("Processing batch calculation", {
        batchSize: items.length,
      });

      const requestBody: BatchRequest = {
        requests: items,
      };

      const response = await ApiClient.post<BatchResponse>(
        this.ENDPOINT,
        requestBody as unknown as Record<string, unknown>,
        {
          timeout: 120000, // 2 minutes for large batches
        }
      );

      if (!response.success) {
        logger.error("Batch calculation failed", {
          error: response.error,
        });
        return response;
      }

      logger.info("Batch calculation successful", {
        totalRequests: response.data?.summary.totalRequests || 0,
        successfulCount: response.data?.summary.successfulCount || 0,
        failedCount: response.data?.summary.failedCount || 0,
      });

      return response;
    } catch (error) {
      logger.error("Batch calculation error", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Batch calculation failed",
      };
    }
  }

  /**
   * Process batch with automatic chunking for large datasets
   *
   * @param items - Array of batch items (can exceed max batch size)
   * @returns Combined batch calculation results
   */
  static async processBatchChunked(items: BatchItem[]): Promise<ApiResponse<BatchResponse>> {
    try {
      // If within limit, process normally
      if (items.length <= this.MAX_BATCH_SIZE) {
        return await this.processBatch(items);
      }

      logger.info("Processing large batch in chunks", {
        totalItems: items.length,
        chunkSize: this.MAX_BATCH_SIZE,
      });

      // Split into chunks
      const chunks: BatchItem[][] = [];
      for (let i = 0; i < items.length; i += this.MAX_BATCH_SIZE) {
        chunks.push(items.slice(i, i + this.MAX_BATCH_SIZE));
      }

      // Process chunks sequentially (to avoid rate limiting)
      const allResults: BatchResultItem[] = [];
      let combinedSummary: BatchSummary = {
        totalRequests: 0,
        successfulCount: 0,
        failedCount: 0,
        totalEnvelopes: 0,
        totalTransactions: 0,
        totalBills: 0,
      };

      for (let i = 0; i < chunks.length; i++) {
        const chunkResponse = await this.processChunk(chunks[i], i, chunks.length);

        if (chunkResponse && chunkResponse.data) {
          allResults.push(...chunkResponse.data.results);
          this.updateCombinedSummary(combinedSummary, chunkResponse.data.summary);
        }
      }

      logger.info("Chunked batch processing complete", {
        totalChunks: chunks.length,
        totalResults: allResults.length,
        successfulCount: combinedSummary.successfulCount,
        failedCount: combinedSummary.failedCount,
      });

      // Determine overall success based on whether any results were obtained
      const hasResults = allResults.length > 0;
      const allChunksFailed = allResults.length === 0 && chunks.length > 0;

      return {
        success: hasResults,
        data: {
          success: hasResults,
          results: allResults,
          summary: combinedSummary,
        },
        error: allChunksFailed ? "All batch chunks failed to process" : undefined,
      };
    } catch (error) {
      logger.error("Chunked batch calculation error", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Chunked batch calculation failed",
      };
    }
  }

  /**
   * Helper to process a single chunk
   */
  private static async processChunk(
    chunk: BatchItem[],
    index: number,
    total: number
  ): Promise<ApiResponse<BatchResponse> | null> {
    logger.info(`Processing chunk ${index + 1}/${total}`, {
      chunkSize: chunk.length,
    });

    const response = await this.processBatch(chunk);

    if (!response.success || !response.data) {
      logger.error(`Chunk ${index + 1} failed`, {
        error: response.error,
      });
      return null;
    }

    return response;
  }

  /**
   * Helper to update combined summary
   */
  private static updateCombinedSummary(combined: BatchSummary, chunk: BatchSummary): void {
    combined.totalRequests += chunk.totalRequests;
    combined.successfulCount += chunk.successfulCount;
    combined.failedCount += chunk.failedCount;
    combined.totalEnvelopes += chunk.totalEnvelopes;
    combined.totalTransactions += chunk.totalTransactions;
    combined.totalBills += chunk.totalBills;
  }

  /**
   * Check if batch processing is available
   */
  static async isAvailable(): Promise<boolean> {
    try {
      // Check if API client is online
      if (!ApiClient.isOnline()) {
        return false;
      }

      // For now, assume available if main API is healthy
      const health = await ApiClient.healthCheck();
      return health;
    } catch (error) {
      logger.warn("Batch service availability check failed", {
        error: error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  }

  /**
   * Create a batch item from envelope data
   * Helper utility to format data for batch processing
   */
  static createBatchItem(
    userId: string,
    envelopes: Envelope[],
    transactions: Transaction[],
    bills: Bill[],
    metadata?: Record<string, unknown>
  ): BatchItem {
    return {
      userId,
      envelopes,
      transactions,
      bills,
      metadata,
    };
  }

  /**
   * Extract results for a specific user from batch response
   */
  static getResultForUser(response: BatchResponse, userId: string): BatchResultItem | undefined {
    return response.results.find((result) => result.userId === userId);
  }

  /**
   * Get all successful results from batch response
   */
  static getSuccessfulResults(response: BatchResponse): BatchResultItem[] {
    return response.results.filter((result) => result.success);
  }

  /**
   * Get all failed results from batch response
   */
  static getFailedResults(response: BatchResponse): BatchResultItem[] {
    return response.results.filter((result) => !result.success);
  }
}

export default BatchBudgetService;
