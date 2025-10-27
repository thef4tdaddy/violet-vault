import logger from "../common/logger";
import { shouldRetryError } from "./retryPolicies";
import { calculateRetryDelay } from "./retryUtils";
import { createRetryMetrics, updateRetryMetrics, formatMetrics } from "./retryMetrics";

interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  operationName: string;
  jitter: boolean;
}

/**
 * RetryManager - Smart retry logic with exponential backoff
 * Handles transient failures in cloud sync operations
 *
 * Addresses GitHub Issue #576 - Cloud Sync Reliability Improvements (Phase 2)
 */
export class RetryManager {
  name: string;
  retryMetrics: any;

  constructor(name = "RetryManager") {
    this.name = name;
    this.retryMetrics = createRetryMetrics();
  }

  /**
   * Execute operation with retry logic
   */
  async execute(operation: () => Promise<any>, options: Partial<RetryConfig> = {}) {
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
  }

  /**
   * Execute multiple operations with coordinated retry
   */
  async executeBatch(operations: Array<{ operation: () => Promise<any>; name?: string }>, options: Partial<RetryConfig> = {}) {
    const results = [];
    const errors = [];

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
  _buildRetryConfig(options: Partial<RetryConfig>): RetryConfig {
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
  async _attemptOperation(operation: () => Promise<any>, config: RetryConfig, attempt: number) {
    logger.debug(
      `🔄 ${this.name}: ${config.operationName} attempt ${attempt}/${config.maxRetries}`
    );
    return await operation();
  }

  /**
   * Track successful operation metrics
   * @private
   */
  _trackSuccess(attempt: number) {
    updateRetryMetrics(this.retryMetrics, attempt);
    logger.debug(`✅ ${this.name}: Operation succeeded on attempt ${attempt}`);
  }

  /**
   * Handle operation failure and determine retry
   * @private
   */
  async _handleFailure(error: any, config: RetryConfig, attempt: number) {
    logger.warn(`⚠️ ${this.name}: ${config.operationName} failed on attempt ${attempt}`, {
      error: error.message,
      errorType: error.constructor.name,
      attempt,
      maxRetries: config.maxRetries,
    });

    if (attempt === config.maxRetries || !shouldRetryError(error)) {
      logger.error(
        `❌ ${this.name}: ${config.operationName} failed after ${config.maxRetries} attempts`
      );
      return false;
    }

    const delayMs = calculateRetryDelay(attempt, config);
    logger.debug(`⏳ ${this.name}: Waiting ${delayMs}ms before retry ${attempt + 1}`);

    await new Promise(resolve => setTimeout(resolve, delayMs));
    return true;
  }
}

export default RetryManager;
