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
          frequency: this.detectFrequency(normalized),
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
  static detectFrequency(payerName: string): "weekly" | "biweekly" | "semi-monthly" | "monthly" | null {
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
}
