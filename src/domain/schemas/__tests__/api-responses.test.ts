/**
 * API Response Schemas Tests
 * Tests for Phase 2 API response validation schemas
 */

import { describe, it, expect } from "vitest";
import {
  APISuccessResponseSchema,
  APIErrorResponseSchema,
  APIResponseSchema,
  EncryptedDataSchema,
  FirebaseDocumentSchema,
  FirebaseChunkSchema,
  FirebaseManifestSchema,
  FirebaseSyncStatusSchema,
  GitHubIssueResponseSchema,
  ScreenshotUploadResponseSchema,
  WebhookResponseSchema,
  BugReportSubmissionResultSchema,
  BugReportFallbackSubmissionResultSchema,
  FirebaseAuthResponseSchema,
  SyncOperationResultSchema,
  ValidationResultSchema,
  validateAPISuccessResponse,
  validateAPIErrorResponse,
  validateEncryptedData,
  validateFirebaseDocument,
  validateGitHubIssueResponse,
} from "../api-responses";

describe("API Response Schemas", () => {
  describe("APISuccessResponseSchema", () => {
    it("should validate a basic success response", () => {
      const data = {
        success: true,
      };

      const result = APISuccessResponseSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should validate a success response with optional fields", () => {
      const data = {
        success: true,
        data: { id: "123", name: "Test" },
        message: "Operation completed",
        timestamp: Date.now(),
      };

      const result = APISuccessResponseSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject response with success: false", () => {
      const data = {
        success: false,
        error: "Something went wrong",
      };

      const result = APISuccessResponseSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe("APIErrorResponseSchema", () => {
    it("should validate a basic error response", () => {
      const data = {
        success: false,
        error: "Something went wrong",
      };

      const result = APIErrorResponseSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should validate an error response with optional fields", () => {
      const data = {
        success: false,
        error: "Database connection failed",
        code: "DB_ERROR",
        details: { retryable: true },
        timestamp: Date.now(),
      };

      const result = APIErrorResponseSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject error response with success: true", () => {
      const data = {
        success: true,
        error: "Something went wrong",
      };

      const result = APIErrorResponseSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe("APIResponseSchema", () => {
    it("should validate both success and error responses", () => {
      const successData = { success: true, data: "test" };
      const errorData = { success: false, error: "test error" };

      const successResult = APIResponseSchema.safeParse(successData);
      const errorResult = APIResponseSchema.safeParse(errorData);

      expect(successResult.success).toBe(true);
      expect(errorResult.success).toBe(true);
    });
  });

  describe("EncryptedDataSchema", () => {
    it("should validate encrypted data with string values", () => {
      const data = {
        data: "encrypted-string-data",
        iv: "initialization-vector",
      };

      const result = EncryptedDataSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.algorithm).toBe("AES-GCM");
      }
    });

    it("should validate encrypted data with Uint8Array values", () => {
      const data = {
        data: new Uint8Array([1, 2, 3, 4]),
        iv: new Uint8Array([5, 6, 7, 8]),
        algorithm: "AES-CBC",
      };

      const result = EncryptedDataSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.algorithm).toBe("AES-CBC");
      }
    });

    it("should validate encrypted data with number array values", () => {
      const data = {
        data: [1, 2, 3, 4],
        iv: [5, 6, 7, 8],
      };

      const result = EncryptedDataSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should use default algorithm if not specified", () => {
      const validated = validateEncryptedData({
        data: "test",
        iv: "test",
      });

      expect(validated.algorithm).toBe("AES-GCM");
    });
  });

  describe("FirebaseDocumentSchema", () => {
    it("should validate a Firebase document", () => {
      const data = {
        encryptedData: {
          data: "encrypted-data",
          iv: "initialization-vector",
        },
      };

      const result = FirebaseDocumentSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should validate a Firebase document with metadata", () => {
      const data = {
        encryptedData: {
          data: "encrypted-data",
          iv: "initialization-vector",
        },
        timestamp: Date.now(),
        metadata: {
          version: "1.0",
          userAgent: "Mozilla/5.0",
          customField: "custom-value",
        },
      };

      const result = FirebaseDocumentSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should accept null timestamp", () => {
      const data = {
        encryptedData: {
          data: "encrypted-data",
          iv: "initialization-vector",
        },
        timestamp: null,
      };

      const result = FirebaseDocumentSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject document without encryptedData", () => {
      const data = {
        timestamp: Date.now(),
      };

      const result = FirebaseDocumentSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe("FirebaseChunkSchema", () => {
    it("should validate a Firebase chunk", () => {
      const data = {
        chunkIndex: 0,
        totalChunks: 5,
        data: "chunk-data-string",
      };

      const result = FirebaseChunkSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should validate a chunk with optional fields", () => {
      const data = {
        chunkIndex: 2,
        totalChunks: 5,
        data: "chunk-data-string",
        checksum: "abc123",
        timestamp: Date.now(),
      };

      const result = FirebaseChunkSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject negative chunk index", () => {
      const data = {
        chunkIndex: -1,
        totalChunks: 5,
        data: "chunk-data-string",
      };

      const result = FirebaseChunkSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject zero totalChunks", () => {
      const data = {
        chunkIndex: 0,
        totalChunks: 0,
        data: "chunk-data-string",
      };

      const result = FirebaseChunkSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe("FirebaseManifestSchema", () => {
    it("should validate a Firebase manifest", () => {
      const data = {
        totalChunks: 5,
        totalSize: 1024000,
      };

      const result = FirebaseManifestSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should validate a manifest with optional fields", () => {
      const data = {
        totalChunks: 5,
        totalSize: 1024000,
        checksum: "abc123",
        lastModified: Date.now(),
      };

      const result = FirebaseManifestSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe("FirebaseSyncStatusSchema", () => {
    it("should validate sync status", () => {
      const data = {
        isOnline: true,
        isInitialized: true,
        queuedOperations: 3,
        lastSyncTimestamp: Date.now(),
        activeUsers: 2,
      };

      const result = FirebaseSyncStatusSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should accept null lastSyncTimestamp", () => {
      const data = {
        isOnline: false,
        isInitialized: false,
        queuedOperations: 0,
        lastSyncTimestamp: null,
        activeUsers: 0,
      };

      const result = FirebaseSyncStatusSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe("GitHubIssueResponseSchema", () => {
    it("should validate a successful GitHub response", () => {
      const data = {
        success: true,
        issueNumber: 123,
        url: "https://github.com/owner/repo/issues/123",
        provider: "github",
      };

      const result = GitHubIssueResponseSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should validate a failed GitHub response", () => {
      const data = {
        success: false,
        error: "API rate limit exceeded",
        provider: "github",
      };

      const result = GitHubIssueResponseSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject invalid URL", () => {
      const data = {
        success: true,
        issueNumber: 123,
        url: "not-a-valid-url",
      };

      const result = GitHubIssueResponseSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should use validation helper", () => {
      const data = {
        success: true,
        issueNumber: 456,
        url: "https://github.com/test/test/issues/456",
      };

      const validated = validateGitHubIssueResponse(data);
      expect(validated.issueNumber).toBe(456);
    });
  });

  describe("ScreenshotUploadResponseSchema", () => {
    it("should validate a successful upload", () => {
      const data = {
        success: true,
        url: "https://storage.example.com/screenshot.png",
        size: 102400,
        uploaded: true,
      };

      const result = ScreenshotUploadResponseSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should validate a failed upload", () => {
      const data = {
        success: false,
        error: "Upload failed",
        uploaded: false,
        reason: "File too large",
      };

      const result = ScreenshotUploadResponseSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe("WebhookResponseSchema", () => {
    it("should validate a webhook response", () => {
      const data = {
        success: true,
        statusCode: 200,
        provider: "webhook",
        response: { id: "123", status: "received" },
      };

      const result = WebhookResponseSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe("BugReportSubmissionResultSchema", () => {
    it("should validate a successful submission", () => {
      const data = {
        success: true,
        issueNumber: 789,
        url: "https://github.com/test/test/issues/789",
        provider: "github",
        screenshotStatus: {
          captured: true,
          size: 51200,
          uploaded: true,
        },
      };

      const result = BugReportSubmissionResultSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should validate a failed submission with validation errors", () => {
      const data = {
        success: false,
        error: "Validation failed",
        validationErrors: ["Title is required", "Description is too long"],
      };

      const result = BugReportSubmissionResultSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe("BugReportFallbackSubmissionResultSchema", () => {
    it("should validate a fallback submission result", () => {
      const data = {
        success: true,
        overallSuccess: true,
        attempts: 2,
        results: [{ success: false }, { success: true }],
        submissionId: "sub-123",
        primaryProvider: "github",
        screenshotStatus: {
          captured: true,
          size: 25600,
          uploaded: true,
        },
      };

      const result = BugReportFallbackSubmissionResultSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe("FirebaseAuthResponseSchema", () => {
    it("should validate a successful auth response", () => {
      const data = {
        user: {
          uid: "user-123",
          email: "test@example.com",
          isAnonymous: false,
          displayName: "Test User",
        },
      };

      const result = FirebaseAuthResponseSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should validate an anonymous auth response", () => {
      const data = {
        user: {
          uid: "anon-456",
          email: null,
          isAnonymous: true,
        },
      };

      const result = FirebaseAuthResponseSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should validate a failed auth response", () => {
      const data = {
        user: null,
        error: "Authentication failed",
      };

      const result = FirebaseAuthResponseSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe("SyncOperationResultSchema", () => {
    it("should validate a successful sync operation", () => {
      const data = {
        success: true,
        operation: "save",
        bytesTransferred: 10240,
        timestamp: Date.now(),
      };

      const result = SyncOperationResultSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should validate a chunked sync operation", () => {
      const data = {
        success: true,
        operation: "chunk",
        bytesTransferred: 102400,
        chunksProcessed: 5,
        timestamp: Date.now(),
      };

      const result = SyncOperationResultSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should validate a failed sync operation", () => {
      const data = {
        success: false,
        operation: "load",
        error: "Network timeout",
      };

      const result = SyncOperationResultSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject invalid operation type", () => {
      const data = {
        success: true,
        operation: "invalid-operation",
      };

      const result = SyncOperationResultSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe("ValidationResultSchema", () => {
    it("should validate a validation result", () => {
      const data = {
        isValid: true,
        errors: [],
        warnings: ["Title is recommended"],
        provider: "github",
      };

      const result = ValidationResultSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should validate an invalid result with errors", () => {
      const data = {
        isValid: false,
        errors: ["Field 'name' is required", "Invalid email format"],
        warnings: [],
      };

      const result = ValidationResultSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe("Validation helpers", () => {
    it("should throw on invalid data using validate functions", () => {
      const invalidData = {
        success: "not-a-boolean",
      };

      expect(() => validateAPISuccessResponse(invalidData)).toThrow();
    });

    it("should return error result using safe validate functions", () => {
      const invalidData = {
        success: false,
        // missing required 'error' field
      };

      // This should throw when using the non-safe version
      expect(() => validateAPIErrorResponse(invalidData)).toThrow();
    });
  });
});
