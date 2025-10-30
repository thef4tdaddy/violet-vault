/**
 * Typed Chunked Sync Service
 * Type-safe wrapper around the existing chunkedSyncService
 * Provides type safety for chunked uploads and sync operations
 */

import chunkedSyncService from "./chunkedSyncService";
import type { TypedChunkedSyncService, SyncOperationWrapper } from "./types/firebaseServiceTypes";
import type {
  ChunkedSyncStats,
  CloudSyncConfig,
  TypedResponse,
  SafeUnknown,
} from "../types/firebase";
import { isString, isObject } from "../types/common";
import { syncOperationWrapper } from "./types/firebaseServiceTypes";
import logger from "../utils/common/logger";

/**
 * Type-safe wrapper for Chunked Sync Service
 * Maintains compatibility while adding comprehensive type safety for chunked operations
 */
class TypedChunkedSyncServiceImpl implements TypedChunkedSyncService {
  private operationWrapper: SyncOperationWrapper;

  constructor() {
    this.operationWrapper = syncOperationWrapper;
  }

  // Type-safe initialization with validation
  async initialize(budgetId: string, encryptionKey: string): Promise<void> {
    if (!isString(budgetId) || !isString(encryptionKey)) {
      throw new Error(
        "Invalid initialization parameters: budgetId and encryptionKey must be strings"
      );
    }

    if (budgetId.length === 0 || encryptionKey.length === 0) {
      throw new Error(
        "Invalid initialization parameters: budgetId and encryptionKey cannot be empty"
      );
    }

    // Validate encryption key format (basic check)
    if (encryptionKey.length < 32) {
      throw new Error("Encryption key appears to be too short for secure encryption");
    }

    await chunkedSyncService.initialize(budgetId, encryptionKey);

    logger.info("Typed chunked sync service initialized", {
      budgetId: budgetId.substring(0, 8) + "...",
      hasEncryptionKey: true,
      stats: this.getStats(),
    });
  }

  // Type-safe chunked save operation
  async saveToCloud<T extends SafeUnknown>(
    data: T,
    currentUser: CloudSyncConfig["currentUser"]
  ): Promise<TypedResponse<boolean>> {
    return this.operationWrapper.executeWithRetry(
      async () => {
        // Validate input data
        if (data === undefined) {
          throw new Error("Data cannot be undefined");
        }

        // Validate user information
        if (!this.isValidUser(currentUser)) {
          throw new Error("Invalid user information provided");
        }

        // Validate data size (rough check)
        const dataSize = this.estimateDataSize(data);
        if (dataSize === 0) {
          throw new Error("Data appears to be empty");
        }

        if (dataSize > 50 * 1024 * 1024) {
          // 50MB limit
          logger.warn("Large data detected for chunked sync", {
            estimatedSize: dataSize,
            user: currentUser.uid.substring(0, 8) + "...",
          });
        }

        const result = await chunkedSyncService.saveToCloud(data, currentUser);

        if (typeof result !== "boolean") {
          throw new Error("Chunked save operation must return boolean");
        }

        return result;
      },
      3,
      2000
    ); // 3 retries with 2s delay
  }

  // Type-safe chunked load operation
  async loadFromCloud<T extends SafeUnknown>(): Promise<TypedResponse<T>> {
    return this.operationWrapper.executeWithRetry(
      async () => {
        const result = await chunkedSyncService.loadFromCloud();

        // Handle null result (no data found)
        if (result === null) {
          return null as T;
        }

        // Validate loaded data structure
        if (!this.isValidLoadedData(result)) {
          throw new Error("Loaded chunked data has invalid structure");
        }

        // Additional validation for chunked data integrity
        if (isObject(result) && "transactions" in result) {
          const transactions = (result as Record<string, unknown>).transactions;
          if (Array.isArray(transactions)) {
            logger.info("Loaded chunked data contains transactions", {
              count: transactions.length,
              dataType: typeof result,
            });
          }
        }

        return result as T;
      },
      3,
      2000
    );
  }

  // Get chunked sync statistics with type safety
  getStats(): ChunkedSyncStats {
    const rawStats = chunkedSyncService.getStats() as unknown;

    // Validate stats structure and provide defaults
    if (!this.isValidStats(rawStats)) {
      logger.warn("Chunked sync service returned invalid stats structure");
      return {
        maxChunkSize: 900 * 1024, // 900KB default
        maxArrayChunkSize: 5000,
        isInitialized: false,
      };
    }

    const stats = rawStats as unknown as Record<string, unknown>;
    return {
      maxChunkSize: Number(stats.maxChunkSize) || 900 * 1024,
      maxArrayChunkSize: Number(stats.maxArrayChunkSize) || 5000,
      isInitialized: Boolean(stats.isInitialized),
      lastSyncTimestamp: stats.lastSyncTimestamp as number | undefined,
      totalChunks: stats.totalChunks as number | undefined,
      failedChunks: stats.failedChunks as number | undefined,
    };
  }

  // Type-safe chunk ID generation
  generateChunkId(arrayName: string, chunkIndex: number): string {
    if (!isString(arrayName) || arrayName.length === 0) {
      throw new Error("Array name must be a non-empty string");
    }

    if (!Number.isInteger(chunkIndex) || chunkIndex < 0) {
      throw new Error("Chunk index must be a non-negative integer");
    }

    if (chunkIndex > 999) {
      throw new Error("Chunk index too large (max 999)");
    }

    const chunkId = chunkedSyncService.generateChunkId(arrayName, chunkIndex);

    if (!isString(chunkId) || chunkId.length === 0) {
      throw new Error("Generated chunk ID is invalid");
    }

    return chunkId;
  }

  // Type-safe corrupted data cleanup
  async clearCorruptedData(): Promise<void> {
    return this.operationWrapper
      .execute(async () => {
        await chunkedSyncService.clearCorruptedData();

        logger.info("Corrupted chunked data cleared", {
          timestamp: Date.now(),
          stats: this.getStats(),
        });

        return true; // Return a value to satisfy SafeUnknown constraint
      })
      .then((response) => {
        if (!response.success) {
          throw new Error(`Failed to clear corrupted data: ${response.error?.message}`);
        }
      });
  }

  // Private validation helpers
  private isValidUser(user: unknown): user is CloudSyncConfig["currentUser"] {
    const userObj = user as Record<string, unknown>;
    return (
      typeof user === "object" &&
      user !== null &&
      "uid" in userObj &&
      "userName" in userObj &&
      typeof userObj.uid === "string" &&
      typeof userObj.userName === "string" &&
      userObj.uid.length > 0 &&
      userObj.userName.length > 0
    );
  }

  private isValidLoadedData(data: unknown): boolean {
    // Allow null (no data found)
    if (data === null) {
      return true;
    }

    // Must be an object, array, string, number, or boolean
    const validType =
      typeof data === "object" ||
      typeof data === "string" ||
      typeof data === "number" ||
      typeof data === "boolean";

    if (!validType) {
      return false;
    }

    // Additional validation for object structures
    if (isObject(data)) {
      // Check for common budget data structure
      const obj = data as Record<string, unknown>;

      // If it has transactions, validate they're in array format
      if ("transactions" in obj && obj.transactions !== null && !Array.isArray(obj.transactions)) {
        return false;
      }

      // If it has envelopes, validate they're in array format
      if ("envelopes" in obj && obj.envelopes !== null && !Array.isArray(obj.envelopes)) {
        return false;
      }
    }

    return true;
  }

  private isValidStats(stats: unknown): stats is ChunkedSyncStats {
    const statsObj = stats as Record<string, unknown>;
    return (
      typeof stats === "object" &&
      stats !== null &&
      "maxChunkSize" in statsObj &&
      "maxArrayChunkSize" in statsObj &&
      "isInitialized" in statsObj &&
      typeof statsObj.maxChunkSize === "number" &&
      typeof statsObj.maxArrayChunkSize === "number" &&
      typeof statsObj.isInitialized === "boolean"
    );
  }

  private estimateDataSize(data: unknown): number {
    try {
      // Simple size estimation using JSON serialization
      const jsonString = JSON.stringify(data);
      return new Blob([jsonString]).size;
    } catch (error) {
      logger.warn("Failed to estimate data size", error);
      return 0;
    }
  }

  // Enhanced chunked operation helpers
  public async validateChunkIntegrity<T extends SafeUnknown>(data: T): Promise<boolean> {
    return this.operationWrapper
      .execute(async () => {
        if (data === null || data === undefined) {
          return false;
        }

        // Basic structure validation
        if (isObject(data)) {
          const obj = data as Record<string, unknown>;

          // Check for required budget structure fields
          const hasValidStructure =
            "transactions" in obj &&
            (obj.transactions === null || Array.isArray(obj.transactions)) &&
            "envelopes" in obj &&
            (obj.envelopes === null || Array.isArray(obj.envelopes));

          if (!hasValidStructure) {
            logger.warn("Chunk data lacks expected budget structure");
            return false;
          }
        }

        return true;
      })
      .then((response) => response.success && response.data === true);
  }

  public getChunkingInfo<T extends SafeUnknown>(
    data: T
  ): {
    estimatedSize: number;
    wouldRequireChunking: boolean;
    estimatedChunks: number;
  } {
    const estimatedSize = this.estimateDataSize(data);
    const stats = this.getStats();
    const wouldRequireChunking = estimatedSize > stats.maxChunkSize;
    const estimatedChunks = wouldRequireChunking
      ? Math.ceil(estimatedSize / stats.maxChunkSize)
      : 1;

    return {
      estimatedSize,
      wouldRequireChunking,
      estimatedChunks,
    };
  }
}

// Export singleton instance
export const typedChunkedSyncService = new TypedChunkedSyncServiceImpl();
