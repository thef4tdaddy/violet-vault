import { budgetDb } from "@/db/budgetDb";
import type { OfflineRequestQueueEntry } from "@/db/types";
import logger from "@/utils/core/common/logger";

/**
 * Offline Request Queue Service
 *
 * Manages offline request queuing with:
 * - Automatic request capture when offline
 * - Priority-based queue management
 * - Exponential backoff retry logic
 * - Conflict resolution strategies
 * - Automatic replay on reconnection
 *
 * Issue: Feature: Offline Request Queuing
 */

export class OfflineRequestQueueService {
  private static instance: OfflineRequestQueueService;
  private isOnline: boolean = navigator.onLine;
  private processingQueue: boolean = false;
  private processingInterval: ReturnType<typeof setInterval> | null = null;

  private constructor() {
    // Listen for online/offline events
    if (typeof window !== "undefined") {
      window.addEventListener("online", this.handleOnline.bind(this));
      window.addEventListener("offline", this.handleOffline.bind(this));
    }
  }

  public static getInstance(): OfflineRequestQueueService {
    if (!OfflineRequestQueueService.instance) {
      OfflineRequestQueueService.instance = new OfflineRequestQueueService();
    }
    return OfflineRequestQueueService.instance;
  }

  /**
   * Initialize the queue service and start processing
   */
  public async initialize(): Promise<void> {
    logger.info("OfflineRequestQueue: Initializing");

    // Clean up any stale "processing" status requests on startup
    await this.resetProcessingRequests();

    // Start periodic queue processing
    this.startProcessingInterval();

    // Process queue immediately if online
    if (this.isOnline) {
      await this.processQueue();
    }

    logger.info("OfflineRequestQueue: Initialized", {
      isOnline: this.isOnline,
      queueSize: await this.getQueueSize(),
    });
  }

  /**
   * Queue a request for later execution
   */
  public async enqueue(
    request: Omit<OfflineRequestQueueEntry, "id" | "timestamp" | "retryCount" | "status">
  ): Promise<number> {
    const queueEntry: Omit<OfflineRequestQueueEntry, "id"> = {
      requestId: request.requestId || crypto.randomUUID(),
      url: request.url,
      method: request.method,
      headers: request.headers,
      body: request.body,
      timestamp: Date.now(),
      priority: request.priority || "normal",
      retryCount: 0,
      maxRetries: request.maxRetries || 3,
      status: "pending",
      entityType: request.entityType,
      entityId: request.entityId,
      conflictResolution: request.conflictResolution,
      metadata: request.metadata,
    };

    const id = await budgetDb.offlineRequestQueue.add(queueEntry as OfflineRequestQueueEntry);

    logger.info("OfflineRequestQueue: Request enqueued", {
      id,
      requestId: queueEntry.requestId,
      method: queueEntry.method,
      url: queueEntry.url,
      priority: queueEntry.priority,
      isOnline: this.isOnline,
    });

    // Try to process immediately if online
    if (this.isOnline && !this.processingQueue) {
      setTimeout(() => this.processQueue(), 100);
    }

    return id;
  }

  /**
   * Get the current queue size
   */
  public async getQueueSize(): Promise<number> {
    return budgetDb.offlineRequestQueue.where("status").equals("pending").count();
  }

  /**
   * Get all pending requests
   */
  public async getPendingRequests(): Promise<OfflineRequestQueueEntry[]> {
    return budgetDb.offlineRequestQueue
      .where("status")
      .equals("pending")
      .sortBy("priority")
      .then((requests) => {
        // Sort by priority (high > normal > low) then by timestamp
        return requests.sort((a, b) => {
          const priorityOrder = { high: 0, normal: 1, low: 2 };
          const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
          if (priorityDiff !== 0) return priorityDiff;
          return a.timestamp - b.timestamp;
        });
      });
  }

  /**
   * Process the request queue
   */
  public async processQueue(): Promise<void> {
    if (!this.isOnline || this.processingQueue) {
      return;
    }

    this.processingQueue = true;

    try {
      const pendingRequests = await this.getPendingRequests();
      const now = Date.now();

      // Filter requests that are ready to be processed (considering retry delays)
      const readyRequests = pendingRequests.filter((request) => {
        if (!request.nextRetryAt) return true;
        return now >= request.nextRetryAt;
      });

      logger.info("OfflineRequestQueue: Processing queue", {
        totalPending: pendingRequests.length,
        readyToProcess: readyRequests.length,
      });

      for (const request of readyRequests) {
        try {
          await this.executeRequest(request);
        } catch (error) {
          logger.error("OfflineRequestQueue: Failed to execute request", error, {
            requestId: request.requestId,
            url: request.url,
          });
        }
      }
    } finally {
      this.processingQueue = false;
    }
  }

  /**
   * Execute a single request from the queue
   */
  private async executeRequest(request: OfflineRequestQueueEntry): Promise<void> {
    if (!request.id) {
      throw new Error("Request ID is required");
    }

    // Update status to processing
    await budgetDb.offlineRequestQueue.update(request.id, {
      status: "processing",
      lastRetryAt: Date.now(),
    });

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

      try {
        const response = await fetch(request.url, {
          method: request.method,
          headers: request.headers,
          body: request.body,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        // Success - mark as completed and remove from queue
        await budgetDb.offlineRequestQueue.update(request.id, {
          status: "completed",
        });

        // Remove completed request after short delay (for audit purposes)
        setTimeout(() => {
          if (request.id) {
            budgetDb.offlineRequestQueue.delete(request.id);
          }
        }, 5000);

        logger.info("OfflineRequestQueue: Request completed successfully", {
          requestId: request.requestId,
          method: request.method,
          url: request.url,
        });
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    } catch (error) {
      await this.handleRequestFailure(request, error);
    }
  }

  /**
   * Handle request execution failure
   */
  private async handleRequestFailure(
    request: OfflineRequestQueueEntry,
    error: unknown
  ): Promise<void> {
    if (!request.id) return;

    const errorMessage = error instanceof Error ? error.message : String(error);
    const newRetryCount = (request.retryCount || 0) + 1;
    const isRetryable = this.isRetryableError(error);

    if (newRetryCount > request.maxRetries || !isRetryable) {
      // Permanent failure
      await budgetDb.offlineRequestQueue.update(request.id, {
        status: "failed",
        retryCount: newRetryCount,
        errorMessage,
      });

      logger.error("OfflineRequestQueue: Request failed permanently", error, {
        requestId: request.requestId,
        method: request.method,
        url: request.url,
        retryCount: newRetryCount,
        maxRetries: request.maxRetries,
        isRetryable,
      });
    } else {
      // Retry with exponential backoff
      const retryDelay = this.calculateRetryDelay(newRetryCount);
      const nextRetryAt = Date.now() + retryDelay;

      await budgetDb.offlineRequestQueue.update(request.id, {
        status: "pending",
        retryCount: newRetryCount,
        nextRetryAt,
        errorMessage,
      });

      logger.warn("OfflineRequestQueue: Request failed, will retry", {
        requestId: request.requestId,
        method: request.method,
        url: request.url,
        retryCount: newRetryCount,
        maxRetries: request.maxRetries,
        nextRetryAt: new Date(nextRetryAt).toISOString(),
        retryDelayMs: retryDelay,
      });
    }
  }

  /**
   * Calculate exponential backoff delay
   */
  private calculateRetryDelay(retryCount: number): number {
    const baseDelay = 1000; // 1 second
    const delay = baseDelay * Math.pow(2, retryCount - 1);
    return Math.min(delay, 30000); // Cap at 30 seconds
  }

  /**
   * Determine if an error is retryable
   */
  private isRetryableError(error: unknown): boolean {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();

      // Network errors are retryable
      if (message.includes("network") || message.includes("fetch")) {
        return true;
      }

      // Timeout errors are retryable
      if (message.includes("timeout") || message.includes("abort")) {
        return true;
      }

      // HTTP 5xx errors are retryable
      if (message.includes("http 5")) {
        return true;
      }

      // HTTP 429 (rate limit) is retryable
      if (message.includes("http 429")) {
        return true;
      }

      // HTTP 408 (request timeout) is retryable
      if (message.includes("http 408")) {
        return true;
      }
    }

    return false;
  }

  /**
   * Reset any requests stuck in "processing" status on startup
   */
  private async resetProcessingRequests(): Promise<void> {
    const processingRequests = await budgetDb.offlineRequestQueue
      .where("status")
      .equals("processing")
      .toArray();

    for (const request of processingRequests) {
      if (request.id) {
        await budgetDb.offlineRequestQueue.update(request.id, {
          status: "pending",
        });
      }
    }

    if (processingRequests.length > 0) {
      logger.info("OfflineRequestQueue: Reset processing requests", {
        count: processingRequests.length,
      });
    }
  }

  /**
   * Start periodic queue processing
   */
  private startProcessingInterval(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
    }

    // Process queue every 30 seconds if online
    this.processingInterval = setInterval(() => {
      if (this.isOnline && !this.processingQueue) {
        this.processQueue();
      }
    }, 30000);
  }

  /**
   * Stop periodic queue processing
   */
  public stopProcessingInterval(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
  }

  /**
   * Handle online event
   */
  private async handleOnline(): Promise<void> {
    this.isOnline = true;
    logger.info("OfflineRequestQueue: Device came online", {
      queueSize: await this.getQueueSize(),
    });

    // Wait a moment for connections to stabilize, then process queue
    setTimeout(() => {
      this.processQueue();
    }, 1000);
  }

  /**
   * Handle offline event
   */
  private handleOffline(): void {
    this.isOnline = false;
    logger.info("OfflineRequestQueue: Device went offline");
  }

  /**
   * Get queue status for debugging/monitoring
   */
  public async getStatus(): Promise<{
    isOnline: boolean;
    processingQueue: boolean;
    pendingCount: number;
    failedCount: number;
    processingCount: number;
    requests: Array<{
      id?: number;
      requestId: string;
      method: string;
      url: string;
      status: string;
      priority: string;
      retryCount: number;
      maxRetries: number;
      timestamp: number;
      nextRetryAt?: number;
      errorMessage?: string;
    }>;
  }> {
    const [pendingRequests, failedRequests, processingRequests] = await Promise.all([
      budgetDb.offlineRequestQueue.where("status").equals("pending").toArray(),
      budgetDb.offlineRequestQueue.where("status").equals("failed").toArray(),
      budgetDb.offlineRequestQueue.where("status").equals("processing").toArray(),
    ]);

    const allRequests = [...pendingRequests, ...failedRequests, ...processingRequests];

    return {
      isOnline: this.isOnline,
      processingQueue: this.processingQueue,
      pendingCount: pendingRequests.length,
      failedCount: failedRequests.length,
      processingCount: processingRequests.length,
      requests: allRequests.map((req) => ({
        id: req.id,
        requestId: req.requestId,
        method: req.method,
        url: req.url,
        status: req.status,
        priority: req.priority,
        retryCount: req.retryCount,
        maxRetries: req.maxRetries,
        timestamp: req.timestamp,
        nextRetryAt: req.nextRetryAt,
        errorMessage: req.errorMessage,
      })),
    };
  }

  /**
   * Clear failed requests from the queue
   */
  public async clearFailedRequests(): Promise<number> {
    const failedRequests = await budgetDb.offlineRequestQueue
      .where("status")
      .equals("failed")
      .toArray();

    const ids = failedRequests.map((req) => req.id).filter((id): id is number => id !== undefined);

    if (ids.length > 0) {
      await budgetDb.offlineRequestQueue.bulkDelete(ids);
      logger.info("OfflineRequestQueue: Cleared failed requests", {
        count: ids.length,
      });
    }

    return ids.length;
  }

  /**
   * Retry a specific failed request
   */
  public async retryRequest(requestId: string): Promise<void> {
    const request = await budgetDb.offlineRequestQueue.where("requestId").equals(requestId).first();

    if (!request) {
      throw new Error(`Request not found: ${requestId}`);
    }

    if (request.id) {
      await budgetDb.offlineRequestQueue.update(request.id, {
        status: "pending",
        retryCount: 0,
        nextRetryAt: undefined,
        errorMessage: undefined,
      });

      logger.info("OfflineRequestQueue: Request marked for retry", {
        requestId,
      });

      // Trigger processing if online
      if (this.isOnline && !this.processingQueue) {
        setTimeout(() => this.processQueue(), 100);
      }
    }
  }

  /**
   * Clear all requests from the queue (use with caution)
   */
  public async clearAllRequests(): Promise<void> {
    await budgetDb.offlineRequestQueue.clear();
    logger.warn("OfflineRequestQueue: Cleared all requests");
  }
}

// Export singleton instance
export const offlineRequestQueueService = OfflineRequestQueueService.getInstance();

// Expose to window for debugging
if (typeof window !== "undefined") {
  (
    window as unknown as { offlineRequestQueueService?: OfflineRequestQueueService }
  ).offlineRequestQueueService = offlineRequestQueueService;
}
