/**
 * @file Firebase Types Tests
 * @description Tests for Firebase service type safety and error handling
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  firebaseErrorHandler,
  syncOperationWrapper,
  syncDataValidator,
} from "../../types/firebaseServiceTypes";

vi.mock("@/utils/common/logger", () => ({
  default: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

describe("Firebase Service Types", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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
