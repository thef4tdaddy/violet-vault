/**
 * Type definitions for AutoFunding hooks
 * Defines return types for all autofunding-related hooks
 */

import type {
  AutoFundingRule,
  RuleStatistics,
  RuleSummary,
} from "@/utils/budgeting/autofunding/rules";
import type { Transaction, Envelope } from "@/types/finance";

// Re-export commonly used types from rules.ts for convenience
export type { AutoFundingRule, RuleStatistics, RuleSummary };

/**
 * Execution result types
 */
export interface RuleExecutionResult {
  ruleId: string;
  success: boolean;
  amountMoved: number;
  error?: string;
  [key: string]: unknown;
}

export interface ExecutionDetails {
  id: string;
  executedAt: string;
  timestamp?: string; // Alias for executedAt for compatibility with ExecutionHistoryEntry
  trigger: string;
  rulesExecuted: number;
  totalFunded: number;
  [key: string]: unknown;
}

export interface ExecutionResult {
  success: boolean;
  execution: ExecutionDetails;
  results: RuleExecutionResult[];
  error?: string;
}

/**
 * History types
 */
export interface ExecutionHistoryEntry {
  id: string;
  timestamp: string;
  executedAt?: string; // Alias for timestamp for compatibility with ExecutionDetails
  trigger: string;
  rulesExecuted: number;
  totalFunded: number;
  [key: string]: unknown;
}

export interface UndoStackEntry {
  action: string;
  timestamp: string;
  canUndo?: boolean;
  [key: string]: unknown;
}

export interface ExecutionStatistics {
  totalExecutions: number;
  totalFunded: number;
  [key: string]: unknown;
}

/**
 * Data types
 */
export interface AutoFundingData {
  rules?: AutoFundingRule[];
  executionHistory?: ExecutionHistoryEntry[];
  undoStack?: UndoStackEntry[];
  lastSaved?: string;
  version?: string;
  settings?: {
    autoSave?: boolean;
    autoBackup?: boolean;
    maxHistoryEntries?: number;
    maxUndoEntries?: number;
  };
  createdAt?: string;
  [key: string]: unknown;
}

/**
 * Budget context type
 */
export interface BudgetContext {
  unassignedCash?: number;
  envelopes?: Envelope[];
  allTransactions?: Transaction[];
  [key: string]: unknown;
}

/**
 * Hook return types
 */
export interface UseAutoFundingRulesReturn {
  rules: AutoFundingRule[];
  addRule: (rule: Partial<AutoFundingRule>) => void;
  updateRule: (ruleId: string, updates: Partial<AutoFundingRule>) => void;
  deleteRule: (ruleId: string) => void;
  toggleRule: (ruleId: string) => void;
  duplicateRule: (ruleId: string) => void;
  getFilteredRules: (filters: Record<string, unknown>) => AutoFundingRule[];
  getExecutableRules: (context: Record<string, unknown>) => AutoFundingRule[];
  getRuleById: (ruleId: string) => AutoFundingRule | undefined;
  getRulesByType: (type: string) => AutoFundingRule[];
  getRulesByTrigger: (trigger: string) => AutoFundingRule[];
  getRuleSummaries: () => RuleSummary[];
  validateAllRules: () => boolean;
  reorderRules: (newOrder: AutoFundingRule[]) => void;
  getRulesStatistics: () => RuleStatistics;
  bulkUpdateRules: (updates: Array<{ id: string; updates: Partial<AutoFundingRule> }>) => void;
  bulkDeleteRules: (ruleIds: string[]) => void;
  bulkToggleRules: (ruleIds: string[], enabled: boolean) => void;
  resetRules: () => void;
  setAllRules: (rules: AutoFundingRule[]) => void;
}

export interface UseAutoFundingHistoryReturn {
  executionHistory: ExecutionHistoryEntry[];
  undoStack: UndoStackEntry[];
  addToHistory: (execution: ExecutionHistoryEntry) => void;
  addToUndoStack: (execution: ExecutionDetails, results: RuleExecutionResult[]) => void;
  getHistory: (filters?: Record<string, unknown>) => ExecutionHistoryEntry[];
  getExecutionById: (executionId: string) => ExecutionHistoryEntry | undefined;
  clearHistory: () => void;
  cleanup: (maxHistoryAge?: number, maxUndoAge?: number) => void;
  getUndoableExecutions: () => UndoStackEntry[];
  getUndoStatistics: () => Record<string, unknown>;
  undoLastExecution: () => Promise<boolean>;
  undoExecution: (executionId: string) => Promise<boolean>;
  getExecutionStatistics: () => ExecutionStatistics;
  exportHistory: (options?: Record<string, unknown>) => Record<string, unknown>;
}

export interface UseAutoFundingDataReturn {
  isInitialized: boolean;
  isLoading: boolean;
  lastSaved: string | null;
  hasUnsavedChanges: boolean;
  initialize: () => Promise<AutoFundingData | null>;
  saveData: (data: AutoFundingData) => void;
  loadData: () => AutoFundingData | null;
  clearData: () => AutoFundingData;
  resetToDefaults: () => AutoFundingData;
  exportData: (data: AutoFundingData) => AutoFundingData;
  importData: (importData: AutoFundingData) => AutoFundingData;
  checkStorageHealth: () => Record<string, unknown>;
  createBackup: (data: AutoFundingData, includeHistory?: boolean) => Record<string, unknown>;
  markUnsavedChanges: () => void;
  enableAutoSave: (data: AutoFundingData, intervalMs?: number) => () => void;
}

export interface UseAutoFundingExecutionReturn {
  isExecuting: boolean;
  lastExecution: ExecutionDetails | null;
  executeRules: (
    rules: AutoFundingRule[],
    trigger?: string,
    triggerData?: Record<string, unknown>
  ) => Promise<ExecutionResult>;
  executeSingleRule: (
    rule: AutoFundingRule,
    context: Record<string, unknown>
  ) => Promise<RuleExecutionResult>;
  simulateExecution: (
    rules: AutoFundingRule[],
    context: Record<string, unknown>
  ) => Record<string, unknown>;
  createPlan: (
    rules: AutoFundingRule[],
    context: Record<string, unknown>
  ) => Record<string, unknown>;
  validatePlannedTransfers: (plan: Record<string, unknown>) => boolean;
  calculateImpact: (
    rules: AutoFundingRule[],
    context: Record<string, unknown>
  ) => Record<string, unknown>;
  canExecuteRules: (rules: AutoFundingRule[]) => boolean;
  getExecutionSummary: () => Record<string, unknown>;
}
