/**
 * Typed Firebase Sync Service
 * Type-safe wrapper around the existing firebaseSyncService
 * Provides type safety while maintaining compatibility with existing code
 */

import firebaseSyncService from "./firebaseSyncService";
import type {
  TypedFirebaseSyncService,
  FirebaseErrorHandler,
  SyncOperationWrapper,
} from "./types/firebaseServiceTypes";
import type {
  FirebaseServiceStatus,
  SyncMetadata,
  TypedResponse,
  SafeUnknown,
} from "../types/firebase";
import { isString } from "../types/common";
import { firebaseErrorHandler, syncOperationWrapper } from "./types/firebaseServiceTypes";
import logger from "../utils/common/logger";

/**
 * Type-safe wrapper for Firebase Sync Service
 * Maintains compatibility with existing JavaScript service while adding type safety
 */
class TypedFirebaseSyncServiceImpl implements TypedFirebaseSyncService {
  private errorHandler: FirebaseErrorHandler;
  private operationWrapper: SyncOperationWrapper;

  constructor() {
    this.errorHandler = firebaseErrorHandler;
    this.operationWrapper = syncOperationWrapper;
  }

  // Delegate to existing service properties
  get app() {
    return firebaseSyncService.app;
  }

  get db() {
    return firebaseSyncService.db;
  }

  get auth() {
    return firebaseSyncService.auth;
  }

  // Type-safe initialization
  initialize(budgetId: string, encryptionKey: string): void {
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

    firebaseSyncService.initialize(budgetId, encryptionKey as unknown as CryptoKey);
    logger.info("Typed Firebase sync service initialized", {
      budgetId: budgetId.substring(0, 8) + "...",
      hasEncryptionKey: true,
    });
  }

  // Type-safe authentication
  async ensureAuthenticated(): Promise<boolean> {
    return this.operationWrapper
      .execute(async () => {
        const result = await firebaseSyncService.ensureAuthenticated();
        if (typeof result !== "boolean") {
          throw new Error("Authentication result must be boolean");
        }
        return result;
      })
      .then((response) => response.success && response.data === true);
  }

  // Type-safe save operation
  async saveToCloud<T extends SafeUnknown>(
    data: T,
    metadata?: Partial<SyncMetadata>
  ): Promise<TypedResponse<boolean>> {
    return this.operationWrapper.execute(async () => {
      // Validate input data
      if (data === undefined) {
        throw new Error("Data cannot be undefined");
      }

      // Validate metadata if provided
      if (metadata && !this.isValidMetadata(metadata)) {
        throw new Error("Invalid metadata format");
      }

      const result = await firebaseSyncService.saveToCloud(data, metadata);

      if (typeof result !== "boolean") {
        throw new Error("Save operation must return boolean");
      }

      return result;
    });
  }

  // Type-safe load operation
  async loadFromCloud<T extends SafeUnknown>(): Promise<TypedResponse<T>> {
    return this.operationWrapper.execute(async () => {
      const result = await firebaseSyncService.loadFromCloud();

      // Handle null result (no data found)
      if (result === null) {
        return null as T;
      }

      // Validate loaded data structure
      if (!this.isValidLoadedData(result)) {
        throw new Error("Loaded data has invalid structure");
      }

      return result as T;
    });
  }

  // Type-safe real-time sync setup
  setupRealTimeSync<T extends SafeUnknown>(callback: (data: TypedResponse<T>) => void): void {
    if (typeof callback !== "function") {
      throw new Error("Callback must be a function");
    }

    firebaseSyncService.setupRealTimeSync((rawData: unknown) => {
      // Wrap the callback with type safety
      const wrappedCallback = async () => {
        if (!this.isValidLoadedData(rawData)) {
          callback({
            success: false,
            error: this.errorHandler.createFirebaseError(
              "INVALID_DATA",
              "Real-time sync received invalid data structure",
              "validation"
            ),
            timestamp: Date.now(),
          });
          return;
        }

        callback({
          success: true,
          data: rawData as T,
          timestamp: Date.now(),
        });
      };

      wrappedCallback().catch((error) => {
        const firebaseError = this.errorHandler.handleError(error);
        callback({
          success: false,
          error: firebaseError,
          timestamp: Date.now(),
        });
      });
    });
  }

  // Stop real-time sync
  stopRealTimeSync(): void {
    firebaseSyncService.stopRealTimeSync();
  }

  // Type-safe listener management
  addSyncListener(callback: (event: string, data: TypedResponse<SafeUnknown>) => void): void {
    if (typeof callback !== "function") {
      throw new Error("Callback must be a function");
    }

    firebaseSyncService.addSyncListener((event: string, rawData: unknown) => {
      // Wrap the raw data in a typed response
      const typedResponse: TypedResponse<SafeUnknown> = {
        success: true,
        data: rawData as SafeUnknown,
        timestamp: Date.now(),
      };

      try {
        callback(event, typedResponse);
      } catch (error) {
        logger.error("Error in typed sync listener", error);
      }
    });
  }

  removeSyncListener(_callback: (event: string, data: TypedResponse<SafeUnknown>) => void): void {
    // Note: The original service doesn't provide a direct way to remove specific callbacks
    // This would need to be enhanced in the original service
    logger.warn("removeSyncListener: Not fully implemented - requires enhancement of base service");
  }

  // Get service status with type safety
  getStatus(): FirebaseServiceStatus {
    const rawStatus = firebaseSyncService.getStatus();

    // Validate status structure
    if (!this.isValidStatus(rawStatus)) {
      logger.warn("Firebase service returned invalid status structure");
      return {
        isOnline: false,
        isInitialized: false,
        queuedOperations: 0,
        lastSyncTimestamp: null,
        activeUsers: 0,
      };
    }

    return {
      isOnline: Boolean(rawStatus.isOnline),
      isInitialized: Boolean(rawStatus.isInitialized),
      queuedOperations: Number(rawStatus.queuedOperations) || 0,
      lastSyncTimestamp: rawStatus.lastSyncTimestamp || null,
      activeUsers: Number(rawStatus.activeUsers) || 0,
    };
  }

  // Cleanup with proper typing
  cleanup(): void {
    firebaseSyncService.cleanup();
  }

  // Private validation helpers
  private isValidMetadata(metadata: unknown): metadata is Partial<SyncMetadata> {
    if (typeof metadata !== "object" || metadata === null) {
      return false;
    }

    const meta = metadata as Record<string, unknown>;

    // Check optional properties have correct types if present
    if (meta.version !== undefined && typeof meta.version !== "string") {
      return false;
    }

    if (meta.userAgent !== undefined && typeof meta.userAgent !== "string") {
      return false;
    }

    if (meta.userId !== undefined && typeof meta.userId !== "string") {
      return false;
    }

    if (meta.userName !== undefined && typeof meta.userName !== "string") {
      return false;
    }

    return true;
  }

  private isValidLoadedData(data: unknown): boolean {
    // Allow null (no data found)
    if (data === null) {
      return true;
    }

    // Must be an object, array, string, number, or boolean
    return (
      typeof data === "object" ||
      typeof data === "string" ||
      typeof data === "number" ||
      typeof data === "boolean"
    );
  }

  private isValidStatus(status: unknown): status is FirebaseServiceStatus {
    return (
      typeof status === "object" &&
      status !== null &&
      "isOnline" in status &&
      "isInitialized" in status &&
      "queuedOperations" in status &&
      "lastSyncTimestamp" in status &&
      "activeUsers" in status
    );
  }
}

// Export singleton instance
export const typedFirebaseSyncService = new TypedFirebaseSyncServiceImpl();
