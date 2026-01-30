/**
 * Paycheck History Service Tests
 * Part of Issue #1837: Amount Entry Step
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { PaycheckHistoryService, type PaycheckHistoryEntry } from "../paycheckHistory";

describe("PaycheckHistoryService", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe("getHistory", () => {
    it("should return empty array when no history exists", () => {
      const history = PaycheckHistoryService.getHistory();
      expect(history).toEqual([]);
    });

    it("should return sorted history (newest first)", () => {
      const entries: PaycheckHistoryEntry[] = [
        {
          payerName: "Acme Corp",
          lastAmountCents: 250000,
          lastDate: "2026-01-15",
          totalCount: 1,
          averageAmountCents: 250000,
        },
        {
          payerName: "TechCo Inc",
          lastAmountCents: 300000,
          lastDate: "2026-01-20",
          totalCount: 1,
          averageAmountCents: 300000,
        },
      ];

      localStorage.setItem("violet-vault-paycheck-history", JSON.stringify(entries));

      const history = PaycheckHistoryService.getHistory();
      expect(history).toHaveLength(2);
      expect(history[0]?.payerName).toBe("TechCo Inc"); // Newest first
      expect(history[1]?.payerName).toBe("Acme Corp");
    });

    it("should handle malformed JSON gracefully", () => {
      localStorage.setItem("violet-vault-paycheck-history", "invalid json");

      const history = PaycheckHistoryService.getHistory();
      expect(history).toEqual([]);
    });
  });

  describe("getByPayerName", () => {
    beforeEach(() => {
      const entries: PaycheckHistoryEntry[] = [
        {
          payerName: "Acme Corp",
          lastAmountCents: 250000,
          lastDate: "2026-01-15",
          totalCount: 2,
          averageAmountCents: 245000,
        },
        {
          payerName: "TechCo Inc",
          lastAmountCents: 300000,
          lastDate: "2026-01-20",
          totalCount: 1,
          averageAmountCents: 300000,
        },
      ];

      localStorage.setItem("violet-vault-paycheck-history", JSON.stringify(entries));
    });

    it("should find entry by exact name", () => {
      const entry = PaycheckHistoryService.getByPayerName("Acme Corp");
      expect(entry).not.toBeNull();
      expect(entry?.payerName).toBe("Acme Corp");
      expect(entry?.lastAmountCents).toBe(250000);
    });

    it("should find entry case-insensitively", () => {
      const entry = PaycheckHistoryService.getByPayerName("acme corp");
      expect(entry).not.toBeNull();
      expect(entry?.payerName).toBe("Acme Corp");
    });

    it("should return null for non-existent employer", () => {
      const entry = PaycheckHistoryService.getByPayerName("Nonexistent");
      expect(entry).toBeNull();
    });

    it("should return null for empty string", () => {
      const entry = PaycheckHistoryService.getByPayerName("");
      expect(entry).toBeNull();
    });

    it("should return null for whitespace-only string", () => {
      const entry = PaycheckHistoryService.getByPayerName("   ");
      expect(entry).toBeNull();
    });
  });

  describe("addOrUpdate", () => {
    it("should add new entry when employer doesn't exist", () => {
      PaycheckHistoryService.addOrUpdate({
        payerName: "Acme Corp",
        amountCents: 250000,
        date: "2026-01-15",
      });

      const history = PaycheckHistoryService.getHistory();
      expect(history).toHaveLength(1);
      expect(history[0]).toMatchObject({
        payerName: "Acme Corp",
        lastAmountCents: 250000,
        lastDate: "2026-01-15",
        totalCount: 1,
        averageAmountCents: 250000,
      });
    });

    it("should update existing entry when employer exists", () => {
      // Add first paycheck
      PaycheckHistoryService.addOrUpdate({
        payerName: "Acme Corp",
        amountCents: 240000,
        date: "2026-01-01",
      });

      // Add second paycheck
      PaycheckHistoryService.addOrUpdate({
        payerName: "Acme Corp",
        amountCents: 260000,
        date: "2026-01-15",
      });

      const history = PaycheckHistoryService.getHistory();
      expect(history).toHaveLength(1);
      expect(history[0]).toMatchObject({
        payerName: "Acme Corp",
        lastAmountCents: 260000, // Latest amount
        lastDate: "2026-01-15", // Latest date
        totalCount: 2,
        averageAmountCents: 250000, // (240000 + 260000) / 2
      });
    });

    it("should handle case-insensitive updates", () => {
      PaycheckHistoryService.addOrUpdate({
        payerName: "Acme Corp",
        amountCents: 250000,
        date: "2026-01-01",
      });

      PaycheckHistoryService.addOrUpdate({
        payerName: "acme corp", // Different case
        amountCents: 260000,
        date: "2026-01-15",
      });

      const history = PaycheckHistoryService.getHistory();
      expect(history).toHaveLength(1); // Should update, not create new
      expect(history[0]?.totalCount).toBe(2);
    });

    it("should trim whitespace from payer name", () => {
      PaycheckHistoryService.addOrUpdate({
        payerName: "  Acme Corp  ",
        amountCents: 250000,
        date: "2026-01-15",
      });

      const history = PaycheckHistoryService.getHistory();
      expect(history[0]?.payerName).toBe("Acme Corp"); // Trimmed
    });

    it("should reject empty payer name", () => {
      PaycheckHistoryService.addOrUpdate({
        payerName: "",
        amountCents: 250000,
        date: "2026-01-15",
      });

      const history = PaycheckHistoryService.getHistory();
      expect(history).toHaveLength(0); // Not added
    });

    it("should reject zero amount", () => {
      PaycheckHistoryService.addOrUpdate({
        payerName: "Acme Corp",
        amountCents: 0,
        date: "2026-01-15",
      });

      const history = PaycheckHistoryService.getHistory();
      expect(history).toHaveLength(0); // Not added
    });

    it("should reject negative amount", () => {
      PaycheckHistoryService.addOrUpdate({
        payerName: "Acme Corp",
        amountCents: -100,
        date: "2026-01-15",
      });

      const history = PaycheckHistoryService.getHistory();
      expect(history).toHaveLength(0); // Not added
    });

    it("should enforce max entries (LRU eviction)", () => {
      // Add 51 entries (max is 50)
      for (let i = 0; i < 51; i++) {
        PaycheckHistoryService.addOrUpdate({
          payerName: `Company ${i}`,
          amountCents: 250000 + i * 1000,
          date: new Date(2026, 0, i + 1).toISOString().split("T")[0]!,
        });
      }

      const history = PaycheckHistoryService.getHistory();
      expect(history).toHaveLength(50); // Max 50 entries
      expect(history.find((h) => h.payerName === "Company 0")).toBeUndefined(); // Oldest removed
      expect(history.find((h) => h.payerName === "Company 50")).toBeDefined(); // Newest kept
    });

    it("should calculate rolling average correctly", () => {
      PaycheckHistoryService.addOrUpdate({
        payerName: "Acme Corp",
        amountCents: 200000,
        date: "2026-01-01",
      });

      PaycheckHistoryService.addOrUpdate({
        payerName: "Acme Corp",
        amountCents: 300000,
        date: "2026-01-15",
      });

      PaycheckHistoryService.addOrUpdate({
        payerName: "Acme Corp",
        amountCents: 250000,
        date: "2026-02-01",
      });

      const entry = PaycheckHistoryService.getByPayerName("Acme Corp");
      expect(entry?.totalCount).toBe(3);
      expect(entry?.averageAmountCents).toBe(250000); // (200000 + 300000 + 250000) / 3
    });
  });

  describe("getRecentPayers", () => {
    beforeEach(() => {
      const entries: PaycheckHistoryEntry[] = [
        {
          payerName: "Company A",
          lastAmountCents: 250000,
          lastDate: "2026-01-01",
          totalCount: 1,
          averageAmountCents: 250000,
        },
        {
          payerName: "Company B",
          lastAmountCents: 260000,
          lastDate: "2026-01-15",
          totalCount: 1,
          averageAmountCents: 260000,
        },
        {
          payerName: "Company C",
          lastAmountCents: 270000,
          lastDate: "2026-01-20",
          totalCount: 1,
          averageAmountCents: 270000,
        },
      ];

      localStorage.setItem("violet-vault-paycheck-history", JSON.stringify(entries));
    });

    it("should return recent payers sorted by date", () => {
      const payers = PaycheckHistoryService.getRecentPayers();
      expect(payers).toEqual(["Company C", "Company B", "Company A"]); // Newest first
    });

    it("should respect limit parameter", () => {
      const payers = PaycheckHistoryService.getRecentPayers(2);
      expect(payers).toHaveLength(2);
      expect(payers).toEqual(["Company C", "Company B"]);
    });

    it("should return empty array when no history", () => {
      localStorage.clear();
      const payers = PaycheckHistoryService.getRecentPayers();
      expect(payers).toEqual([]);
    });

    it("should default to 10 items", () => {
      // Add 15 entries
      for (let i = 0; i < 15; i++) {
        PaycheckHistoryService.addOrUpdate({
          payerName: `Company ${i}`,
          amountCents: 250000,
          date: new Date(2026, 0, i + 1).toISOString().split("T")[0]!,
        });
      }

      const payers = PaycheckHistoryService.getRecentPayers();
      expect(payers).toHaveLength(10); // Default limit
    });
  });

  describe("detectFrequency", () => {
    it("should return null for non-existent employer", () => {
      const frequency = PaycheckHistoryService.detectFrequency("Nonexistent");
      expect(frequency).toBeNull();
    });

    it("should return null when totalCount < 2", () => {
      PaycheckHistoryService.addOrUpdate({
        payerName: "Acme Corp",
        amountCents: 250000,
        date: "2026-01-15",
      });

      const frequency = PaycheckHistoryService.detectFrequency("Acme Corp");
      expect(frequency).toBeNull(); // Not enough data
    });

    it("should return null (algorithm not implemented yet)", () => {
      // Add multiple paychecks
      PaycheckHistoryService.addOrUpdate({
        payerName: "Acme Corp",
        amountCents: 250000,
        date: "2026-01-01",
      });

      PaycheckHistoryService.addOrUpdate({
        payerName: "Acme Corp",
        amountCents: 250000,
        date: "2026-01-15",
      });

      const frequency = PaycheckHistoryService.detectFrequency("Acme Corp");
      // TODO: Implement frequency detection algorithm
      expect(frequency).toBeNull();
    });
  });

  describe("clear", () => {
    it("should clear all history", () => {
      PaycheckHistoryService.addOrUpdate({
        payerName: "Acme Corp",
        amountCents: 250000,
        date: "2026-01-15",
      });

      expect(PaycheckHistoryService.getHistory()).toHaveLength(1);

      PaycheckHistoryService.clear();

      expect(PaycheckHistoryService.getHistory()).toHaveLength(0);
    });

    it("should not throw when clearing empty history", () => {
      expect(() => PaycheckHistoryService.clear()).not.toThrow();
    });
  });

  describe("Edge Cases", () => {
    it("should handle very large amounts", () => {
      PaycheckHistoryService.addOrUpdate({
        payerName: "Acme Corp",
        amountCents: 99_999_999, // $999,999.99
        date: "2026-01-15",
      });

      const entry = PaycheckHistoryService.getByPayerName("Acme Corp");
      expect(entry?.lastAmountCents).toBe(99_999_999);
    });

    it("should handle very small amounts", () => {
      PaycheckHistoryService.addOrUpdate({
        payerName: "Acme Corp",
        amountCents: 100, // $1.00
        date: "2026-01-15",
      });

      const entry = PaycheckHistoryService.getByPayerName("Acme Corp");
      expect(entry?.lastAmountCents).toBe(100);
    });

    it("should handle special characters in payer name", () => {
      PaycheckHistoryService.addOrUpdate({
        payerName: "Acme Corp & Associates, Inc.",
        amountCents: 250000,
        date: "2026-01-15",
      });

      const entry = PaycheckHistoryService.getByPayerName("Acme Corp & Associates, Inc.");
      expect(entry).not.toBeNull();
      expect(entry?.payerName).toBe("Acme Corp & Associates, Inc.");
    });

    it("should handle unicode characters in payer name", () => {
      PaycheckHistoryService.addOrUpdate({
        payerName: "Café René",
        amountCents: 250000,
        date: "2026-01-15",
      });

      const entry = PaycheckHistoryService.getByPayerName("Café René");
      expect(entry).not.toBeNull();
      expect(entry?.payerName).toBe("Café René");
    });
  });
});
