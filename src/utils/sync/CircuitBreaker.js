import logger from "../common/logger";

/**
 * CircuitBreaker - Prevents cascade failures in sync operations
 * Implements circuit breaker pattern to protect against repeated failures
 * 
 * Addresses GitHub Issue #576 - Cloud Sync Reliability Improvements (Phase 2)
 */
export class CircuitBreaker {
  constructor(options = {}) {
    this.name = options.name || "CircuitBreaker";
    this.failureThreshold = options.failureThreshold || 5;
    this.timeout = options.timeout || 60000; // 1 minute
    this.monitoringPeriod = options.monitoringPeriod || 60000; // 1 minute
    
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failures = 0;
    this.lastFailureTime = null;
    this.nextAttempt = null;
    this.successCount = 0;
    this.totalRequests = 0;
  }

  /**
   * Execute operation through circuit breaker
   */
  async execute(operation, operationName = "unknown") {
    this.totalRequests++;
    
    if (this.state === 'OPEN') {
      return this._handleOpenCircuit(operationName);
    }

    try {
      const result = await this._executeWithMonitoring(operation, operationName);
      this._onSuccess(operationName);
      return result;
    } catch (error) {
      this._onFailure(error, operationName);
      throw error;
    }
  }

  /**
   * Get current circuit breaker status
   */
  getStatus() {
    return {
      state: this.state,
      failures: this.failures,
      successCount: this.successCount,
      totalRequests: this.totalRequests,
      failureThreshold: this.failureThreshold,
      timeUntilRetry: this._getTimeUntilRetry(),
      isHealthy: this.state === 'CLOSED',
    };
  }

  /**
   * Force reset circuit breaker to CLOSED state
   */
  reset() {
    logger.info(`🔄 ${this.name}: Circuit breaker manually reset`);
    this._transitionToClosed();
  }

  /**
   * Handle operation execution when circuit is open
   * @private
   */
  async _handleOpenCircuit(operationName) {
    if (Date.now() >= this.nextAttempt) {
      logger.debug(`🔍 ${this.name}: Attempting to half-open circuit for ${operationName}`);
      this._transitionToHalfOpen();
      return null; // Allow caller to retry
    }
    
    const error = new Error(
      `Circuit breaker is OPEN. Next attempt in ${this._getTimeUntilRetry()}ms`
    );
    error.code = 'CIRCUIT_BREAKER_OPEN';
    throw error;
  }

  /**
   * Execute operation with monitoring
   * @private
   */
  async _executeWithMonitoring(operation, operationName) {
    const startTime = Date.now();
    
    try {
      return await operation();
    } finally {
      const duration = Date.now() - startTime;
      logger.debug(`⚡ ${this.name}: ${operationName} executed in ${duration}ms`);
    }
  }

  /**
   * Handle successful operation
   * @private
   */
  _onSuccess(operationName) {
    this.successCount++;
    
    if (this.state === 'HALF_OPEN') {
      logger.info(`✅ ${this.name}: ${operationName} succeeded, closing circuit`);
      this._transitionToClosed();
    } else if (this.failures > 0) {
      // Reset failure count on success in CLOSED state
      this.failures = 0;
    }
  }

  /**
   * Handle failed operation
   * @private
   */
  _onFailure(error, operationName) {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    logger.warn(`⚠️ ${this.name}: ${operationName} failed (${this.failures}/${this.failureThreshold})`, {
      error: error.message,
      state: this.state,
    });

    if (this.failures >= this.failureThreshold) {
      this._transitionToOpen(operationName);
    }
  }

  /**
   * Transition to CLOSED state
   * @private
   */
  _transitionToClosed() {
    this.state = 'CLOSED';
    this.failures = 0;
    this.nextAttempt = null;
    logger.debug(`🔵 ${this.name}: Circuit transitioned to CLOSED`);
  }

  /**
   * Transition to OPEN state
   * @private
   */
  _transitionToOpen(operationName) {
    this.state = 'OPEN';
    this.nextAttempt = Date.now() + this.timeout;
    
    logger.error(`🔴 ${this.name}: Circuit opened due to ${operationName} failures`, {
      failures: this.failures,
      threshold: this.failureThreshold,
      nextRetryIn: this.timeout,
    });
  }

  /**
   * Transition to HALF_OPEN state
   * @private
   */
  _transitionToHalfOpen() {
    this.state = 'HALF_OPEN';
    logger.debug(`🟡 ${this.name}: Circuit transitioned to HALF_OPEN`);
  }

  /**
   * Calculate time until next retry attempt
   * @private
   */
  _getTimeUntilRetry() {
    if (this.state !== 'OPEN' || !this.nextAttempt) {
      return 0;
    }
    return Math.max(0, this.nextAttempt - Date.now());
  }
}

export default CircuitBreaker;