/**
 * Privacy Audit Types - v2.1
 * Type definitions for analytics privacy dashboard and audit trail
 */

/**
 * Represents a single API call audit log entry
 */
export interface AuditLogEntry {
  /** Unique identifier (UUID) */
  id: string;
  /** Unix timestamp in milliseconds */
  timestamp: number;
  /** API endpoint path (e.g., "/api/analytics/heatmap-generator") */
  endpoint: string;
  /** HTTP method used */
  method: "GET" | "POST" | "PUT" | "DELETE";
  /** Size of encrypted payload in bytes */
  encryptedPayloadSize: number;
  /** Response time in milliseconds */
  responseTimeMs: number;
  /** Whether the API call succeeded */
  success: boolean;
  /** Whether the payload was encrypted */
  encrypted: boolean;
  /** Error message if the call failed */
  errorMessage?: string;
}

/**
 * Result of a connection test to the backend
 */
export interface ConnectionTestResult {
  /** Test result status */
  status: "success" | "error";
  /** Round-trip latency in milliseconds */
  latencyMs: number;
  /** Server region (from backend response) */
  region: string;
  /** Timestamp of the test */
  timestamp: number;
  /** Error details if test failed */
  errorDetails?: string;
}

/**
 * Represents encrypted payload data for inspection
 */
export interface EncryptedPayloadData {
  /** The original unencrypted data */
  originalData: unknown;
  /** Base64 encoded encrypted payload */
  encryptedData: string;
  /** Initialization vector (hex string) */
  iv: string;
  /** Authentication tag (hex string) */
  authTag: string;
  /** Time taken to encrypt in milliseconds */
  encryptionTime: number;
}
