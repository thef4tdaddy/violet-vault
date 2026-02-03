/**
 * Paycheck History Service
 * Privacy-first local storage for paycheck history
 * Part of Issue #1837: Amount Entry Step
 *
 * Features:
 * - 100% client-side (localStorage only, never synced)
 * - Smart pre-fill based on employer history
 * - Autocomplete for recent employers
 * - Frequency detection (weekly, biweekly, monthly)
 * - LRU eviction (max 50 entries)
 */

import logger from "@/utils/core/common/logger";

/**
 * Paycheck History Entry
 * Tracks historical paycheck data for an employer
 */
export interface PaycheckHistoryEntry {
  payerName: string; // Employer name
  lastAmountCents: number; // Most recent paycheck amount
  lastDate: string; // ISO date of last paycheck
  totalCount: number; // Number of paychecks received
  averageAmountCents: number; // Rolling average
  frequency?: "weekly" | "biweekly" | "semi-monthly" | "monthly"; // Pay frequency
}

/**
 * Paycheck History Service
 * Manages local paycheck history in browser localStorage
 *
 * Privacy Guarantees:
 * - 100% client-side (never leaves browser)
 * - No server sync
 * - User-controllable (browser storage settings)
 * - Minimal data (name, amount, date, count, average)
 */
export class PaycheckHistoryService {
  private static STORAGE_KEY = "violet-vault-paycheck-history";
  private static MAX_ENTRIES = 50;

  /**
   * Get all history entries
   * @returns Array of history entries, sorted by last date (newest first)
   */
  static getHistory(): PaycheckHistoryEntry[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];

      const parsed = JSON.parse(stored) as PaycheckHistoryEntry[];

      // Sort by last date (newest first)
      return parsed.sort((a, b) => new Date(b.lastDate).getTime() - new Date(a.lastDate).getTime());
    } catch (error) {
      logger.error("Failed to get paycheck history", {
        reason: "parse_error",
        error: error instanceof Error ? error.message : String(error),
      });
      return [];
    }
  }

  /**
   * Get history for specific employer
   * Case-insensitive search
   *
   * @param name - Employer name to search for
   * @returns History entry if found, null otherwise
   */
  static getByPayerName(name: string): PaycheckHistoryEntry | null {
    if (!name || name.trim() === "") return null;

    const history = this.getHistory();
    const normalized = name.trim().toLowerCase();

    return history.find((entry) => entry.payerName.toLowerCase() === normalized) || null;
  }

  /**
   * Add or update paycheck entry
   * Updates existing entry or creates new one
   * Enforces max entries with LRU eviction
   *
   * @param entry - Paycheck data to add/update
   */
  static addOrUpdate(entry: { payerName: string; amountCents: number; date: string }): void {
    if (!entry.payerName || entry.payerName.trim() === "") {
      logger.warn("Cannot add paycheck history without payer name");
      return;
    }

    if (entry.amountCents <= 0) {
      logger.warn("Cannot add paycheck history with invalid amount", {
        amountCents: entry.amountCents,
      });
      return;
    }

    try {
      const history = this.getHistory();
      const normalized = entry.payerName.trim();
      const existingIndex = history.findIndex(
        (h) => h.payerName.toLowerCase() === normalized.toLowerCase()
      );

      if (existingIndex >= 0) {
        // Update existing entry
        const existing = history[existingIndex]!;
        const newCount = existing.totalCount + 1;
        const newAverage = Math.round(
          (existing.averageAmountCents * existing.totalCount + entry.amountCents) / newCount
        );

        history[existingIndex] = {
          payerName: normalized,
          lastAmountCents: entry.amountCents,
          lastDate: entry.date,
          totalCount: newCount,
          averageAmountCents: newAverage,
          frequency: this.detectFrequency(normalized) ?? undefined,
        };
      } else {
        // Add new entry
        history.push({
          payerName: normalized,
          lastAmountCents: entry.amountCents,
          lastDate: entry.date,
          totalCount: 1,
          averageAmountCents: entry.amountCents,
          frequency: undefined,
        });
      }

      // Enforce max entries (LRU eviction)
      if (history.length > this.MAX_ENTRIES) {
        // Sort by last date (oldest first) and remove oldest
        const sorted = history.sort(
          (a, b) => new Date(a.lastDate).getTime() - new Date(b.lastDate).getTime()
        );
        sorted.shift(); // Remove oldest
        this.saveHistory(sorted);
      } else {
        this.saveHistory(history);
      }

      logger.info("Updated paycheck history", {
        payerName: normalized,
        totalEntries: history.length,
      });
    } catch (error) {
      logger.error("Failed to add/update paycheck history", {
        reason: "save_error",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Get recent employer names for autocomplete
   * @param limit - Max number of names to return (default: 10)
   * @returns Array of employer names, sorted by recency
   */
  static getRecentPayers(limit = 10): string[] {
    const history = this.getHistory();
    return history.slice(0, limit).map((entry) => entry.payerName);
  }

  /**
   * Detect pay frequency from historical patterns
   * Analyzes all paychecks for this employer to detect pattern
   *
   * @param payerName - Employer name
   * @returns Detected frequency or null if not enough data
   */
  static detectFrequency(
    payerName: string
  ): "weekly" | "biweekly" | "semi-monthly" | "monthly" | null {
    const entry = this.getByPayerName(payerName);
    if (!entry || entry.totalCount < 2) {
      return null; // Need at least 2 paychecks to detect pattern
    }

    // TODO: Implement frequency detection algorithm
    // For now, return null (will be implemented in future iteration)
    // Algorithm: analyze gaps between paychecks to detect pattern
    // - Weekly: ~7 days
    // - Biweekly: ~14 days
    // - Semi-monthly: 1st/15th or 15th/last
    // - Monthly: ~30 days

    return null;
  }

  /**
   * Clear all history
   * Privacy feature - allows users to delete their data
   */
  static clear(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem(this.ALLOCATION_HISTORY_KEY);
      logger.info("Cleared paycheck history");
    } catch (error) {
      logger.error("Failed to clear paycheck history", {
        reason: "clear_error",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Save history to localStorage
   * Internal helper method
   */
  private static saveHistory(history: PaycheckHistoryEntry[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      logger.error("Failed to save paycheck history", {
        reason: "storage_error",
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  // ==================== ALLOCATION HISTORY ====================
  // Store full allocation history for comparison view

  private static ALLOCATION_HISTORY_KEY = "violet-vault-allocation-history";
  private static MAX_ALLOCATION_HISTORY = 20; // Keep last 20 paychecks

  /**
   * Save allocation history entry
   * @param entry - Allocation history entry with full allocation breakdown
   */
  static saveAllocationHistory(entry: {
    paycheckAmountCents: number;
    payerName?: string | null;
    allocations: ReadonlyArray<{ envelopeId: string; amountCents: number }>;
    strategy?: string | null;
  }): void {
    try {
      const history = this.getAllocationHistory();

      // Validate that allocations sum to paycheck amount
      const allocationTotal = entry.allocations.reduce((sum, a) => sum + a.amountCents, 0);
      if (allocationTotal !== entry.paycheckAmountCents) {
        logger.warn("Allocation total does not match paycheck amount", {
          paycheckAmount: entry.paycheckAmountCents,
          allocationTotal,
          difference: entry.paycheckAmountCents - allocationTotal,
        });
      }

      // Validate and filter strategy to known types
      let validatedStrategy: "even_split" | "last_split" | "target_first" | "manual" | undefined;
      if (
        entry.strategy &&
        ["even_split", "last_split", "target_first", "manual"].includes(entry.strategy)
      ) {
        validatedStrategy = entry.strategy as
          | "even_split"
          | "last_split"
          | "target_first"
          | "manual";
      } else if (entry.strategy) {
        logger.warn("Unrecognized allocation strategy, storing as undefined", {
          strategy: entry.strategy,
        });
      }

      const newEntry = {
        id: `alloc_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        date: new Date().toISOString(),
        paycheckAmountCents: entry.paycheckAmountCents,
        payerName: entry.payerName || undefined,
        allocations: entry.allocations.map((a) => ({
          envelopeId: a.envelopeId,
          amountCents: a.amountCents,
        })),
        strategy: validatedStrategy,
      };

      // Insert newest entry first and enforce max entries (keep most recent)
      const updatedHistory = [newEntry, ...history].slice(0, this.MAX_ALLOCATION_HISTORY);

      // NOTE: Allocation history is currently stored in plaintext in localStorage.
      // This is intentionally limited to client-side use only (never synced) and
      // functions as a convenience cache rather than a canonical financial record.
      // TODO: When integrating with the app-wide encrypted envelope budgeting
      // pipeline, migrate this to use the same client-side encryption/decryption
      // mechanism as other sensitive financial data before persisting.
      localStorage.setItem(this.ALLOCATION_HISTORY_KEY, JSON.stringify(updatedHistory));

      logger.info("Saved allocation history", {
        entryId: newEntry.id,
        totalEntries: updatedHistory.length,
      });
    } catch (error) {
      logger.error("Failed to save allocation history", {
        reason: "save_error",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Get all allocation history entries
   * @returns Array of allocation history entries, sorted by date (newest first)
   */
  static getAllocationHistory(): Array<{
    id: string;
    date: string;
    paycheckAmountCents: number;
    payerName?: string;
    allocations: Array<{ envelopeId: string; amountCents: number }>;
    strategy?: "even_split" | "last_split" | "target_first" | "manual";
  }> {
    try {
      const stored = localStorage.getItem(this.ALLOCATION_HISTORY_KEY);
      if (!stored) return [];

      const parsed = JSON.parse(stored) as Array<{
        id: string;
        date: string;
        paycheckAmountCents: number;
        payerName?: string;
        allocations: Array<{ envelopeId: string; amountCents: number }>;
        strategy?: "even_split" | "last_split" | "target_first" | "manual";
      }>;

      // Sort by date (newest first)
      return parsed.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
      logger.error("Failed to get allocation history", {
        reason: "parse_error",
        error: error instanceof Error ? error.message : String(error),
      });
      return [];
    }
  }

  /**
   * Get most recent allocation history entry
   * @returns Most recent entry or null
   */
  static getMostRecentAllocation(): {
    id: string;
    date: string;
    paycheckAmountCents: number;
    payerName?: string;
    allocations: Array<{ envelopeId: string; amountCents: number }>;
    strategy?: "even_split" | "last_split" | "target_first" | "manual";
  } | null {
    const history = this.getAllocationHistory();
    return history[0] || null;
  }

  /**
   * Get allocation history for specific payer
   * @param payerName - Payer name to filter by
   * @returns Array of allocation history entries for that payer
   */
  static getAllocationHistoryByPayer(payerName: string): Array<{
    id: string;
    date: string;
    paycheckAmountCents: number;
    payerName?: string;
    allocations: Array<{ envelopeId: string; amountCents: number }>;
    strategy?: "even_split" | "last_split" | "target_first" | "manual";
  }> {
    if (!payerName || payerName.trim() === "") return [];

    const history = this.getAllocationHistory();
    const normalized = payerName.trim().toLowerCase();

    return history.filter((entry) => entry.payerName?.toLowerCase() === normalized);
  }
}
