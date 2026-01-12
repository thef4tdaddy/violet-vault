/**
 * Tests for Bill Operations (Bills as Scheduled Transactions)
 * Minimal test suite - validates core bill functionality
 * TODO: Expand test coverage incrementally
 *
 * @vitest-environment jsdom
 */
import { describe, it, expect } from "vitest";
import { validateBill } from "@/domain/schemas/bill";

describe("Bill Operations", () => {
  describe("Schema Validation", () => {
    it("should validate a bill as a scheduled expense transaction", () => {
      const bill = {
        id: "bill_1",
        description: "Electric Bill",
        date: "2024-02-15",
        amount: -150,
        type: "expense" as const,
        isScheduled: true,
        envelopeId: "envelope_1",
        category: "utilities",
        lastModified: Date.now(),
        createdAt: Date.now(),
      };

      expect(() => validateBill(bill)).not.toThrow();
      expect(bill.type).toBe("expense");
      expect(bill.isScheduled).toBe(true);
      expect(bill.amount).toBeLessThan(0);
    });

    it("should validate a recurring bill with recurrence rule", () => {
      const bill = {
        id: "bill_2",
        description: "Monthly Rent",
        date: "2024-02-01",
        amount: -1200,
        type: "expense" as const,
        isScheduled: true,
        recurrenceRule: "FREQ=MONTHLY",
        envelopeId: "envelope_2",
        category: "rent",
        lastModified: Date.now(),
        createdAt: Date.now(),
      };

      expect(() => validateBill(bill)).not.toThrow();
      expect(bill.recurrenceRule).toBe("FREQ=MONTHLY");
    });
  });
});
