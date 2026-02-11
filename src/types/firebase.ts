/**
 * Firebase Service Types
 * Type-safe interfaces for Firebase/Firestore operations
 * Narrows any/unknown types at service boundaries
 */

import type {
  DocumentData,
  DocumentReference,
  DocumentSnapshot,
  Query,
  QuerySnapshot,
  Timestamp,
  WriteBatch,
} from "firebase/firestore";

// Core data types
export interface EncryptedData {
  readonly encryptedData: string;
  readonly timestamp: Timestamp;
  readonly metadata: SyncMetadata;
}

export interface SyncMetadata {
  readonly version: string;
  readonly userAgent: string;
  readonly userId?: string;
  readonly userName?: string;
  readonly operation?: string;
  readonly checksum?: string;
}

export interface SyncResult {
  readonly success: boolean;
  readonly timestamp?: number;
  readonly error?: string;
  readonly metadata?: SyncMetadata;
}

export interface ChunkData {
  readonly id: string;
  readonly data: string;
  readonly index: number;
  readonly total: number;
  readonly checksum: string;
  readonly timestamp: Timestamp;
}

export interface ChunkManifest {
  readonly totalChunks: number;
  readonly dataSize: number;
  readonly checksum: string;
  readonly timestamp: Timestamp;
  readonly metadata: SyncMetadata;
}

// Firebase service status types
export interface FirebaseServiceStatus {
  readonly isOnline: boolean;
  readonly isInitialized: boolean;
  readonly queuedOperations: number;
  readonly lastSyncTimestamp: number | null;
  readonly activeUsers: number;
}

export interface ChunkedSyncStats {
  readonly maxChunkSize: number;
  readonly maxArrayChunkSize: number;
  readonly isInitialized: boolean;
  readonly lastSyncTimestamp?: number;
  readonly totalChunks?: number;
  readonly failedChunks?: number;
}

// Error handling types
export interface FirebaseError {
  readonly code: string;
  readonly message: string;
  readonly category: ErrorCategory;
  readonly timestamp: number;
  readonly context?: Record<string, unknown>;
}

export type ErrorCategory =
  | "network"
  | "encryption"
  | "firebase"
  | "validation"
  | "storage"
  | "authentication"
  | "unknown";

// Service initialization types
export interface FirebaseSyncConfig {
  readonly budgetId: string;
  readonly encryptionKey: string;
}

export interface CloudSyncConfig extends FirebaseSyncConfig {
  readonly currentUser: {
    readonly uid: string;
    readonly userName: string;
  };
}

// Sync operation types
export interface SyncOperation {
  readonly type: "save" | "load" | "chunk_save" | "chunk_load";
  readonly budgetId: string;
  readonly timestamp: number;
  readonly metadata?: SyncMetadata;
}

// Firebase service interfaces
export interface IFirebaseSyncService {
  readonly app: unknown; // Firebase App
  readonly db: unknown; // Firestore
  readonly auth: unknown; // Auth

  initialize(budgetId: string, encryptionKey: string): void;
  ensureAuthenticated(): Promise<boolean>;
  saveToCloud<T extends SafeUnknown>(
    data: T,
    metadata?: Partial<SyncMetadata>
  ): Promise<TypedResponse<boolean>>;
  loadFromCloud<T extends SafeUnknown>(): Promise<TypedResponse<T | null>>;
  setupRealTimeSync<T extends SafeUnknown>(callback: (data: TypedResponse<T | null>) => void): void;
  stopRealTimeSync(): void;
  getStatus(): FirebaseServiceStatus;
  cleanup(): void;

  // Event listeners
  addSyncListener(callback: (event: string, data: TypedResponse<SafeUnknown>) => void): void;
  removeSyncListener(callback: (event: string, data: TypedResponse<SafeUnknown>) => void): void;
}

export interface IChunkedSyncService {
  initialize(budgetId: string, encryptionKey: string): Promise<void>;
  saveToCloud<T extends SafeUnknown>(
    data: T,
    currentUser: CloudSyncConfig["currentUser"]
  ): Promise<TypedResponse<boolean>>;
  loadFromCloud<T extends SafeUnknown>(): Promise<TypedResponse<T | null>>;
  getStats(): ChunkedSyncStats;

  // Chunk management
  generateChunkId(arrayName: string, chunkIndex: number): string;
  clearCorruptedData(): Promise<void>;
}

// Type-safe Firebase operation wrappers
export interface FirestoreOperations {
  getDocument<T = DocumentData>(ref: DocumentReference): Promise<DocumentSnapshot<T>>;
  setDocument<T = DocumentData>(ref: DocumentReference, data: T): Promise<void>;
  queryDocuments<T = DocumentData>(query: Query): Promise<QuerySnapshot<T>>;
  batchWrite(operations: Array<() => void>, batch: WriteBatch): Promise<void>;
}

// Storage operations (for future file uploads)
export interface StorageOperations {
  uploadFile(path: string, data: Blob | Uint8Array | ArrayBuffer): Promise<string>;
  downloadFile(path: string): Promise<Blob>;
  deleteFile(path: string): Promise<void>;
  getFileMetadata(path: string): Promise<StorageMetadata>;
}

export interface StorageMetadata {
  readonly name: string;
  readonly size: number;
  readonly contentType: string;
  readonly timeCreated: string;
  readonly updated: string;
  readonly downloadTokens?: string;
}

// Type guards for narrowing unknown types
export function isEncryptedData(data: unknown): data is EncryptedData {
  return (
    typeof data === "object" &&
    data !== null &&
    "encryptedData" in data &&
    "timestamp" in data &&
    "metadata" in data &&
    typeof (data as EncryptedData).encryptedData === "string"
  );
}

export function isSyncResult(result: unknown): result is SyncResult {
  return (
    typeof result === "object" &&
    result !== null &&
    "success" in result &&
    typeof (result as SyncResult).success === "boolean"
  );
}

export function isChunkData(data: unknown): data is ChunkData {
  return (
    typeof data === "object" &&
    data !== null &&
    "id" in data &&
    "data" in data &&
    "index" in data &&
    "total" in data &&
    "checksum" in data &&
    typeof (data as ChunkData).id === "string" &&
    typeof (data as ChunkData).data === "string" &&
    typeof (data as ChunkData).index === "number"
  );
}

export function isFirebaseError(error: unknown): error is FirebaseError {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    "message" in error &&
    "category" in error &&
    typeof (error as FirebaseError).code === "string" &&
    typeof (error as FirebaseError).message === "string"
  );
}

// Utility types for service boundaries
export type SafeUnknown = Record<string, unknown> | unknown[] | string | number | boolean | null;

export interface TypedResponse<T> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: FirebaseError;
  readonly timestamp: number;
}

// Helper functions for type-safe operations
export function createTypedResponse<T>(
  success: boolean,
  data?: T,
  error?: FirebaseError
): TypedResponse<T> {
  return {
    success,
    data,
    error,
    timestamp: Date.now(),
  };
}

export function categorizeFirebaseError(error: unknown): ErrorCategory {
  if (!(error instanceof Error)) {
    return "unknown";
  }

  const message = error.message.toLowerCase();

  if (
    message.includes("network") ||
    message.includes("timeout") ||
    message.includes("connection") ||
    message.includes("fetch") ||
    message.includes("cors")
  ) {
    return "network";
  }

  if (
    message.includes("decrypt") ||
    message.includes("encrypt") ||
    message.includes("cipher") ||
    message.includes("key derivation")
  ) {
    return "encryption";
  }

  if (
    message.includes("firebase") ||
    message.includes("firestore") ||
    message.includes("permission") ||
    message.includes("quota") ||
    message.includes("rate limit")
  ) {
    return "firebase";
  }

  if (
    message.includes("validation") ||
    message.includes("invalid data") ||
    message.includes("checksum") ||
    message.includes("corrupt")
  ) {
    return "validation";
  }

  if (
    message.includes("storage") ||
    message.includes("database") ||
    message.includes("indexeddb")
  ) {
    return "storage";
  }

  if (
    message.includes("auth") ||
    message.includes("unauthorized") ||
    message.includes("token") ||
    message.includes("credential")
  ) {
    return "authentication";
  }

  return "unknown";
}
