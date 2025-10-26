import logger from "./logger";

/**
 * Base mutex implementation for local operation locking
 * Reusable across different locking scenarios (sync, editing, etc.)
 *
 * Part of GitHub Issue #576 - Cloud Sync Reliability Improvements
 * Potentially reusable for GitHub Issue #454 - Edit Locking System
 */
export class BaseMutex {
  name: string;
  locked: boolean;
  queue: Array<{ resolve: () => void; operationName: string }>;
  currentOperation: string | null;
  lockStartTime: number | null;

  constructor(name = "BaseMutex") {
    this.name = name;
    this.locked = false;
    this.queue = [];
    this.currentOperation = null;
    this.lockStartTime = null;
  }

  /**
   * Acquire the mutex lock with timeout
   */
  async acquire(operationName = "unknown", timeoutMs = 60000) {
    return Promise.race([
      new Promise<void>((resolve) => {
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
      }),
      new Promise((_, reject) =>
        setTimeout(
          () =>
            reject(new Error(`Mutex acquire timed out for ${operationName} after ${timeoutMs}ms`)),
          timeoutMs
        )
      ),
    ]);
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
  async execute(fn, operationName = "unknown") {
    logger.debug(`🔧 ${this.name}: Starting execute for ${operationName}`);

    await this.acquire(operationName);
    logger.debug(`🔧 ${this.name}: Acquired lock for ${operationName}`);

    try {
      logger.debug(`🔧 ${this.name}: About to call function for ${operationName}`);
      const result = await fn();
      logger.debug(`🔧 ${this.name}: Function completed for ${operationName}`);
      return result;
    } catch (error) {
      logger.error(`🔧 ${this.name}: Function failed for ${operationName}:`, error);
      throw error;
    } finally {
      logger.debug(`🔧 ${this.name}: About to release lock for ${operationName}`);
      this.release();
      logger.debug(`🔧 ${this.name}: Lock released for ${operationName}`);
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
