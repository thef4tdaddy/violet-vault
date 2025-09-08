import logger from "./logger";

/**
 * Base mutex implementation for local operation locking
 * Reusable across different locking scenarios (sync, editing, etc.)
 *
 * Part of GitHub Issue #576 - Cloud Sync Reliability Improvements
 * Potentially reusable for GitHub Issue #454 - Edit Locking System
 */
export class BaseMutex {
  constructor(name = "BaseMutex") {
    this.name = name;
    this.locked = false;
    this.queue = [];
    this.currentOperation = null;
    this.lockStartTime = null;
  }

  /**
   * Acquire the mutex lock
   */
  async acquire(operationName = "unknown") {
    return new Promise((resolve) => {
      if (this.locked) {
        logger.debug(`🔒 ${this.name}: ${operationName} queued`, {
          currentOperation: this.currentOperation,
          queueLength: this.queue.length + 1,
        });
        this.queue.push({ resolve, operationName });
        return;
      }

      this._lock(operationName);
      resolve();
    });
  }

  /**
   * Release the mutex lock
   */
  release() {
    if (!this.locked) {
      logger.warn(`🔓 ${this.name}: Attempted to release unlocked mutex`);
      return;
    }

    const duration = Date.now() - this.lockStartTime;
    logger.debug(`🔓 ${this.name}: ${this.currentOperation} released (${duration}ms)`);

    this.locked = false;
    this.currentOperation = null;
    this.lockStartTime = null;

    // Process next operation in queue
    if (this.queue.length > 0) {
      const { resolve, operationName } = this.queue.shift();
      this._lock(operationName);
      resolve();
    }
  }

  /**
   * Execute a function with mutex protection
   */
  async execute(fn, operationName = "unnamed") {
    await this.acquire(operationName);
    try {
      return await fn();
    } finally {
      this.release();
    }
  }

  /**
   * Check current lock status
   */
  getStatus() {
    return {
      locked: this.locked,
      currentOperation: this.currentOperation,
      queueLength: this.queue.length,
      lockDuration: this.locked ? Date.now() - this.lockStartTime : null,
    };
  }

  /**
   * Private method to acquire lock
   */
  _lock(operationName) {
    this.locked = true;
    this.currentOperation = operationName;
    this.lockStartTime = Date.now();

    logger.debug(`🔒 ${this.name}: ${operationName} acquired lock`);
  }
}

export default BaseMutex;
