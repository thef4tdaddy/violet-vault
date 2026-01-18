/**
 * Firebase Service Type Implementations
 * Concrete type-safe implementations for Firebase services
 */

import type {
  FirebaseServiceStatus,
  ChunkedSyncStats,
  SyncMetadata,
  CloudSyncConfig,
  FirebaseError,
  ErrorCategory,
  TypedResponse,
  SafeUnknown,
} from "@/types/firebase";

// Enhanced sync service interface with type safety
// Note: Does not extend IFirebaseSyncService due to incompatible return types
export interface TypedFirebaseSyncService {
  readonly app: unknown; // Firebase App
  readonly db: unknown; // Firestore
  readonly auth: unknown; // Auth

  initialize(budgetId: string, encryptionKey: string): void;
  ensureAuthenticated(): Promise<boolean>;
  getStatus(): FirebaseServiceStatus;
  cleanup(): void;

  // Type-safe methods with TypedResponse wrappers
  saveToCloud<T extends SafeUnknown>(
    data: T,
    metadata?: Partial<SyncMetadata>
  ): Promise<TypedResponse<boolean>>;

  loadFromCloud<T extends SafeUnknown>(): Promise<TypedResponse<T>>;

  setupRealTimeSync<T extends SafeUnknown>(callback: (data: TypedResponse<T>) => void): void;

  stopRealTimeSync(): void;

  addSyncListener(callback: (event: string, data: TypedResponse<SafeUnknown>) => void): void;

  removeSyncListener(callback: (event: string, data: TypedResponse<SafeUnknown>) => void): void;
}

// Enhanced chunked sync service with type safety
// Note: Does not extend IChunkedSyncService due to incompatible return types
export interface TypedChunkedSyncService {
  initialize(budgetId: string, encryptionKey: string): Promise<void>;
  getStats(): ChunkedSyncStats;

  // Chunk management
  generateChunkId(arrayName: string, chunkIndex: number): string;
  clearCorruptedData(): Promise<void>;

  // Type-safe methods with TypedResponse wrappers
  saveToCloud<T extends SafeUnknown>(
    data: T,
    currentUser: CloudSyncConfig["currentUser"]
  ): Promise<TypedResponse<boolean>>;

  loadFromCloud<T extends SafeUnknown>(): Promise<TypedResponse<T>>;
}

// Type-safe error handling for Firebase operations
export interface FirebaseErrorHandler {
  categorizeError(error: unknown): ErrorCategory;
  createFirebaseError(
    code: string,
    message: string,
    category: ErrorCategory,
    context?: Record<string, unknown>
  ): FirebaseError;
  handleError(error: unknown): FirebaseError;
}

// Implementation of error handler
export class TypedFirebaseErrorHandler implements FirebaseErrorHandler {
  categorizeError(error: unknown): ErrorCategory {
    if (!(error instanceof Error)) {
      return "unknown";
    }

    const message = error.message.toLowerCase();

    // Network-related errors
    if (
      message.includes("network") ||
      message.includes("timeout") ||
      message.includes("connection") ||
      message.includes("fetch") ||
      message.includes("cors") ||
      message.includes("blocked")
    ) {
      return "network";
    }

    // Encryption/decryption errors
    if (
      message.includes("decrypt") ||
      message.includes("encrypt") ||
      message.includes("data is too small") ||
      message.includes("cipher") ||
      message.includes("key derivation") ||
      message.includes("invalid key")
    ) {
      return "encryption";
    }

    // Firebase-specific errors
    if (
      message.includes("firebase") ||
      message.includes("firestore") ||
      message.includes("permission") ||
      message.includes("quota") ||
      message.includes("rate limit")
    ) {
      return "firebase";
    }

    // Data validation errors
    if (
      message.includes("validation") ||
      message.includes("invalid data") ||
      message.includes("checksum") ||
      message.includes("corrupt") ||
      message.includes("malformed")
    ) {
      return "validation";
    }

    // Storage/database errors
    if (
      message.includes("storage") ||
      message.includes("database") ||
      message.includes("indexeddb") ||
      message.includes("dexie") ||
      message.includes("transaction")
    ) {
      return "storage";
    }

    // Authentication errors
    if (
      message.includes("auth") ||
      message.includes("unauthorized") ||
      message.includes("token") ||
      message.includes("login") ||
      message.includes("credential")
    ) {
      return "authentication";
    }

    return "unknown";
  }

  createFirebaseError(
    code: string,
    message: string,
    category: ErrorCategory,
    context?: Record<string, unknown>
  ): FirebaseError {
    return {
      code,
      message,
      category,
      timestamp: Date.now(),
      context,
    };
  }

  handleError(error: unknown): FirebaseError {
    if (error instanceof Error) {
      const category = this.categorizeError(error);
      return this.createFirebaseError("UNKNOWN_ERROR", error.message, category, {
        stack: error.stack,
      });
    }

    return this.createFirebaseError("UNKNOWN_ERROR", "An unknown error occurred", "unknown", {
      error: String(error),
    });
  }
}

// Type-safe sync operation wrapper
export interface SyncOperationWrapper {
  execute<T extends SafeUnknown>(operation: () => Promise<T>): Promise<TypedResponse<T>>;

  executeWithRetry<T extends SafeUnknown>(
    operation: () => Promise<T>,
    maxRetries?: number,
    retryDelay?: number
  ): Promise<TypedResponse<T>>;
}

export class TypedSyncOperationWrapper implements SyncOperationWrapper {
  private errorHandler: FirebaseErrorHandler;

  constructor(errorHandler?: FirebaseErrorHandler) {
    this.errorHandler = errorHandler || new TypedFirebaseErrorHandler();
  }

  async execute<T extends SafeUnknown>(operation: () => Promise<T>): Promise<TypedResponse<T>> {
    try {
      const data = await operation();
      return {
        success: true,
        data,
        timestamp: Date.now(),
      };
    } catch (error) {
      const firebaseError = this.errorHandler.handleError(error);
      return {
        success: false,
        error: firebaseError,
        timestamp: Date.now(),
      };
    }
  }

  async executeWithRetry<T extends SafeUnknown>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    retryDelay: number = 1000
  ): Promise<TypedResponse<T>> {
    let lastError: FirebaseError | undefined;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const data = await operation();
        return {
          success: true,
          data,
          timestamp: Date.now(),
        };
      } catch (error) {
        lastError = this.errorHandler.handleError(error);

        // Don't retry on certain error types
        if (lastError.category === "authentication" || lastError.category === "validation") {
          break;
        }

        // Wait before retrying (except on last attempt)
        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, retryDelay * (attempt + 1)));
        }
      }
    }

    return {
      success: false,
      error: lastError,
      timestamp: Date.now(),
    };
  }
}

// Type-safe validation helpers
export interface SyncDataValidator {
  validateEncryptedData(
    data: unknown
  ): data is { encryptedData: string; timestamp: unknown; metadata: unknown };
  validateManifest(
    manifest: unknown
  ): manifest is { totalChunks: number; dataSize: number; checksum: string };
  validateChunkData(
    chunk: unknown
  ): chunk is { id: string; data: string; index: number; total: number };
}

export class TypedSyncDataValidator implements SyncDataValidator {
  validateEncryptedData(
    data: unknown
  ): data is { encryptedData: string; timestamp: unknown; metadata: unknown } {
    const dataObj = data as Record<string, unknown>;
    return (
      typeof data === "object" &&
      data !== null &&
      "encryptedData" in dataObj &&
      "timestamp" in dataObj &&
      "metadata" in dataObj &&
      typeof dataObj.encryptedData === "string"
    );
  }

  validateManifest(
    manifest: unknown
  ): manifest is { totalChunks: number; dataSize: number; checksum: string } {
    const manifestObj = manifest as Record<string, unknown>;
    return (
      typeof manifest === "object" &&
      manifest !== null &&
      "totalChunks" in manifestObj &&
      "dataSize" in manifestObj &&
      "checksum" in manifestObj &&
      typeof manifestObj.totalChunks === "number" &&
      typeof manifestObj.dataSize === "number" &&
      typeof manifestObj.checksum === "string"
    );
  }

  validateChunkData(
    chunk: unknown
  ): chunk is { id: string; data: string; index: number; total: number } {
    const chunkObj = chunk as Record<string, unknown>;
    return (
      typeof chunk === "object" &&
      chunk !== null &&
      "id" in chunkObj &&
      "data" in chunkObj &&
      "index" in chunkObj &&
      "total" in chunkObj &&
      typeof chunkObj.id === "string" &&
      typeof chunkObj.data === "string" &&
      typeof chunkObj.index === "number" &&
      typeof chunkObj.total === "number"
    );
  }
}

// Export singleton instances
export const firebaseErrorHandler = new TypedFirebaseErrorHandler();
export const syncOperationWrapper = new TypedSyncOperationWrapper();
export const syncDataValidator = new TypedSyncDataValidator();
