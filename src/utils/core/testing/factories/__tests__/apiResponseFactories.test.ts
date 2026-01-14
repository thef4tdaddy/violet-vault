/**
 * API Response Factories Tests
 * Tests for API response factory functions
 */

import { describe, it, expect } from "vitest";
import {
  createAPISuccessResponse,
  createAPIErrorResponse,
  createEncryptedData,
  createFirebaseDocument,
  createFirebaseChunk,
  createFirebaseManifest,
  createFirebaseSyncStatus,
  createGitHubIssueResponse,
  createGitHubIssueErrorResponse,
  createScreenshotUploadResponse,
  createScreenshotUploadErrorResponse,
  createWebhookResponse,
  createWebhookErrorResponse,
  createFirebaseChunks,
} from "../apiResponseFactories";
import {
  validateAPISuccessResponse,
  validateAPIErrorResponse,
  validateEncryptedData,
  validateFirebaseDocument,
  validateGitHubIssueResponse,
} from "@/domain/schemas";

describe("API Response Factories", () => {
  describe("createAPISuccessResponse", () => {
    it("should create valid success response with defaults", () => {
      const response = createAPISuccessResponse();

      expect(() => validateAPISuccessResponse(response)).not.toThrow();
      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();
    });

    it("should create success response with custom data", () => {
      const customData = { userId: "123", name: "Test User" };
      const response = createAPISuccessResponse({ data: customData });

      expect(response.data).toEqual(customData);
    });

    it("should create success response with message", () => {
      const response = createAPISuccessResponse({ message: "Custom message" });

      expect(response.message).toBe("Custom message");
    });
  });

  describe("createAPIErrorResponse", () => {
    it("should create valid error response with defaults", () => {
      const response = createAPIErrorResponse();

      expect(() => validateAPIErrorResponse(response)).not.toThrow();
      expect(response.success).toBe(false);
      expect(response.error).toBeDefined();
    });

    it("should create error response with custom error", () => {
      const response = createAPIErrorResponse({ error: "Custom error message" });

      expect(response.error).toBe("Custom error message");
    });

    it("should create error response with code and details", () => {
      const response = createAPIErrorResponse({
        code: "AUTH_ERROR",
        details: { userId: "123" },
      });

      expect(response.code).toBe("AUTH_ERROR");
      expect(response.details).toEqual({ userId: "123" });
    });
  });

  describe("createEncryptedData", () => {
    it("should create valid encrypted data with defaults", () => {
      const encrypted = createEncryptedData();

      expect(() => validateEncryptedData(encrypted)).not.toThrow();
      expect(encrypted.data).toBeDefined();
      expect(encrypted.iv).toBeDefined();
      expect(encrypted.algorithm).toBe("AES-GCM");
    });

    it("should create encrypted data with custom algorithm", () => {
      const encrypted = createEncryptedData({ algorithm: "AES-256-CBC" });

      expect(encrypted.algorithm).toBe("AES-256-CBC");
    });
  });

  describe("createFirebaseDocument", () => {
    it("should create valid Firebase document with defaults", () => {
      const doc = createFirebaseDocument();

      expect(() => validateFirebaseDocument(doc)).not.toThrow();
      expect(doc.encryptedData).toBeDefined();
      expect(doc.timestamp).toBeDefined();
      expect(doc.metadata).toBeDefined();
    });

    it("should create Firebase document with custom metadata", () => {
      const doc = createFirebaseDocument({
        metadata: { version: "2.0.0", custom: "value" },
      });

      expect(doc.metadata?.version).toBe("2.0.0");
      expect(doc.metadata?.custom).toBe("value");
    });
  });

  describe("createFirebaseChunk", () => {
    it("should create valid Firebase chunk with defaults", () => {
      const chunk = createFirebaseChunk();

      expect(chunk.chunkIndex).toBe(0);
      expect(chunk.totalChunks).toBe(1);
      expect(chunk.data).toBeDefined();
    });

    it("should create Firebase chunk with custom index", () => {
      const chunk = createFirebaseChunk({
        chunkIndex: 2,
        totalChunks: 5,
      });

      expect(chunk.chunkIndex).toBe(2);
      expect(chunk.totalChunks).toBe(5);
    });
  });

  describe("createFirebaseManifest", () => {
    it("should create valid Firebase manifest with defaults", () => {
      const manifest = createFirebaseManifest();

      expect(manifest.totalChunks).toBe(1);
      expect(manifest.totalSize).toBeGreaterThan(0);
      expect(manifest.checksum).toBeDefined();
    });

    it("should create Firebase manifest with custom values", () => {
      const manifest = createFirebaseManifest({
        totalChunks: 10,
        totalSize: 50000,
      });

      expect(manifest.totalChunks).toBe(10);
      expect(manifest.totalSize).toBe(50000);
    });
  });

  describe("createFirebaseSyncStatus", () => {
    it("should create valid Firebase sync status with defaults", () => {
      const status = createFirebaseSyncStatus();

      expect(status.isOnline).toBe(true);
      expect(status.isInitialized).toBe(true);
      expect(status.queuedOperations).toBe(0);
      expect(status.activeUsers).toBe(1);
    });

    it("should create offline sync status", () => {
      const status = createFirebaseSyncStatus({
        isOnline: false,
        queuedOperations: 5,
      });

      expect(status.isOnline).toBe(false);
      expect(status.queuedOperations).toBe(5);
    });
  });

  describe("createGitHubIssueResponse", () => {
    it("should create valid GitHub success response", () => {
      const response = createGitHubIssueResponse();

      expect(() => validateGitHubIssueResponse(response)).not.toThrow();
      expect(response.success).toBe(true);
      expect(response.issueNumber).toBeDefined();
      expect(response.url).toBeDefined();
    });

    it("should create GitHub response with custom issue number", () => {
      const response = createGitHubIssueResponse({
        issueNumber: 42,
      });

      expect(response.issueNumber).toBe(42);
    });
  });

  describe("createGitHubIssueErrorResponse", () => {
    it("should create valid GitHub error response", () => {
      const response = createGitHubIssueErrorResponse();

      expect(() => validateGitHubIssueResponse(response)).not.toThrow();
      expect(response.success).toBe(false);
      expect(response.error).toBeDefined();
    });

    it("should create GitHub error response with custom error", () => {
      const response = createGitHubIssueErrorResponse({
        error: "Rate limit exceeded",
      });

      expect(response.error).toBe("Rate limit exceeded");
    });
  });

  describe("createScreenshotUploadResponse", () => {
    it("should create valid screenshot upload success response", () => {
      const response = createScreenshotUploadResponse();

      expect(response.success).toBe(true);
      expect(response.uploaded).toBe(true);
      expect(response.url).toBeDefined();
      expect(response.size).toBeGreaterThan(0);
    });

    it("should create screenshot upload response with custom URL", () => {
      const response = createScreenshotUploadResponse({
        url: "https://custom.cdn.com/image.jpg",
      });

      expect(response.url).toBe("https://custom.cdn.com/image.jpg");
    });
  });

  describe("createScreenshotUploadErrorResponse", () => {
    it("should create valid screenshot upload error response", () => {
      const response = createScreenshotUploadErrorResponse();

      expect(response.success).toBe(false);
      expect(response.uploaded).toBe(false);
      expect(response.error).toBeDefined();
    });

    it("should create screenshot upload error with reason", () => {
      const response = createScreenshotUploadErrorResponse({
        reason: "File too large",
      });

      expect(response.reason).toBe("File too large");
    });
  });

  describe("createWebhookResponse", () => {
    it("should create valid webhook success response", () => {
      const response = createWebhookResponse();

      expect(response.success).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.provider).toBe("webhook");
    });

    it("should create webhook response with custom status code", () => {
      const response = createWebhookResponse({ statusCode: 201 });

      expect(response.statusCode).toBe(201);
    });
  });

  describe("createWebhookErrorResponse", () => {
    it("should create valid webhook error response", () => {
      const response = createWebhookErrorResponse();

      expect(response.success).toBe(false);
      expect(response.statusCode).toBe(500);
      expect(response.error).toBeDefined();
    });

    it("should create webhook error with custom error", () => {
      const response = createWebhookErrorResponse({
        error: "Timeout",
        statusCode: 504,
      });

      expect(response.error).toBe("Timeout");
      expect(response.statusCode).toBe(504);
    });
  });

  describe("createFirebaseChunks", () => {
    it("should create array of chunks", () => {
      const chunks = createFirebaseChunks(5);

      expect(chunks).toHaveLength(5);
      chunks.forEach((chunk, index) => {
        expect(chunk.chunkIndex).toBe(index);
        expect(chunk.totalChunks).toBe(5);
      });
    });

    it("should create single chunk", () => {
      const chunks = createFirebaseChunks(1);

      expect(chunks).toHaveLength(1);
      expect(chunks[0].chunkIndex).toBe(0);
      expect(chunks[0].totalChunks).toBe(1);
    });
  });
});
