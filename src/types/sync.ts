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
