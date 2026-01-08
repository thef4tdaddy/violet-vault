import { describe, it, expect, vi } from "vitest";
import {
  isEncryptedData,
  isSyncResult,
  isChunkData,
  isFirebaseError,
  createTypedResponse,
  categorizeFirebaseError,
  type EncryptedData,
  type SyncResult,
  type ChunkData,
  type FirebaseError,
  type SyncMetadata,
  type ErrorCategory,
} from "../firebase";

// Mock firebase/firestore Timestamp
vi.mock("firebase/firestore", async (importOriginal) => {
  const actual = await importOriginal<typeof import("firebase/firestore")>();
  return {
    ...actual,
    Timestamp: {
      now: () => ({ seconds: Date.now() / 1000, nanoseconds: 0 }),
      fromDate: (date: Date) => ({ seconds: date.getTime() / 1000, nanoseconds: 0 }),
    },
  };
});

// Import Timestamp after mocking
const { Timestamp } = await import("firebase/firestore");

describe("firebase.ts - Type Guards and Helpers", () => {
  describe("isEncryptedData", () => {
    it("should return true for valid EncryptedData", () => {
      const validData: EncryptedData = {
        encryptedData: "encrypted-string-123",
        timestamp: Timestamp.now(),
        metadata: {
          version: "1.0.0",
          userAgent: "Mozilla/5.0",
        },
      };

      expect(isEncryptedData(validData)).toBe(true);
    });

    it("should return false for null", () => {
      expect(isEncryptedData(null)).toBe(false);
    });

    it("should return false for undefined", () => {
      expect(isEncryptedData(undefined)).toBe(false);
    });

    it("should return false for non-object", () => {
      expect(isEncryptedData("string")).toBe(false);
      expect(isEncryptedData(123)).toBe(false);
      expect(isEncryptedData(true)).toBe(false);
    });

    it("should return false for object missing encryptedData", () => {
      const invalid = {
        timestamp: Timestamp.now(),
        metadata: { version: "1.0.0", userAgent: "test" },
      };

      expect(isEncryptedData(invalid)).toBe(false);
    });

    it("should return false for object missing timestamp", () => {
      const invalid = {
        encryptedData: "encrypted-string",
        metadata: { version: "1.0.0", userAgent: "test" },
      };

      expect(isEncryptedData(invalid)).toBe(false);
    });

    it("should return false for object missing metadata", () => {
      const invalid = {
        encryptedData: "encrypted-string",
        timestamp: Timestamp.now(),
      };

      expect(isEncryptedData(invalid)).toBe(false);
    });

    it("should return false when encryptedData is not a string", () => {
      const invalid = {
        encryptedData: 123,
        timestamp: Timestamp.now(),
        metadata: { version: "1.0.0", userAgent: "test" },
      };

      expect(isEncryptedData(invalid)).toBe(false);
    });

    it("should return true for valid EncryptedData with optional metadata fields", () => {
      const validData: EncryptedData = {
        encryptedData: "encrypted-string",
        timestamp: Timestamp.now(),
        metadata: {
          version: "1.0.0",
          userAgent: "test",
          userId: "user-123",
          userName: "Test User",
          operation: "save",
          checksum: "abc123",
        },
      };

      expect(isEncryptedData(validData)).toBe(true);
    });
  });

  describe("isSyncResult", () => {
    it("should return true for valid SyncResult with success true", () => {
      const validResult: SyncResult = {
        success: true,
        timestamp: Date.now(),
      };

      expect(isSyncResult(validResult)).toBe(true);
    });

    it("should return true for valid SyncResult with success false", () => {
      const validResult: SyncResult = {
        success: false,
        error: "Something went wrong",
      };

      expect(isSyncResult(validResult)).toBe(true);
    });

    it("should return true for SyncResult with all fields", () => {
      const validResult: SyncResult = {
        success: true,
        timestamp: Date.now(),
        error: undefined,
        metadata: {
          version: "1.0.0",
          userAgent: "test",
        },
      };

      expect(isSyncResult(validResult)).toBe(true);
    });

    it("should return false for null", () => {
      expect(isSyncResult(null)).toBe(false);
    });

    it("should return false for undefined", () => {
      expect(isSyncResult(undefined)).toBe(false);
    });

    it("should return false for non-object", () => {
      expect(isSyncResult("string")).toBe(false);
      expect(isSyncResult(123)).toBe(false);
      expect(isSyncResult(true)).toBe(false);
    });

    it("should return false for object missing success", () => {
      const invalid = {
        timestamp: Date.now(),
        error: "error",
      };

      expect(isSyncResult(invalid)).toBe(false);
    });

    it("should return false when success is not a boolean", () => {
      const invalid = {
        success: "true",
        timestamp: Date.now(),
      };

      expect(isSyncResult(invalid)).toBe(false);
    });
  });

  describe("isChunkData", () => {
    it("should return true for valid ChunkData", () => {
      const validChunk: ChunkData = {
        id: "chunk-1",
        data: "chunk-data-string",
        index: 0,
        total: 5,
        checksum: "checksum-abc",
        timestamp: Timestamp.now(),
      };

      expect(isChunkData(validChunk)).toBe(true);
    });

    it("should return false for null", () => {
      expect(isChunkData(null)).toBe(false);
    });

    it("should return false for undefined", () => {
      expect(isChunkData(undefined)).toBe(false);
    });

    it("should return false for non-object", () => {
      expect(isChunkData("string")).toBe(false);
      expect(isChunkData(123)).toBe(false);
    });

    it("should return false for object missing id", () => {
      const invalid = {
        data: "data",
        index: 0,
        total: 5,
        checksum: "checksum",
        timestamp: Timestamp.now(),
      };

      expect(isChunkData(invalid)).toBe(false);
    });

    it("should return false for object missing data", () => {
      const invalid = {
        id: "chunk-1",
        index: 0,
        total: 5,
        checksum: "checksum",
        timestamp: Timestamp.now(),
      };

      expect(isChunkData(invalid)).toBe(false);
    });

    it("should return false for object missing index", () => {
      const invalid = {
        id: "chunk-1",
        data: "data",
        total: 5,
        checksum: "checksum",
        timestamp: Timestamp.now(),
      };

      expect(isChunkData(invalid)).toBe(false);
    });

    it("should return false when id is not a string", () => {
      const invalid = {
        id: 123,
        data: "data",
        index: 0,
        total: 5,
        checksum: "checksum",
        timestamp: Timestamp.now(),
      };

      expect(isChunkData(invalid)).toBe(false);
    });

    it("should return false when data is not a string", () => {
      const invalid = {
        id: "chunk-1",
        data: 123,
        index: 0,
        total: 5,
        checksum: "checksum",
        timestamp: Timestamp.now(),
      };

      expect(isChunkData(invalid)).toBe(false);
    });

    it("should return false when index is not a number", () => {
      const invalid = {
        id: "chunk-1",
        data: "data",
        index: "0",
        total: 5,
        checksum: "checksum",
        timestamp: Timestamp.now(),
      };

      expect(isChunkData(invalid)).toBe(false);
    });
  });

  describe("isFirebaseError", () => {
    it("should return true for valid FirebaseError", () => {
      const validError: FirebaseError = {
        code: "firebase/network-error",
        message: "Network connection failed",
        category: "network",
        timestamp: Date.now(),
      };

      expect(isFirebaseError(validError)).toBe(true);
    });

    it("should return true for FirebaseError with context", () => {
      const validError: FirebaseError = {
        code: "firebase/validation-error",
        message: "Validation failed",
        category: "validation",
        timestamp: Date.now(),
        context: {
          field: "email",
          value: "invalid",
        },
      };

      expect(isFirebaseError(validError)).toBe(true);
    });

    it("should return false for null", () => {
      expect(isFirebaseError(null)).toBe(false);
    });

    it("should return false for undefined", () => {
      expect(isFirebaseError(undefined)).toBe(false);
    });

    it("should return false for non-object", () => {
      expect(isFirebaseError("error")).toBe(false);
      expect(isFirebaseError(123)).toBe(false);
    });

    it("should return false for object missing code", () => {
      const invalid = {
        message: "Error message",
        category: "network" as ErrorCategory,
        timestamp: Date.now(),
      };

      expect(isFirebaseError(invalid)).toBe(false);
    });

    it("should return false for object missing message", () => {
      const invalid = {
        code: "error-code",
        category: "network" as ErrorCategory,
        timestamp: Date.now(),
      };

      expect(isFirebaseError(invalid)).toBe(false);
    });

    it("should return false for object missing category", () => {
      const invalid = {
        code: "error-code",
        message: "Error message",
        timestamp: Date.now(),
      };

      expect(isFirebaseError(invalid)).toBe(false);
    });

    it("should return false when code is not a string", () => {
      const invalid = {
        code: 123,
        message: "Error message",
        category: "network" as ErrorCategory,
        timestamp: Date.now(),
      };

      expect(isFirebaseError(invalid)).toBe(false);
    });

    it("should return false when message is not a string", () => {
      const invalid = {
        code: "error-code",
        message: 123,
        category: "network" as ErrorCategory,
        timestamp: Date.now(),
      };

      expect(isFirebaseError(invalid)).toBe(false);
    });
  });

  describe("createTypedResponse", () => {
    it("should create a successful response with data", () => {
      const data = { id: "123", name: "Test" };
      const response = createTypedResponse(true, data);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(data);
      expect(response.error).toBeUndefined();
      expect(typeof response.timestamp).toBe("number");
      expect(response.timestamp).toBeGreaterThan(0);
    });

    it("should create a failed response with error", () => {
      const error: FirebaseError = {
        code: "test-error",
        message: "Test error message",
        category: "unknown",
        timestamp: Date.now(),
      };
      const response = createTypedResponse(false, undefined, error);

      expect(response.success).toBe(false);
      expect(response.data).toBeUndefined();
      expect(response.error).toEqual(error);
      expect(typeof response.timestamp).toBe("number");
    });

    it("should create response with both data and error", () => {
      const data = { partial: "data" };
      const error: FirebaseError = {
        code: "partial-error",
        message: "Partial failure",
        category: "validation",
        timestamp: Date.now(),
      };
      const response = createTypedResponse(false, data, error);

      expect(response.success).toBe(false);
      expect(response.data).toEqual(data);
      expect(response.error).toEqual(error);
    });

    it("should create response with null data", () => {
      const response = createTypedResponse(true, null);

      expect(response.success).toBe(true);
      expect(response.data).toBeNull();
      expect(response.error).toBeUndefined();
    });

    it("should create response with array data", () => {
      const data = [1, 2, 3];
      const response = createTypedResponse(true, data);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(data);
    });

    it("should create response with string data", () => {
      const data = "test string";
      const response = createTypedResponse(true, data);

      expect(response.success).toBe(true);
      expect(response.data).toBe(data);
    });

    it("should create response with number data", () => {
      const data = 42;
      const response = createTypedResponse(true, data);

      expect(response.success).toBe(true);
      expect(response.data).toBe(data);
    });

    it("should create response with boolean data", () => {
      const data = true;
      const response = createTypedResponse(true, data);

      expect(response.success).toBe(true);
      expect(response.data).toBe(data);
    });

    it("should generate different timestamps for sequential calls", () => {
      const response1 = createTypedResponse(true, "data1");
      const response2 = createTypedResponse(true, "data2");

      // Timestamps should be close but may be equal if executed quickly
      expect(response2.timestamp).toBeGreaterThanOrEqual(response1.timestamp);
    });
  });

  describe("categorizeFirebaseError", () => {
    describe("network errors", () => {
      it("should categorize network error", () => {
        const error = new Error("Network connection failed");
        expect(categorizeFirebaseError(error)).toBe("network");
      });

      it("should categorize timeout error", () => {
        const error = new Error("Request timeout occurred");
        expect(categorizeFirebaseError(error)).toBe("network");
      });

      it("should categorize connection error", () => {
        const error = new Error("Connection refused");
        expect(categorizeFirebaseError(error)).toBe("network");
      });

      it("should categorize fetch error", () => {
        const error = new Error("Fetch failed");
        expect(categorizeFirebaseError(error)).toBe("network");
      });

      it("should categorize CORS error", () => {
        const error = new Error("CORS policy blocked");
        expect(categorizeFirebaseError(error)).toBe("network");
      });
    });

    describe("encryption errors", () => {
      it("should categorize decrypt error", () => {
        const error = new Error("Failed to decrypt data");
        expect(categorizeFirebaseError(error)).toBe("encryption");
      });

      it("should categorize encrypt error", () => {
        const error = new Error("Encryption failed");
        expect(categorizeFirebaseError(error)).toBe("encryption");
      });

      it("should categorize cipher error", () => {
        const error = new Error("Invalid cipher");
        expect(categorizeFirebaseError(error)).toBe("encryption");
      });

      it("should categorize key derivation error", () => {
        const error = new Error("Key derivation failed");
        expect(categorizeFirebaseError(error)).toBe("encryption");
      });
    });

    describe("firebase errors", () => {
      it("should categorize firebase error", () => {
        const error = new Error("Firebase service error");
        expect(categorizeFirebaseError(error)).toBe("firebase");
      });

      it("should categorize firestore error", () => {
        const error = new Error("Firestore document not found");
        expect(categorizeFirebaseError(error)).toBe("firebase");
      });

      it("should categorize permission error", () => {
        const error = new Error("Permission denied");
        expect(categorizeFirebaseError(error)).toBe("firebase");
      });

      it("should categorize quota error", () => {
        const error = new Error("Quota exceeded");
        expect(categorizeFirebaseError(error)).toBe("firebase");
      });

      it("should categorize rate limit error", () => {
        const error = new Error("Rate limit exceeded");
        expect(categorizeFirebaseError(error)).toBe("firebase");
      });
    });

    describe("validation errors", () => {
      it("should categorize validation error", () => {
        const error = new Error("Validation failed");
        expect(categorizeFirebaseError(error)).toBe("validation");
      });

      it("should categorize invalid data error", () => {
        const error = new Error("Invalid data format");
        expect(categorizeFirebaseError(error)).toBe("validation");
      });

      it("should categorize checksum error", () => {
        const error = new Error("Checksum mismatch");
        expect(categorizeFirebaseError(error)).toBe("validation");
      });

      it("should categorize corrupt error", () => {
        const error = new Error("Data corrupt");
        expect(categorizeFirebaseError(error)).toBe("validation");
      });
    });

    describe("storage errors", () => {
      it("should categorize storage error", () => {
        const error = new Error("Storage full");
        expect(categorizeFirebaseError(error)).toBe("storage");
      });

      it("should categorize database error", () => {
        const error = new Error("Database error");
        expect(categorizeFirebaseError(error)).toBe("storage");
      });

      it("should categorize indexeddb error", () => {
        const error = new Error("IndexedDB operation failed");
        expect(categorizeFirebaseError(error)).toBe("storage");
      });
    });

    describe("authentication errors", () => {
      it("should categorize auth error", () => {
        const error = new Error("Authentication failed");
        expect(categorizeFirebaseError(error)).toBe("authentication");
      });

      it("should categorize unauthorized error", () => {
        const error = new Error("Unauthorized access");
        expect(categorizeFirebaseError(error)).toBe("authentication");
      });

      it("should categorize token error", () => {
        const error = new Error("Invalid token");
        expect(categorizeFirebaseError(error)).toBe("authentication");
      });

      it("should categorize credential error", () => {
        const error = new Error("Invalid credentials");
        expect(categorizeFirebaseError(error)).toBe("authentication");
      });
    });

    describe("unknown errors", () => {
      it("should return unknown for non-Error object", () => {
        expect(categorizeFirebaseError("string")).toBe("unknown");
        expect(categorizeFirebaseError(123)).toBe("unknown");
        expect(categorizeFirebaseError(null)).toBe("unknown");
        expect(categorizeFirebaseError(undefined)).toBe("unknown");
        expect(categorizeFirebaseError({})).toBe("unknown");
      });

      it("should return unknown for unrecognized error message", () => {
        const error = new Error("Some random error");
        expect(categorizeFirebaseError(error)).toBe("unknown");
      });

      it("should return unknown for empty error message", () => {
        const error = new Error("");
        expect(categorizeFirebaseError(error)).toBe("unknown");
      });
    });

    describe("case insensitivity", () => {
      it("should handle uppercase error messages", () => {
        const error = new Error("NETWORK ERROR");
        expect(categorizeFirebaseError(error)).toBe("network");
      });

      it("should handle mixed case error messages", () => {
        const error = new Error("Firebase Service Error");
        expect(categorizeFirebaseError(error)).toBe("firebase");
      });
    });

    describe("multiple keywords", () => {
      it("should prioritize network over other keywords", () => {
        const error = new Error("Network timeout in firebase");
        expect(categorizeFirebaseError(error)).toBe("network");
      });

      it("should prioritize encryption over firebase", () => {
        const error = new Error("Firebase encryption failed");
        expect(categorizeFirebaseError(error)).toBe("encryption");
      });
    });
  });
});
