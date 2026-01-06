/**
 * Sync-related type definitions
 * Shared types for sync and data detection functionality
 */

export interface DataDetectionDetails {
  databaseOpen: boolean;
  samplesFound?: {
    envelopes: boolean;
    transactions: boolean;
    bills: boolean;
  };
  envelopes: number;
  transactions: number;
  bills: number;
  savingsGoals: number;
  paychecks: number;
  cache: number;
  lastOptimized: number;
  error?: unknown;
}

export interface DataDetectionResult {
  hasData: boolean;
  totalItems?: number;
  itemCount: number;
  dataTypes: string[];
  readyForCloudReset: boolean;
  details?: DataDetectionDetails;
  recommendation?: string;
  exception?: string;
}

export interface SafeCloudDataResetResult {
  success: boolean;
  error?: string;
  safetyAbort?: boolean;
  detectionDetails?: DataDetectionResult;
  message?: string;
  localDataConfirmed?: boolean;
  readyForCloudReset?: boolean;
  exception?: string;
}

/**
 * WebSocket Signaling Types
 * Privacy-preserving real-time sync notifications (SIGNALING ONLY)
 */

/**
 * Signal event types for real-time sync notifications
 * CRITICAL: These signals should NEVER contain decrypted data or encrypted blobs
 */
export type WebSocketSignalType =
  | "data_changed" // Signal that data has changed, trigger sync
  | "sync_required" // Explicit sync request signal
  | "ping" // Heartbeat signal
  | "pong" // Heartbeat response
  | "connected" // Connection established
  | "disconnected" // Connection closed
  | "error"; // Error signal

/**
 * WebSocket signal message structure
 * Contains only metadata and signal type - NO DATA
 */
export interface WebSocketSignalMessage {
  type: WebSocketSignalType;
  budgetId?: string;
  timestamp: number;
  metadata?: {
    deviceId?: string;
    userId?: string;
    version?: string;
  };
}

/**
 * WebSocket connection status
 */
export type WebSocketConnectionStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "error";

/**
 * WebSocket service configuration
 */
export interface WebSocketSignalingConfig {
  url: string;
  budgetId: string;
  reconnectInterval?: number;
  heartbeatInterval?: number;
  maxReconnectAttempts?: number;
}

/**
 * WebSocket service status
 */
export interface WebSocketServiceStatus {
  status: WebSocketConnectionStatus;
  isConnected: boolean;
  lastHeartbeat: number | null;
  reconnectAttempts: number;
  error: string | null;
}
