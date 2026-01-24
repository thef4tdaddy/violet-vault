// Database schema types for VioletVault Dexie tables
// These interfaces define the shape of data stored in IndexedDB via Dexie

import { z } from "zod";
import {
  EnvelopeSchema,
  StandardEnvelopeSchema,
  GoalEnvelopeSchema,
  LiabilityEnvelopeSchema,
  SupplementalAccountSchema,
} from "../domain/schemas/envelope";
import { TransactionSchema } from "../domain/schemas/transaction";

export interface BudgetRecord {
  id: string;
  lastModified: number;
  version?: number;
  // Additional properties for encrypted budget data
  [key: string]: unknown;
}

export type Envelope = z.infer<typeof EnvelopeSchema>;
export type StandardEnvelope = z.infer<typeof StandardEnvelopeSchema>;
export type GoalEnvelope = z.infer<typeof GoalEnvelopeSchema>;
export type LiabilityEnvelope = z.infer<typeof LiabilityEnvelopeSchema>;
export type SupplementalAccount = z.infer<typeof SupplementalAccountSchema>;
export type Transaction = z.infer<typeof TransactionSchema>;

// Aliases for transition to Unified Model
export type Bill = LiabilityEnvelope;
export type Debt = LiabilityEnvelope;
export type SavingsGoal = GoalEnvelope;
export type PaycheckHistory = Transaction;

// Deprecated interfaces removed in Version 11 - mapped to Envelope or Transaction

export interface AuditLogEntry {
  id?: number; // Auto-increment primary key
  timestamp: number;
  action: string;
  entityType: string;
  entityId: string;
  // Additional audit properties
  userId?: string;
  userName?: string;
  changes?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface CacheEntry {
  key: string;
  value: unknown;
  expiresAt: number | null;
  category: string;
  // Additional cache properties
  size?: number;
}

export interface BudgetCommit {
  hash: string;
  timestamp: number;
  message: string;
  author: string;
  parentHash?: string | null;
  deviceFingerprint?: string;
  // Additional commit properties for encrypted data
  encryptedSnapshot?: number[];
  iv?: number[];
  snapshotData?: string;
  changes?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface BudgetChange {
  id?: number; // Auto-increment primary key
  commitHash: string;
  entityType: string;
  entityId: string;
  changeType: "create" | "update" | "delete";
  description?: string;
  // Additional change properties
  oldValue?: unknown;
  newValue?: unknown;
  [key: string]: unknown;
}

export interface BudgetBranch {
  id?: number; // Auto-increment primary key
  name: string;
  description?: string;
  sourceCommitHash: string;
  headCommitHash: string;
  author: string;
  created: number;
  isActive: boolean;
  isMerged: boolean;
  // Additional branch properties
  mergedAt?: number;
  mergedBy?: string;
}

export interface BudgetTag {
  id?: number; // Auto-increment primary key
  name: string;
  description?: string;
  commitHash: string;
  tagType: "release" | "milestone" | "backup";
  author: string;
  created: number;
  // Additional tag properties
  version?: string;
}

export interface AutoBackup {
  id: string;
  timestamp: number;
  type: "manual" | "scheduled" | "sync_triggered";
  syncType?: "firebase" | "export" | "import";
  // Additional backup properties
  size?: number;
  checksum?: string;
  metadata?: Record<string, unknown>;
}

export interface Condition {
  id?: string;
  type: string;
  envelopeId?: string | null;
  value: number;
  operator?: string;
  startDate?: string | null;
  endDate?: string | null;
}

export interface AutoFundingRule {
  id: string;
  name: string;
  description: string;
  type: string;
  trigger: string;
  priority: number;
  enabled: boolean;
  createdAt: string;
  lastExecuted: string | null;
  executionCount: number;
  config: {
    sourceType: "unassigned" | "envelope" | "income";
    sourceId: string | null;
    targetType: "envelope" | "multiple";
    targetId: string | null;
    targetIds: string[];
    amount: number;
    percentage: number;
    conditions: Condition[];
    scheduleConfig: Record<string, unknown>;
  };
  lastModified: number;
}

export interface ExecutionRecord {
  id: string;
  trigger: string;
  totalFunded?: number;
  success?: boolean;
  executedAt?: string;
  rulesExecuted?: number;
  timestamp?: string; // Legacy/Alias support
  lastModified: number;
  [key: string]: unknown;
}

// Utility types for query operations
export type DateRange = {
  start: Date;
  end: Date;
};

export type BulkUpdate = {
  type: "envelope" | "transaction" | "autoFundingRule";
  data: unknown;
};

// Offline Request Queue Entry
export interface OfflineRequestQueueEntry {
  id?: number; // Auto-increment primary key
  requestId: string; // UUID for the request
  url: string; // Target API endpoint
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  headers: Record<string, string>;
  body?: string; // Stringified JSON body
  timestamp: number; // When the request was queued
  priority: "low" | "normal" | "high"; // Request priority
  retryCount: number; // Number of retry attempts
  maxRetries: number; // Maximum retry attempts before failure
  lastRetryAt?: number; // Timestamp of last retry attempt
  nextRetryAt?: number; // Timestamp for next retry (exponential backoff)
  status: "pending" | "processing" | "failed" | "completed";
  errorMessage?: string; // Last error message if failed
  entityType?: string; // Type of entity being modified (envelope, transaction, etc.)
  entityId?: string; // ID of entity being modified
  conflictResolution?: "local" | "remote" | "merge"; // Conflict resolution strategy
  metadata?: Record<string, unknown>; // Additional metadata
}

// Database statistics type
export interface DatabaseStats {
  envelopes: number;
  transactions: number;
  autoFundingRules: number;
  autoFundingHistory: number;
  cache: number;
  lastOptimized: number;
  offlineQueue?: number;
}

// Receipt interface for SentinelShare integration
export interface Receipt {
  id: string;
  merchant: string;
  amount: number;
  date: string; // ISO
  currency: string;
  receiptUrl?: string;
  transactionId?: string;
  status: "pending" | "matched" | "ignored";
  processingStatus?: string;
  imageData?: {
    url: string;
    [key: string]: unknown;
  };
  ocrData?: {
    rawText?: string;
    confidence?: number;
    items?: unknown[];
    tax?: number;
    subtotal?: number;
    processingTime?: number;
  };
  lastModified: number;
  userId?: string;
  [key: string]: unknown;
}
