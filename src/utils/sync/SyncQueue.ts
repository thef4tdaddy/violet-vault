import logger from "../common/logger";

/**
 * SyncQueue - Debounce and batch sync operations to prevent rapid-fire saves
 * Reduces Firebase quota usage and prevents overwhelming the sync system
 *
 * Addresses GitHub Issue #576 - Cloud Sync Reliability Improvements (Phase 2)
 */
export class SyncQueue {
  constructor(options = {}) {
    this.name = options.name || "SyncQueue";
    this.debounceMs = options.debounceMs || 2000; // 2 seconds
    this.maxBatchSize = options.maxBatchSize || 10;
    this.maxQueueAge = options.maxQueueAge || 30000; // 30 seconds

    this.queue = new Map(); // operationType -> { operation, timestamp, resolve, reject }
    this.timers = new Map(); // operationType -> timeoutId
    this.processing = new Set(); // Currently processing operations
    this.stats = this._createStats();
  }

  /**
   * Enqueue operation with debouncing
   */
  async enqueue(operationType, operation, data = {}) {
    return new Promise((resolve, reject) => {
      const queueItem = {
        operation,
        data,
        timestamp: Date.now(),
        resolve,
        reject,
      };

      this._addToQueue(operationType, queueItem);
      this._scheduleProcessing(operationType);

      logger.debug(`📥 ${this.name}: Enqueued ${operationType}`, {
        queueSize: this.queue.size,
        debounceMs: this.debounceMs,
      });
    });
  }

  /**
   * Process all queued operations immediately
   */
  async flush() {
    const operations = Array.from(this.queue.keys());
    const results = [];

    for (const operationType of operations) {
      try {
        const result = await this._processOperation(operationType);
        results.push({ operationType, success: true, result });
      } catch (error) {
        results.push({ operationType, success: false, error });
      }
    }

    logger.info(`🚀 ${this.name}: Flushed ${operations.length} operations`);
    return results;
  }

  /**
   * Get queue statistics
   */
  getStats() {
    return {
      ...this.stats,
      currentQueueSize: this.queue.size,
      processingCount: this.processing.size,
      oldestItem: this._getOldestItemAge(),
    };
  }

  /**
   * Clear all pending operations
   */
  clear() {
    // Clear all timers
    for (const timerId of this.timers.values()) {
      clearTimeout(timerId);
    }

    // Reject all pending operations
    for (const [operationType, item] of this.queue) {
      item.reject(new Error(`Queue cleared: ${operationType} cancelled`));
    }

    this.queue.clear();
    this.timers.clear();
    logger.info(`🧹 ${this.name}: Queue cleared`);
  }

  /**
   * Add item to queue with deduplication
   * @private
   */
  _addToQueue(operationType, queueItem) {
    // Cancel previous operation of same type
    if (this.queue.has(operationType)) {
      const existing = this.queue.get(operationType);
      existing.reject(new Error(`Superseded by newer ${operationType}`));
      this.stats.superseded++;
    }

    this.queue.set(operationType, queueItem);
    this.stats.enqueued++;
  }

  /**
   * Schedule debounced processing
   * @private
   */
  _scheduleProcessing(operationType) {
    // Clear existing timer
    if (this.timers.has(operationType)) {
      clearTimeout(this.timers.get(operationType));
    }

    // Schedule new timer
    const timerId = setTimeout(() => {
      this._processOperation(operationType);
    }, this.debounceMs);

    this.timers.set(operationType, timerId);
  }

  /**
   * Process single operation from queue
   * @private
   */
  async _processOperation(operationType) {
    if (!this.queue.has(operationType) || this.processing.has(operationType)) {
      return;
    }

    const item = this.queue.get(operationType);
    this.queue.delete(operationType);
    this.timers.delete(operationType);
    this.processing.add(operationType);

    try {
      logger.debug(`⚡ ${this.name}: Processing ${operationType}`);
      const result = await item.operation(item.data);

      item.resolve(result);
      this.stats.processed++;

      logger.debug(`✅ ${this.name}: Completed ${operationType}`);
      return result;
    } catch (error) {
      logger.error(`❌ ${this.name}: Failed ${operationType}`, {
        error: error.message,
      });
      item.reject(error);
      this.stats.failed++;
      throw error;
    } finally {
      this.processing.delete(operationType);
    }
  }

  /**
   * Get age of oldest queued item
   * @private
   */
  _getOldestItemAge() {
    if (this.queue.size === 0) return 0;

    let oldest = Date.now();
    for (const item of this.queue.values()) {
      oldest = Math.min(oldest, item.timestamp);
    }

    return Date.now() - oldest;
  }

  /**
   * Create initial statistics
   * @private
   */
  _createStats() {
    return {
      enqueued: 0,
      processed: 0,
      failed: 0,
      superseded: 0,
      created: Date.now(),
    };
  }
}

export default SyncQueue;
