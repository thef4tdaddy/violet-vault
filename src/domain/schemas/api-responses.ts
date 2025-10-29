/**
 * API Response Validation Schemas (Phase 2)
 * Runtime validation for external API responses
 * Ensures type safety for data received from Firebase, GitHub, and other external services
 */

import { z } from "zod";

/**
 * Generic API Success Response Schema
 * Base schema for successful API responses
 */
export const APISuccessResponseSchema = z.object({
  success: z.literal(true),
  data: z.unknown().optional(),
  message: z.string().optional(),
  timestamp: z.number().optional(),
});

/**
 * Generic API Error Response Schema
 * Base schema for error responses from any API
 */
export const APIErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  code: z.string().optional(),
  details: z.unknown().optional(),
  timestamp: z.number().optional(),
});

/**
 * Generic API Response Union
 * Handles both success and error responses
 */
export const APIResponseSchema = z.union([APISuccessResponseSchema, APIErrorResponseSchema]);

/**
 * Type inference for API responses
 */
export type APISuccessResponse = z.infer<typeof APISuccessResponseSchema>;
export type APIErrorResponse = z.infer<typeof APIErrorResponseSchema>;
export type APIResponse = z.infer<typeof APIResponseSchema>;

/**
 * Encrypted Data Response Schema
 * Validates encrypted data structure from Firebase or other sources
 */
export const EncryptedDataSchema = z.object({
  data: z.union([z.string(), z.instanceof(Uint8Array), z.array(z.number())]),
  iv: z.union([z.string(), z.instanceof(Uint8Array), z.array(z.number())]),
  algorithm: z.string().optional().default("AES-GCM"),
});

export type EncryptedData = z.infer<typeof EncryptedDataSchema>;

/**
 * Firebase Document Response Schema
 * Validates structure of Firebase document data
 */
export const FirebaseDocumentSchema = z.object({
  encryptedData: EncryptedDataSchema,
  timestamp: z.union([z.number(), z.string(), z.null()]).optional(),
  metadata: z
    .object({
      version: z.string().optional(),
      userAgent: z.string().optional(),
    })
    .catchall(z.unknown())
    .optional(),
});

export type FirebaseDocument = z.infer<typeof FirebaseDocumentSchema>;

/**
 * Firebase Chunk Document Schema
 * Validates structure of chunked Firebase data
 */
export const FirebaseChunkSchema = z.object({
  chunkIndex: z.number().int().nonnegative(),
  totalChunks: z.number().int().positive(),
  data: z.string(),
  checksum: z.string().optional(),
  timestamp: z.union([z.number(), z.string(), z.null()]).optional(),
});

export type FirebaseChunk = z.infer<typeof FirebaseChunkSchema>;

/**
 * Firebase Manifest Schema
 * Validates manifest structure for chunked data
 */
export const FirebaseManifestSchema = z.object({
  totalChunks: z.number().int().positive(),
  totalSize: z.number().int().nonnegative(),
  checksum: z.string().optional(),
  lastModified: z.number().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type FirebaseManifest = z.infer<typeof FirebaseManifestSchema>;

/**
 * Firebase Sync Status Schema
 * Validates sync operation status
 */
export const FirebaseSyncStatusSchema = z.object({
  isOnline: z.boolean(),
  isInitialized: z.boolean(),
  queuedOperations: z.number().int().nonnegative(),
  lastSyncTimestamp: z.number().nullable(),
  activeUsers: z.number().int().nonnegative(),
});

export type FirebaseSyncStatus = z.infer<typeof FirebaseSyncStatusSchema>;

/**
 * GitHub API Issue Response Schema
 * Validates GitHub Issues API responses
 */
export const GitHubIssueResponseSchema = z.object({
  success: z.boolean(),
  issueNumber: z.number().int().positive().optional(),
  url: z.string().url().optional(),
  error: z.string().optional(),
  provider: z.literal("github").optional(),
});

export type GitHubIssueResponse = z.infer<typeof GitHubIssueResponseSchema>;

/**
 * Screenshot Upload Response Schema
 * Validates screenshot upload API responses (e.g., Cloudflare R2)
 */
export const ScreenshotUploadResponseSchema = z.object({
  success: z.boolean(),
  url: z.string().url().optional(),
  size: z.number().int().nonnegative().optional(),
  error: z.string().optional(),
  uploaded: z.boolean().optional(),
  reason: z.string().optional(),
});

export type ScreenshotUploadResponse = z.infer<typeof ScreenshotUploadResponseSchema>;

/**
 * Webhook Response Schema
 * Validates webhook submission responses
 */
export const WebhookResponseSchema = z.object({
  success: z.boolean(),
  statusCode: z.number().int().optional(),
  error: z.string().optional(),
  provider: z.literal("webhook").optional(),
  response: z.unknown().optional(),
});

export type WebhookResponse = z.infer<typeof WebhookResponseSchema>;

/**
 * Bug Report Submission Result Schema
 * Validates bug report submission results
 */
export const BugReportSubmissionResultSchema = z.object({
  success: z.boolean(),
  error: z.string().optional(),
  validationErrors: z.array(z.string()).optional(),
  issueNumber: z.number().int().positive().optional(),
  url: z.string().url().optional(),
  provider: z.string().optional(),
  screenshotStatus: z
    .object({
      captured: z.boolean(),
      size: z.number().int().nonnegative(),
      uploaded: z.boolean(),
      reason: z.string().optional(),
    })
    .optional(),
});

export type BugReportSubmissionResult = z.infer<typeof BugReportSubmissionResultSchema>;

/**
 * Bug Report Fallback Submission Result Schema
 * Validates multi-provider fallback submission results
 */
export const BugReportFallbackSubmissionResultSchema = z.object({
  success: z.boolean(),
  overallSuccess: z.boolean(),
  error: z.string().optional(),
  validationErrors: z.array(z.string()).optional(),
  attempts: z.number().int().nonnegative(),
  results: z.array(z.unknown()),
  submissionId: z.string().optional(),
  primaryProvider: z.string().optional(),
  screenshotStatus: z
    .object({
      captured: z.boolean(),
      size: z.number().int().nonnegative(),
      uploaded: z.boolean(),
      reason: z.string().optional(),
    })
    .optional(),
});

export type BugReportFallbackSubmissionResult = z.infer<
  typeof BugReportFallbackSubmissionResultSchema
>;

/**
 * Firebase Auth Response Schema
 * Validates Firebase authentication responses
 */
export const FirebaseAuthResponseSchema = z.object({
  user: z
    .object({
      uid: z.string(),
      email: z.string().email().nullable().optional(),
      isAnonymous: z.boolean().optional(),
      displayName: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
  error: z.string().optional(),
});

export type FirebaseAuthResponse = z.infer<typeof FirebaseAuthResponseSchema>;

/**
 * Sync Operation Result Schema
 * Validates sync operation results
 */
export const SyncOperationResultSchema = z.object({
  success: z.boolean(),
  operation: z.enum(["save", "load", "realtime", "chunk"]),
  error: z.string().optional(),
  bytesTransferred: z.number().int().nonnegative().optional(),
  chunksProcessed: z.number().int().nonnegative().optional(),
  timestamp: z.number().optional(),
});

export type SyncOperationResult = z.infer<typeof SyncOperationResultSchema>;

/**
 * Validation Result Schema
 * Validates validation operation results
 */
export const ValidationResultSchema = z.object({
  isValid: z.boolean(),
  errors: z.array(z.string()),
  warnings: z.array(z.string()),
  provider: z.string().optional(),
});

export type ValidationResult = z.infer<typeof ValidationResultSchema>;

/**
 * Validation helpers for API responses
 */

/**
 * Validate API success response
 */
export const validateAPISuccessResponse = (data: unknown): APISuccessResponse => {
  return APISuccessResponseSchema.parse(data);
};

/**
 * Safe validation for API success response
 */
export const validateAPISuccessResponseSafe = (data: unknown) => {
  return APISuccessResponseSchema.safeParse(data);
};

/**
 * Validate API error response
 */
export const validateAPIErrorResponse = (data: unknown): APIErrorResponse => {
  return APIErrorResponseSchema.parse(data);
};

/**
 * Safe validation for API error response
 */
export const validateAPIErrorResponseSafe = (data: unknown) => {
  return APIErrorResponseSchema.safeParse(data);
};

/**
 * Validate generic API response
 */
export const validateAPIResponse = (data: unknown): APIResponse => {
  return APIResponseSchema.parse(data);
};

/**
 * Safe validation for generic API response
 */
export const validateAPIResponseSafe = (data: unknown) => {
  return APIResponseSchema.safeParse(data);
};

/**
 * Validate encrypted data
 */
export const validateEncryptedData = (data: unknown): EncryptedData => {
  return EncryptedDataSchema.parse(data);
};

/**
 * Safe validation for encrypted data
 */
export const validateEncryptedDataSafe = (data: unknown) => {
  return EncryptedDataSchema.safeParse(data);
};

/**
 * Validate Firebase document
 */
export const validateFirebaseDocument = (data: unknown): FirebaseDocument => {
  return FirebaseDocumentSchema.parse(data);
};

/**
 * Safe validation for Firebase document
 */
export const validateFirebaseDocumentSafe = (data: unknown) => {
  return FirebaseDocumentSchema.safeParse(data);
};

/**
 * Validate Firebase chunk
 */
export const validateFirebaseChunk = (data: unknown): FirebaseChunk => {
  return FirebaseChunkSchema.parse(data);
};

/**
 * Safe validation for Firebase chunk
 */
export const validateFirebaseChunkSafe = (data: unknown) => {
  return FirebaseChunkSchema.safeParse(data);
};

/**
 * Validate Firebase manifest
 */
export const validateFirebaseManifest = (data: unknown): FirebaseManifest => {
  return FirebaseManifestSchema.parse(data);
};

/**
 * Safe validation for Firebase manifest
 */
export const validateFirebaseManifestSafe = (data: unknown) => {
  return FirebaseManifestSchema.safeParse(data);
};

/**
 * Validate Firebase sync status
 */
export const validateFirebaseSyncStatus = (data: unknown): FirebaseSyncStatus => {
  return FirebaseSyncStatusSchema.parse(data);
};

/**
 * Safe validation for Firebase sync status
 */
export const validateFirebaseSyncStatusSafe = (data: unknown) => {
  return FirebaseSyncStatusSchema.safeParse(data);
};

/**
 * Validate GitHub issue response
 */
export const validateGitHubIssueResponse = (data: unknown): GitHubIssueResponse => {
  return GitHubIssueResponseSchema.parse(data);
};

/**
 * Safe validation for GitHub issue response
 */
export const validateGitHubIssueResponseSafe = (data: unknown) => {
  return GitHubIssueResponseSchema.safeParse(data);
};

/**
 * Validate screenshot upload response
 */
export const validateScreenshotUploadResponse = (data: unknown): ScreenshotUploadResponse => {
  return ScreenshotUploadResponseSchema.parse(data);
};

/**
 * Safe validation for screenshot upload response
 */
export const validateScreenshotUploadResponseSafe = (data: unknown) => {
  return ScreenshotUploadResponseSchema.safeParse(data);
};

/**
 * Validate webhook response
 */
export const validateWebhookResponse = (data: unknown): WebhookResponse => {
  return WebhookResponseSchema.parse(data);
};

/**
 * Safe validation for webhook response
 */
export const validateWebhookResponseSafe = (data: unknown) => {
  return WebhookResponseSchema.safeParse(data);
};

/**
 * Validate bug report submission result
 */
export const validateBugReportSubmissionResult = (data: unknown): BugReportSubmissionResult => {
  return BugReportSubmissionResultSchema.parse(data);
};

/**
 * Safe validation for bug report submission result
 */
export const validateBugReportSubmissionResultSafe = (data: unknown) => {
  return BugReportSubmissionResultSchema.safeParse(data);
};

/**
 * Validate bug report fallback submission result
 */
export const validateBugReportFallbackSubmissionResult = (
  data: unknown
): BugReportFallbackSubmissionResult => {
  return BugReportFallbackSubmissionResultSchema.parse(data);
};

/**
 * Safe validation for bug report fallback submission result
 */
export const validateBugReportFallbackSubmissionResultSafe = (data: unknown) => {
  return BugReportFallbackSubmissionResultSchema.safeParse(data);
};

/**
 * Validate Firebase auth response
 */
export const validateFirebaseAuthResponse = (data: unknown): FirebaseAuthResponse => {
  return FirebaseAuthResponseSchema.parse(data);
};

/**
 * Safe validation for Firebase auth response
 */
export const validateFirebaseAuthResponseSafe = (data: unknown) => {
  return FirebaseAuthResponseSchema.safeParse(data);
};

/**
 * Validate sync operation result
 */
export const validateSyncOperationResult = (data: unknown): SyncOperationResult => {
  return SyncOperationResultSchema.parse(data);
};

/**
 * Safe validation for sync operation result
 */
export const validateSyncOperationResultSafe = (data: unknown) => {
  return SyncOperationResultSchema.safeParse(data);
};

/**
 * Validate validation result
 */
export const validateValidationResult = (data: unknown): ValidationResult => {
  return ValidationResultSchema.parse(data);
};

/**
 * Safe validation for validation result
 */
export const validateValidationResultSafe = (data: unknown) => {
  return ValidationResultSchema.safeParse(data);
};
