import logger from "../common/logger";
import { shouldRetryError } from "./retryPolicies";
import { calculateRetryDelay } from "./retryUtils";
import { createRetryMetrics, updateRetryMetrics, formatMetrics } from "./retryMetrics";

interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  operationName?: string;
  jitter?: boolean;
}

interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  operationName: string;
  jitter: boolean;
}

interface BatchOperation {
  operation: () => Promise<unknown>;
  name: string;
}

interface BatchResult {
  success: boolean;
  result?: unknown;
  error?: unknown;
  operation: string;
}

/**
 * RetryManager - Smart retry logic with exponential backoff
 * Handles transient failures in cloud sync operations
 *
 * Addresses GitHub Issue #576 - Cloud Sync Reliability Improvements (Phase 2)
 */
export class RetryManager {
  private name: string;
  private retryMetrics: ReturnType<typeof createRetryMetrics>;

  constructor(name = "RetryManager") {
    this.name = name;
    this.retryMetrics = createRetryMetrics();
  }

  /**
   * Execute operation with retry logic
   */
  async execute<T>(operation: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
    const config = this._buildRetryConfig(options);
    this.retryMetrics.totalOperations++;

    for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
      try {
        const result = await this._attemptOperation(operation, config, attempt);
        this._trackSuccess(attempt);
        return result;
      } catch (error) {
        const shouldContinue = await this._handleFailure(error, config, attempt);
        if (!shouldContinue) {
          throw error;
        }
      }
    }

    // This should never be reached due to the throw in the loop, but TypeScript needs it
    throw new Error(`Operation failed after ${config.maxRetries} attempts`);
  }

  /**
   * Execute multiple operations with coordinated retry
   */
  async executeBatch(
    operations: BatchOperation[],
    options: RetryOptions = {}
  ): Promise<{
    results: BatchResult[];
    errors: BatchResult[];
    hasErrors: boolean;
  }> {
    const results: BatchResult[] = [];
    const errors: BatchResult[] = [];

    for (const { operation, name } of operations) {
      try {
        const result = await this.execute(operation, {
          ...options,
          operationName: name || "batch-operation",
        });
        results.push({ success: true, result, operation: name });
      } catch (error) {
        errors.push({ success: false, error, operation: name });
        results.push({ success: false, error, operation: name });
      }
    }

    return { results, errors, hasErrors: errors.length > 0 };
  }

  /**
   * Get formatted retry statistics
   */
  getMetrics() {
    return formatMetrics(this.retryMetrics);
  }

  /**
   * Reset metrics for testing
   */
  resetMetrics() {
    this.retryMetrics = createRetryMetrics();
  }

  /**
   * Build retry configuration with defaults
   * @private
   */
  _buildRetryConfig(options: RetryOptions): RetryConfig {
    return {
      maxRetries: 4,
      baseDelay: 1000,
      maxDelay: 16000,
      operationName: "unknown",
      jitter: true,
      ...options,
    };
  }

  /**
   * Attempt single operation with logging
   * @private
   */
  async _attemptOperation<T>(
    operation: () => Promise<T>,
    config: RetryConfig,
    attempt: number
  ): Promise<T> {
    logger.debug(
      `🔄 ${this.name}: ${config.operationName} attempt ${attempt}/${config.maxRetries}`
    );
    return await operation();
  }

  /**
   * Track successful operation metrics
   * @private
   */
  _trackSuccess(attempt: number): void {
    updateRetryMetrics(this.retryMetrics, attempt);
    logger.debug(`✅ ${this.name}: Operation succeeded on attempt ${attempt}`);
  }

  /**
   * Handle operation failure and determine retry
   * @private
   */
  async _handleFailure(error: unknown, config: RetryConfig, attempt: number): Promise<boolean> {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorType = error instanceof Error ? error.constructor.name : typeof error;

    logger.warn(`⚠️ ${this.name}: ${config.operationName} failed on attempt ${attempt}`, {
      error: errorMessage,
      errorType,
      attempt,
      maxRetries: config.maxRetries,
    });

    if (attempt === config.maxRetries || !shouldRetryError(error)) {
      logger.error(
        `❌ ${this.name}: ${config.operationName} failed after ${config.maxRetries} attempts`
      );
      return false;
    }

    const delay = calculateRetryDelay(attempt, config);
    logger.debug(`⏳ ${this.name}: Waiting ${delay}ms before retry ${attempt + 1}`);

    await new Promise<void>((resolve) => setTimeout(resolve, delay));
    return true;
  }
}

export default RetryManager;
