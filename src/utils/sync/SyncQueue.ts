import logger from "../common/logger";

/**
 * SyncQueue - Debounce and batch sync operations to prevent rapid-fire saves
 * Reduces Firebase quota usage and prevents overwhelming the sync system
 *
 * Addresses GitHub Issue #576 - Cloud Sync Reliability Improvements (Phase 2)
 */

interface SyncQueueOptions {
  name?: string;
  debounceMs?: number;
  maxBatchSize?: number;
  maxQueueAge?: number;
}

interface QueueItem<T = unknown> {
  operation: (data: T) => Promise<unknown>;
  data: T;
  timestamp: number;
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}

interface QueueStats {
  enqueued: number;
  processed: number;
  failed: number;
  superseded: number;
  created: number;
}

interface FlushResult {
  operationType: string;
  success: boolean;
  result?: unknown;
  error?: unknown;
}

export class SyncQueue {
  name: string;
  debounceMs: number;
  maxBatchSize: number;
  maxQueueAge: number;
  queue: Map<string, QueueItem>;
  timers: Map<string, ReturnType<typeof setTimeout>>;
  processing: Set<string>;
  stats: QueueStats;

  constructor(options: SyncQueueOptions = {}) {
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
  async enqueue<T = unknown>(
    operationType: string,
    operation: (data: T) => Promise<unknown>,
    data: T = {} as T
  ): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const queueItem: QueueItem<T> = {
        operation,
        data,
        timestamp: Date.now(),
        resolve,
        reject,
      };

      this._addToQueue(operationType, queueItem as QueueItem<unknown>);
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
  async flush(): Promise<FlushResult[]> {
    const operations = Array.from(this.queue.keys());
    const results: FlushResult[] = [];

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
  getStats(): QueueStats & {
    currentQueueSize: number;
    processingCount: number;
    oldestItem: number;
  } {
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
  clear(): void {
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
  private _addToQueue(operationType: string, queueItem: QueueItem): void {
    // Cancel previous operation of same type
    if (this.queue.has(operationType)) {
      const existing = this.queue.get(operationType);
      if (existing) {
        existing.reject(new Error(`Superseded by newer ${operationType}`));
      }
      this.stats.superseded++;
    }

    this.queue.set(operationType, queueItem);
    this.stats.enqueued++;
  }

  /**
   * Schedule debounced processing
   * @private
   */
  private _scheduleProcessing(operationType: string): void {
    // Clear existing timer
    if (this.timers.has(operationType)) {
      const existingTimer = this.timers.get(operationType);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }
    }

    // Schedule new timer
    const timerId = setTimeout(() => {
      void this._processOperation(operationType);
    }, this.debounceMs);

    this.timers.set(operationType, timerId);
  }

  /**
   * Process single operation from queue
   * @private
   */
  private async _processOperation(operationType: string): Promise<unknown> {
    if (!this.queue.has(operationType) || this.processing.has(operationType)) {
      return;
    }

    const item = this.queue.get(operationType);
    if (!item) {
      return;
    }

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
        error: error instanceof Error ? error.message : String(error),
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
  private _getOldestItemAge(): number {
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
  private _createStats(): QueueStats {
    return {
      enqueued: 0,
      processed: 0,
      failed: 0,
      superseded: 0,
      created: Date.now(),
    };
  }
}
