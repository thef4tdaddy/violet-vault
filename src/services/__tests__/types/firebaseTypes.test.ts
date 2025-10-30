/**
 * @file Firebase Types Tests
 * @description Tests for Firebase service type safety and error handling
 */

import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { typedFirebaseSyncService } from "../../typedFirebaseSyncService";
import { typedChunkedSyncService } from "../../typedChunkedSyncService";
import {
  firebaseErrorHandler,
  syncOperationWrapper,
  syncDataValidator,
} from "../../types/firebaseServiceTypes";
import { enhancedFirebaseErrorHandler } from "../../types/errorHandling";
import logger from "../../../utils/common/logger";

// Mock the original services
vi.mock("../../firebaseSyncService", () => ({
  default: {
    app: null,
    db: null,
    auth: null,
    initialize: vi.fn(),
    ensureAuthenticated: vi.fn(),
    saveToCloud: vi.fn(),
    loadFromCloud: vi.fn(),
    setupRealTimeSync: vi.fn(),
    stopRealTimeSync: vi.fn(),
    addSyncListener: vi.fn(),
    removeSyncListener: vi.fn(),
    getStatus: vi.fn(),
    cleanup: vi.fn(),
  },
}));

vi.mock("../../chunkedSyncService", () => ({
  default: {
    initialize: vi.fn(),
    saveToCloud: vi.fn(),
    loadFromCloud: vi.fn(),
    getStats: vi.fn(),
    generateChunkId: vi.fn(),
    clearCorruptedData: vi.fn(),
  },
}));

vi.mock("../../../utils/common/logger", () => ({
  default: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

describe("TypedFirebaseSyncService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Initialization", () => {
    it("should validate initialization parameters", () => {
      expect(() => {
        typedFirebaseSyncService.initialize("", "valid-key");
      }).toThrow("budgetId and encryptionKey cannot be empty");

      expect(() => {
        typedFirebaseSyncService.initialize("valid-id", "");
      }).toThrow("budgetId and encryptionKey cannot be empty");

      expect(() => {
        typedFirebaseSyncService.initialize(123 as unknown as string, "valid-key");
      }).toThrow("budgetId and encryptionKey must be strings");
    });

    it("should initialize with valid parameters", () => {
      expect(() => {
        typedFirebaseSyncService.initialize("valid-budget-id", "valid-encryption-key");
      }).not.toThrow();

      expect(logger.info).toHaveBeenCalledWith(
        "Typed Firebase sync service initialized",
        expect.objectContaining({
          budgetId: "valid-bu...",
          hasEncryptionKey: true,
        })
      );
    });
  });

  describe("Authentication", () => {
    it("should handle authentication with type safety", async () => {
      const mockFirebaseService = await import("../../firebaseSyncService");
      (mockFirebaseService.default.ensureAuthenticated as Mock).mockResolvedValue(true);

      const result = await typedFirebaseSyncService.ensureAuthenticated();
      expect(result).toBe(true);
    });

    it("should handle authentication failure", async () => {
      const mockFirebaseService = await import("../../firebaseSyncService");
      (mockFirebaseService.default.ensureAuthenticated as Mock).mockResolvedValue(false);

      const result = await typedFirebaseSyncService.ensureAuthenticated();
      expect(result).toBe(false);
    });

    it("should handle authentication errors", async () => {
      const mockFirebaseService = await import("../../firebaseSyncService");
      (mockFirebaseService.default.ensureAuthenticated as Mock).mockRejectedValue(
        new Error("Authentication failed")
      );

      const result = await typedFirebaseSyncService.ensureAuthenticated();
      expect(result).toBe(false);
    });
  });

  describe("Data Operations", () => {
    it("should save data with type safety", async () => {
      const mockFirebaseService = await import("../../firebaseSyncService");
      (mockFirebaseService.default.saveToCloud as Mock).mockResolvedValue(true);

      const testData = { test: "data", number: 123 };
      const result = await typedFirebaseSyncService.saveToCloud(testData);

      expect(result.success).toBe(true);
      expect(result.data).toBe(true);
      expect(typeof result.timestamp).toBe("number");
    });

    it("should reject undefined data", async () => {
      const result = await typedFirebaseSyncService.saveToCloud(undefined);

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain("Data cannot be undefined");
    });

    it("should validate metadata format", async () => {
      const testData = { test: "data" };
      const invalidMetadata = { version: 123 as unknown as string }; // should be string

      const result = await typedFirebaseSyncService.saveToCloud(testData, invalidMetadata);

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain("Invalid metadata format");
    });

    it("should load data with type safety", async () => {
      const mockFirebaseService = await import("../../firebaseSyncService");
      const testData = { transactions: [], envelopes: [] };
      (mockFirebaseService.default.loadFromCloud as Mock).mockResolvedValue(testData);

      const result = await typedFirebaseSyncService.loadFromCloud();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(testData);
    });

    it("should handle null load result", async () => {
      const mockFirebaseService = await import("../../firebaseSyncService");
      (mockFirebaseService.default.loadFromCloud as Mock).mockResolvedValue(null);

      const result = await typedFirebaseSyncService.loadFromCloud();

      expect(result.success).toBe(true);
      expect(result.data).toBe(null);
    });
  });

  describe("Status and Cleanup", () => {
    it("should return valid status structure", () => {
      const mockFirebaseService = vi.mocked(require("../../firebaseSyncService").default);

      (mockFirebaseService.getStatus as Mock).mockReturnValue({
        isOnline: true,
        isInitialized: true,
        queuedOperations: 5,
        lastSyncTimestamp: 1234567890,
        activeUsers: 2,
      });

      const status = typedFirebaseSyncService.getStatus();

      expect(status).toEqual({
        isOnline: true,
        isInitialized: true,
        queuedOperations: 5,
        lastSyncTimestamp: 1234567890,
        activeUsers: 2,
      });
    });

    it("should handle invalid status structure", () => {
      const mockFirebaseService = vi.mocked(require("../../firebaseSyncService").default);

      (mockFirebaseService.getStatus as Mock).mockReturnValue({
        invalid: "status",
      } as unknown as ReturnType<typeof mockFirebaseService.getStatus>);

      const status = typedFirebaseSyncService.getStatus();

      expect(status).toEqual({
        isOnline: false,
        isInitialized: false,
        queuedOperations: 0,
        lastSyncTimestamp: null,
        activeUsers: 0,
      });

      expect(logger.warn).toHaveBeenCalledWith(
        "Firebase service returned invalid status structure"
      );
    });
  });
});

describe("TypedChunkedSyncService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Initialization", () => {
    it("should validate initialization parameters", async () => {
      await expect(typedChunkedSyncService.initialize("", "valid-key")).rejects.toThrow(
        "budgetId and encryptionKey cannot be empty"
      );

      await expect(typedChunkedSyncService.initialize("valid-id", "short")).rejects.toThrow(
        "Encryption key appears to be too short"
      );
    });

    it("should initialize with valid parameters", async () => {
      const mockChunkedService = await import("../../chunkedSyncService");
      (mockChunkedService.default.initialize as Mock).mockResolvedValue(undefined);
      (mockChunkedService.default.getStats as Mock).mockReturnValue({
        maxChunkSize: 900000,
        maxArrayChunkSize: 5000,
        isInitialized: true,
      });

      await expect(
        typedChunkedSyncService.initialize(
          "valid-budget-id",
          "valid-encryption-key-that-is-long-enough"
        )
      ).resolves.not.toThrow();

      expect(logger.info).toHaveBeenCalledWith(
        "Typed chunked sync service initialized",
        expect.objectContaining({
          budgetId: "valid-bu...",
          hasEncryptionKey: true,
        })
      );
    });
  });

  describe("Data Operations", () => {
    it("should validate user information for save operations", async () => {
      const testData = { test: "data" };
      const invalidUser = { uid: "" } as unknown as {
        readonly uid: string;
        readonly userName: string;
      }; // missing userName and empty uid

      const result = await typedChunkedSyncService.saveToCloud(testData, invalidUser);

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain("Invalid user information");
    });

    it("should save data with valid user", async () => {
      const mockChunkedService = await import("../../chunkedSyncService");
      (mockChunkedService.default.saveToCloud as Mock).mockResolvedValue(true);

      const testData = { transactions: [], envelopes: [] };
      const validUser = { uid: "user123", userName: "Test User" };

      const result = await typedChunkedSyncService.saveToCloud(testData, validUser);

      expect(result.success).toBe(true);
      expect(result.data).toBe(true);
    });

    it("should provide chunking information", () => {
      const testData = { test: "small data" };
      const info = typedChunkedSyncService.getChunkingInfo(testData);

      expect(info).toHaveProperty("estimatedSize");
      expect(info).toHaveProperty("wouldRequireChunking");
      expect(info).toHaveProperty("estimatedChunks");
      expect(typeof info.estimatedSize).toBe("number");
      expect(typeof info.wouldRequireChunking).toBe("boolean");
      expect(typeof info.estimatedChunks).toBe("number");
    });
  });

  describe("Chunk ID Generation", () => {
    it("should validate chunk ID parameters", () => {
      expect(() => {
        typedChunkedSyncService.generateChunkId("", 0);
      }).toThrow("Array name must be a non-empty string");

      expect(() => {
        typedChunkedSyncService.generateChunkId("valid", -1);
      }).toThrow("Chunk index must be a non-negative integer");

      expect(() => {
        typedChunkedSyncService.generateChunkId("valid", 1000);
      }).toThrow("Chunk index too large");
    });

    it("should generate valid chunk IDs", () => {
      const mockChunkedService = vi.mocked(require("../../chunkedSyncService").default);

      (mockChunkedService.generateChunkId as Mock).mockReturnValue("transactions_chunk_001");

      const chunkId = typedChunkedSyncService.generateChunkId("transactions", 1);
      expect(chunkId).toBe("transactions_chunk_001");
    });
  });

  describe("Stats and Health", () => {
    it("should return valid stats", () => {
      const mockChunkedService = vi.mocked(require("../../chunkedSyncService").default);

      (mockChunkedService.getStats as Mock).mockReturnValue({
        maxChunkSize: 900000,
        maxArrayChunkSize: 5000,
        isInitialized: true,
        lastSyncTimestamp: 1234567890,
      });

      const stats = typedChunkedSyncService.getStats();

      expect(stats).toEqual({
        maxChunkSize: 900000,
        maxArrayChunkSize: 5000,
        isInitialized: true,
        lastSyncTimestamp: 1234567890,
      });
    });

    it("should validate chunk integrity", async () => {
      const validData = {
        transactions: [],
        envelopes: [],
      };

      const isValid = await typedChunkedSyncService.validateChunkIntegrity(validData);
      expect(isValid).toBe(true);

      const invalidData = {
        transactions: "not an array",
      };

      const isInvalid = await typedChunkedSyncService.validateChunkIntegrity(invalidData);
      expect(isInvalid).toBe(false);
    });
  });
});

describe("Error Handling", () => {
  describe("Firebase Error Handler", () => {
    it("should categorize network errors", () => {
      const networkError = new Error("Network timeout occurred");
      const category = firebaseErrorHandler.categorizeError(networkError);
      expect(category).toBe("network");
    });

    it("should categorize encryption errors", () => {
      const encryptionError = new Error("Failed to decrypt data");
      const category = firebaseErrorHandler.categorizeError(encryptionError);
      expect(category).toBe("encryption");
    });

    it("should categorize firebase errors", () => {
      const firebaseError = new Error("Firebase permission denied");
      const category = firebaseErrorHandler.categorizeError(firebaseError);
      expect(category).toBe("firebase");
    });

    it("should handle unknown errors", () => {
      const unknownError = new Error("Something weird happened");
      const category = firebaseErrorHandler.categorizeError(unknownError);
      expect(category).toBe("unknown");
    });

    it("should create structured firebase errors", () => {
      const error = firebaseErrorHandler.createFirebaseError(
        "TEST_ERROR",
        "Test error message",
        "network",
        { test: "context" }
      );

      expect(error).toEqual({
        code: "TEST_ERROR",
        message: "Test error message",
        category: "network",
        timestamp: expect.any(Number),
        context: { test: "context" },
      });
    });
  });

  describe("Enhanced Error Handler", () => {
    it("should provide detailed error categorization", () => {
      const timeoutError = new Error("Request timeout");
      const detailedCategory = enhancedFirebaseErrorHandler.categorizeDetailedError(timeoutError);
      expect(detailedCategory).toBe("network_timeout");
    });

    it("should provide recovery strategies", () => {
      const error = new Error("Network timeout");
      const enhancedError = enhancedFirebaseErrorHandler.createEnhancedError(error);

      expect(enhancedError.recoveryStrategy).toEqual({
        canRetry: true,
        maxRetries: 3,
        retryDelay: 2000,
        exponentialBackoff: true,
        requiresUserAction: false,
        recoveryActions: ["Check internet connection", "Retry operation"],
      });
    });

    it("should determine if errors are retryable", () => {
      const retryableError = enhancedFirebaseErrorHandler.createEnhancedError(
        new Error("Network timeout")
      );
      expect(enhancedFirebaseErrorHandler.isRetryable(retryableError)).toBe(true);

      const nonRetryableError = enhancedFirebaseErrorHandler.createEnhancedError(
        new Error("Permission denied")
      );
      expect(enhancedFirebaseErrorHandler.isRetryable(nonRetryableError)).toBe(false);
    });

    it("should calculate retry delays with exponential backoff", () => {
      const error = enhancedFirebaseErrorHandler.createEnhancedError(new Error("Network timeout"));

      expect(enhancedFirebaseErrorHandler.getRetryDelay(error, 0)).toBe(2000);
      expect(enhancedFirebaseErrorHandler.getRetryDelay(error, 1)).toBe(4000);
      expect(enhancedFirebaseErrorHandler.getRetryDelay(error, 2)).toBe(8000);
    });
  });

  describe("Data Validation", () => {
    it("should validate encrypted data structure", () => {
      const validEncryptedData = {
        encryptedData: "encrypted-string",
        timestamp: new Date(),
        metadata: { version: "1.0" },
      };

      expect(syncDataValidator.validateEncryptedData(validEncryptedData)).toBe(true);
      expect(syncDataValidator.validateEncryptedData({})).toBe(false);
      expect(syncDataValidator.validateEncryptedData(null)).toBe(false);
    });

    it("should validate manifest structure", () => {
      const validManifest = {
        totalChunks: 5,
        dataSize: 1024000,
        checksum: "abc123",
      };

      expect(syncDataValidator.validateManifest(validManifest)).toBe(true);
      expect(syncDataValidator.validateManifest({})).toBe(false);
    });

    it("should validate chunk data structure", () => {
      const validChunk = {
        id: "chunk_001",
        data: "chunk-data",
        index: 0,
        total: 5,
      };

      expect(syncDataValidator.validateChunkData(validChunk)).toBe(true);
      expect(syncDataValidator.validateChunkData({})).toBe(false);
    });
  });

  describe("Sync Operation Wrapper", () => {
    it("should execute operations with type safety", async () => {
      const successOperation = () => Promise.resolve("success");
      const result = await syncOperationWrapper.execute(successOperation);

      expect(result.success).toBe(true);
      expect(result.data).toBe("success");
      expect(typeof result.timestamp).toBe("number");
    });

    it("should handle operation failures", async () => {
      const failingOperation = () => Promise.reject(new Error("Operation failed"));
      const result = await syncOperationWrapper.execute(failingOperation);

      expect(result.success).toBe(false);
      expect(result.error?.message).toBe("Operation failed");
    });

    it("should retry operations with exponential backoff", async () => {
      let attemptCount = 0;
      const flakeyOperation = () => {
        attemptCount++;
        if (attemptCount < 3) {
          return Promise.reject(new Error("Temporary failure"));
        }
        return Promise.resolve("success after retries");
      };

      const result = await syncOperationWrapper.executeWithRetry(flakeyOperation, 3, 100);

      expect(result.success).toBe(true);
      expect(result.data).toBe("success after retries");
      expect(attemptCount).toBe(3);
    });
  });
});
