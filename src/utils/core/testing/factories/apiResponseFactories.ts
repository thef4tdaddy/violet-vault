/**
 * API Response Test Factories
 * Factories for generating valid API response test data
 * Part of Phase 3: Test Schema Factories and Fixtures
 */

import type {
  APISuccessResponse,
  APIErrorResponse,
  EncryptedData,
  FirebaseDocument,
  FirebaseChunk,
  FirebaseManifest,
  FirebaseSyncStatus,
  GitHubIssueResponse,
  ScreenshotUploadResponse,
  WebhookResponse,
} from "@/domain/schemas";
import { generateTimestamp, generateText, mergeDefaults } from "./factoryUtils";

/**
 * API Success Response Factory
 * Creates a generic successful API response
 */
export const createAPISuccessResponse = <T = unknown>(
  overrides?: Partial<APISuccessResponse> & { data?: T }
): APISuccessResponse => {
  const defaults: APISuccessResponse = {
    success: true,
    data: { result: "success" },
    message: "Operation completed successfully",
    timestamp: generateTimestamp(),
  };

  return mergeDefaults(defaults, overrides);
};

/**
 * API Error Response Factory
 * Creates a generic error API response
 */
export const createAPIErrorResponse = (overrides?: Partial<APIErrorResponse>): APIErrorResponse => {
  const defaults: APIErrorResponse = {
    success: false,
    error: "Something went wrong",
    code: "ERROR_CODE",
    details: { reason: "Test error details" },
    timestamp: generateTimestamp(),
  };

  return mergeDefaults(defaults, overrides);
};

/**
 * Encrypted Data Factory
 * Creates encrypted data structure
 */
export const createEncryptedData = (overrides?: Partial<EncryptedData>): EncryptedData => {
  const defaults: EncryptedData = {
    data: generateText(64),
    iv: generateText(32),
    algorithm: "AES-GCM",
  };

  return mergeDefaults(defaults, overrides);
};

/**
 * Firebase Document Factory
 * Creates a Firebase document response
 */
export const createFirebaseDocument = (overrides?: Partial<FirebaseDocument>): FirebaseDocument => {
  const defaults: FirebaseDocument = {
    encryptedData: createEncryptedData(),
    timestamp: generateTimestamp(),
    metadata: {
      version: "1.0.0",
      userAgent: "Test User Agent",
    },
  };

  return mergeDefaults(defaults, overrides);
};

/**
 * Firebase Chunk Factory
 * Creates a Firebase chunk document
 */
export const createFirebaseChunk = (overrides?: Partial<FirebaseChunk>): FirebaseChunk => {
  const defaults: FirebaseChunk = {
    chunkIndex: 0,
    totalChunks: 1,
    data: generateText(100),
    checksum: generateText(32),
    timestamp: generateTimestamp(),
  };

  return mergeDefaults(defaults, overrides);
};

/**
 * Firebase Manifest Factory
 * Creates a Firebase manifest
 */
export const createFirebaseManifest = (overrides?: Partial<FirebaseManifest>): FirebaseManifest => {
  const defaults: FirebaseManifest = {
    totalChunks: 1,
    totalSize: 1024,
    checksum: generateText(32),
    lastModified: generateTimestamp(),
    metadata: {
      version: "1.0.0",
      compressed: false,
    },
  };

  return mergeDefaults(defaults, overrides);
};

/**
 * Firebase Sync Status Factory
 * Creates a Firebase sync status
 */
export const createFirebaseSyncStatus = (
  overrides?: Partial<FirebaseSyncStatus>
): FirebaseSyncStatus => {
  const defaults: FirebaseSyncStatus = {
    isOnline: true,
    isInitialized: true,
    queuedOperations: 0,
    lastSyncTimestamp: generateTimestamp(),
    activeUsers: 1,
  };

  return mergeDefaults(defaults, overrides);
};

/**
 * GitHub Issue Response Factory (Success)
 * Creates a successful GitHub issue response
 */
export const createGitHubIssueResponse = (
  overrides?: Partial<GitHubIssueResponse>
): GitHubIssueResponse => {
  const defaults: GitHubIssueResponse = {
    success: true,
    issueNumber: Math.floor(Math.random() * 10000),
    url: "https://github.com/test/repo/issues/123",
    provider: "github",
  };

  return mergeDefaults(defaults, overrides);
};

/**
 * GitHub Issue Response Factory (Error)
 * Creates an error GitHub issue response
 */
export const createGitHubIssueErrorResponse = (
  overrides?: Partial<GitHubIssueResponse>
): GitHubIssueResponse => {
  const defaults: GitHubIssueResponse = {
    success: false,
    error: "Failed to create GitHub issue",
    provider: "github",
  };

  return mergeDefaults(defaults, overrides);
};

/**
 * Screenshot Upload Response Factory (Success)
 * Creates a successful screenshot upload response
 */
export const createScreenshotUploadResponse = (
  overrides?: Partial<ScreenshotUploadResponse>
): ScreenshotUploadResponse => {
  const defaults: ScreenshotUploadResponse = {
    success: true,
    url: "https://cdn.example.com/screenshot.jpg",
    size: Math.floor(Math.random() * 500000) + 10000,
    uploaded: true,
  };

  return mergeDefaults(defaults, overrides);
};

/**
 * Screenshot Upload Response Factory (Error)
 * Creates an error screenshot upload response
 */
export const createScreenshotUploadErrorResponse = (
  overrides?: Partial<ScreenshotUploadResponse>
): ScreenshotUploadResponse => {
  const defaults: ScreenshotUploadResponse = {
    success: false,
    uploaded: false,
    error: "Failed to upload screenshot",
    reason: "Network error",
  };

  return mergeDefaults(defaults, overrides);
};

/**
 * Webhook Response Factory (Success)
 * Creates a successful webhook response
 */
export const createWebhookResponse = (overrides?: Partial<WebhookResponse>): WebhookResponse => {
  const defaults: WebhookResponse = {
    success: true,
    statusCode: 200,
    provider: "webhook",
    response: { message: "Webhook delivered successfully" },
  };

  return mergeDefaults(defaults, overrides);
};

/**
 * Webhook Response Factory (Error)
 * Creates an error webhook response
 */
export const createWebhookErrorResponse = (
  overrides?: Partial<WebhookResponse>
): WebhookResponse => {
  const defaults: WebhookResponse = {
    success: false,
    statusCode: 500,
    error: "Internal server error",
    provider: "webhook",
  };

  return mergeDefaults(defaults, overrides);
};

/**
 * Batch Firebase Chunk Factory
 * Creates an array of Firebase chunks for chunked upload testing
 */
export const createFirebaseChunks = (totalChunks: number): FirebaseChunk[] => {
  return Array.from({ length: totalChunks }, (_, index) =>
    createFirebaseChunk({
      chunkIndex: index,
      totalChunks,
    })
  );
};
